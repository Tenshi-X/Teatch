import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';
import { uuid_ossp } from '@electric-sql/pglite/contrib/uuid_ossp';
import { fixtures, correctInput } from './fixtures';
import { validateWorksheet, hydrateQuestion } from '@/lib/learning/contracts';
import { gradeAnswer } from '@/lib/learning/scoring';
import type { Question } from '@/types';
let db: PGlite;
const legacyQuestionId = randomUUID(),
  legacyAttemptId = randomUUID();
async function scalar<T = string>(
  sql: string,
  args: unknown[] = []
): Promise<T> {
  const r = await db.query<Record<string, T>>(sql, args);
  return Object.values(r.rows[0])[0];
}
before(async () => {
  db = new PGlite({ extensions: { uuid_ossp } });
  await db.waitReady;
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_user::text $$;
    CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    CREATE TABLE storage.objects(id uuid DEFAULT gen_random_uuid(),bucket_id text,name text); ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql AS $$ SELECT (string_to_array($1,'/'))[1:array_length(string_to_array($1,'/'),1)-1] $$;
    GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated,service_role;
    GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA storage TO authenticated,service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon,authenticated,service_role;`);
  for (const name of [
    '001_initial_schema.sql',
    '002_add_onboarding_and_subscriptions.sql',
    '003_add_admin_roles.sql',
    '004_add_worksheet_quota.sql',
  ])
    await db.exec(await readFile(`supabase/migrations/${name}`, 'utf8'));
  await db.exec("INSERT INTO subjects(name,level)VALUES('Matematika','SD')");
  const uid = randomUUID();
  await db.query(
    "INSERT INTO auth.users(id,email)VALUES($1,'legacy@example.test')",
    [uid]
  );
  const parent = await scalar('SELECT id FROM profiles WHERE auth_user_id=$1', [
    uid,
  ]);
  const child = await scalar(
    "INSERT INTO children(parent_id,name,birth_date,level,grade)VALUES($1,'Lama','2018-01-01','SD','Kelas 2')RETURNING id",
    [parent]
  );
  const subject = await scalar(
    "SELECT id FROM subjects WHERE level='SD' LIMIT 1"
  );
  const worksheet = await scalar(
    "INSERT INTO worksheets(child_id,subject_id,title,difficulty,question_type,question_count,ai_response)VALUES($1,$2,'Latihan lama','mudah','matching',1,$3)RETURNING id",
    [child, subject, { title: 'Latihan lama', questions: [fixtures[3]] }]
  );
  await db.query(
    "INSERT INTO questions(id,worksheet_id,type,question,answer,explanation,options,order_index)VALUES($1,$2,'matching',$3,$4,$5,'[]',0)",
    [
      legacyQuestionId,
      worksheet,
      fixtures[3].question,
      fixtures[3].answer,
      fixtures[3].explanation,
    ]
  );
  await db.query(
    "INSERT INTO attempts(id,worksheet_id,child_id,score,status)VALUES($1,$2,$3,83.5,'completed')",
    [legacyAttemptId, worksheet, child]
  );
  await db.exec(
    await readFile('supabase/migrations/005_reliable_learning.sql', 'utf8')
  );
});
after(async () => {
  await db?.close();
});
async function account(quota = 30) {
  const uid = randomUUID();
  await db.query('INSERT INTO auth.users(id,email)VALUES($1,$2)', [
    uid,
    `${uid}@example.test`,
  ]);
  const parent = await scalar('SELECT id FROM profiles WHERE auth_user_id=$1', [
    uid,
  ]);
  await db.query(
    "UPDATE profiles SET subscription_tier='basic',worksheet_quota=$2 WHERE id=$1",
    [parent, quota]
  );
  const child = await scalar(
    "INSERT INTO children(parent_id,name,birth_date,level,grade)VALUES($1,'Anak','2018-01-01','SD','Kelas 2')RETURNING id",
    [parent]
  );
  const subject = await scalar(
    "SELECT id FROM subjects WHERE level='SD' LIMIT 1"
  );
  return { uid, parent, child, subject };
}
type Reservation = {
  id: string;
  created: boolean;
  status: string;
  worksheetId?: string;
};
const reserve = (p: string, key = randomUUID(), count = 5, hash = 'hash') =>
  scalar<Reservation>('SELECT reserve_generation($1,$2,$3,$4)', [
    p,
    key,
    hash,
    count,
  ]);
const balance = (p: string) =>
  scalar<number>('SELECT worksheet_quota FROM profiles WHERE id=$1', [p]);
const question = {
  type: 'short_answer',
  question: '2 + 3 = ?',
  answer: '5',
  explanation: 'Tambahkan dua dan tiga.',
};
async function worksheet(
  a: Awaited<ReturnType<typeof account>>,
  type = 'short_answer'
) {
  const r = await reserve(a.parent, randomUUID(), 1);
  const result = { title: 'Latihan', questions: [{ ...question, type }] };
  const id = await scalar('SELECT finalize_generation($1,$2,$3,$4,$5,$6)', [
    r.id,
    a.child,
    a.subject,
    { difficulty: 'mudah', questionType: type },
    result,
    {},
  ]);
  await db.query('SELECT update_worksheet_content($1,$2,$3)', [
    a.parent,
    id,
    result,
  ]);
  const qid = await scalar('SELECT id FROM questions WHERE worksheet_id=$1', [
    id,
  ]);
  return { id, qid, r, result };
}
async function asUser<T>(uid: string, run: () => Promise<T>) {
  await db.exec('SET ROLE authenticated');
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false)", [uid]);
  try {
    return await run();
  } finally {
    await db.exec('RESET ROLE');
  }
}

test('migration: ordinary accounts cannot edit role, subscription or quota, but can edit their own name', async () => {
  const a = await account(),
    b = await account();
  await asUser(a.uid, async () => {
    for (const update of [
      "role='admin'",
      'worksheet_quota=999',
      "subscription_tier='pro'",
      'subscription_period_end=null',
    ])
      await assert.rejects(
        db.query(`UPDATE profiles SET ${update} WHERE id=$1`, [a.parent]),
        /permission denied/
      );
    await db.query("UPDATE profiles SET full_name='Nama Baru' WHERE id=$1", [
      a.parent,
    ]);
    assert.equal(
      await scalar<number>('SELECT count(*)::int FROM profiles WHERE id=$1', [
        b.parent,
      ]),
      0
    );
    await assert.rejects(
      db.query("SELECT reserve_generation($1,$2,'x',1)", [
        a.parent,
        randomUUID(),
      ]),
      /permission denied/
    );
    await assert.rejects(
      db.query('INSERT INTO attempts(worksheet_id,child_id)VALUES($1,$2)', [
        randomUUID(),
        a.child,
      ]),
      /permission denied/
    );
  });
  assert.equal(
    await scalar('SELECT full_name FROM profiles WHERE id=$1', [a.parent]),
    'Nama Baru'
  );
  await assert.rejects(
    db.query('UPDATE profiles SET worksheet_quota=-1 WHERE id=$1', [a.parent]),
    /profiles_quota_nonnegative/
  );
});
test('migration recovers stored legacy payloads without rewriting historical scores', async () => {
  const row = (
    await db.query<Question>('SELECT * FROM questions WHERE id=$1', [
      legacyQuestionId,
    ])
  ).rows[0];
  assert.equal(row.schema_version, 1);
  assert.deepEqual(
    hydrateQuestion(row),
    validateWorksheet({ title: 'Legacy', questions: [fixtures[3]] })
      .questions[0]
  );
  const attempt = (
    await db.query<{ score: string; scoring_version: number }>(
      'SELECT score,scoring_version FROM attempts WHERE id=$1',
      [legacyAttemptId]
    )
  ).rows[0];
  assert.equal(Number(attempt.score), 83.5);
  assert.equal(attempt.scoring_version, 1);
});
test('quota: concurrent queued requests and duplicate keys cannot double debit or become negative', async () => {
  const a = await account(10),
    key = randomUUID();
  const same = await Promise.all([
    reserve(a.parent, key, 5),
    reserve(a.parent, key, 5),
  ]);
  assert.equal(same[0].id, same[1].id);
  assert.equal(same.filter((r) => r.created).length, 1);
  assert.equal(await balance(a.parent), 5);
  await assert.rejects(reserve(a.parent, key, 5, 'different'), /KEY_CONFLICT/);
  const results = await Promise.allSettled([
    reserve(a.parent, randomUUID(), 5),
    reserve(a.parent, randomUUID(), 5),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(await balance(a.parent), 0);
});
test('quota: failures refund once, expired reservations are reclaimed, expired subscriptions are refused', async () => {
  const a = await account(10),
    r = await reserve(a.parent);
  await db.query("SELECT fail_generation($1,'AI_INVALID','{}')", [r.id]);
  await db.query("SELECT fail_generation($1,'AI_INVALID','{}')", [r.id]);
  assert.equal(await balance(a.parent), 10);
  assert.equal(
    (
      await reserve(
        a.parent,
        await scalar(
          'SELECT request_key FROM generation_requests WHERE id=$1',
          [r.id]
        )
      )
    ).created,
    false
  );
  const stale = await reserve(a.parent);
  await db.query(
    "UPDATE generation_requests SET created_at=now()-interval '16 minutes' WHERE id=$1",
    [stale.id]
  );
  await reserve(a.parent);
  assert.equal(await balance(a.parent), 5);
  await db.query(
    "UPDATE profiles SET subscription_period_end=now()-interval '1 day' WHERE id=$1",
    [a.parent]
  );
  await assert.rejects(reserve(a.parent), /SUBSCRIPTION_INACTIVE/);
});
test('generation: failed save rolls back worksheet and returns reservation; successful save is idempotent', async () => {
  const a = await account(10),
    r = await reserve(a.parent, randomUUID(), 1);
  await assert.rejects(
    db.query('SELECT finalize_generation($1,$2,$3,$4,$5,$6)', [
      r.id,
      a.child,
      a.subject,
      { difficulty: 'mudah', questionType: 'short_answer' },
      { title: 'Bad', questions: [{ ...question, type: 'bad' }] },
      {},
    ]),
    /questions_type_check/
  );
  assert.equal(
    await scalar<number>(
      'SELECT count(*)::int FROM worksheets WHERE child_id=$1',
      [a.child]
    ),
    0
  );
  await db.query("SELECT fail_generation($1,'SAVE_FAILED','{}')", [r.id]);
  assert.equal(await balance(a.parent), 10);
  const w = await worksheet(a);
  const replay = await scalar('SELECT finalize_generation($1,$2,$3,$4,$5,$6)', [
    w.r.id,
    a.child,
    a.subject,
    {},
    {},
    {},
  ]);
  assert.equal(replay, w.id);
  await db.query("SELECT fail_generation($1,'LATE','{}')", [w.r.id]);
  assert.equal(await balance(a.parent), 9);
  const content = await scalar<Record<string, string>>(
    'SELECT content FROM questions WHERE id=$1',
    [w.qid]
  );
  assert.equal(content.explanation, question.explanation);
});
test('attempts: answers are atomic, retries reuse result, parent review determines final score, edits freeze', async () => {
  const a = await account(),
    other = await account(),
    w = await worksheet(a, 'essay'),
    key = randomUUID();
  await assert.rejects(
    db.query('SELECT save_scored_attempt($1,$2,$3,30,$4)', [
      a.parent,
      w.id,
      key,
      [{ question_id: randomUUID(), user_answer: 'x', is_correct: true }],
    ]),
    /ANSWERS_INVALID/
  );
  assert.equal(
    await scalar<number>(
      'SELECT count(*)::int FROM attempts WHERE worksheet_id=$1',
      [w.id]
    ),
    0
  );
  const records = [
    { question_id: w.qid, user_answer: 'Jawaban bermakna', is_correct: null },
  ];
  const saved = await scalar<{
    id: string;
    score: null;
    status: string;
    scoring_version: number;
  }>('SELECT save_scored_attempt($1,$2,$3,30,$4)', [
    a.parent,
    w.id,
    key,
    records,
  ]);
  assert.equal(saved.score, null);
  assert.equal(saved.status, 'pending_review');
  assert.equal(saved.scoring_version, 2);
  const retry = await scalar<{ id: string }>(
    'SELECT save_scored_attempt($1,$2,$3,31,$4)',
    [a.parent, w.id, key, records]
  );
  assert.equal(retry.id, saved.id);
  await assert.rejects(
    db.query('SELECT update_worksheet_content($1,$2,$3)', [
      a.parent,
      w.id,
      w.result,
    ]),
    /ALREADY_ATTEMPTED/
  );
  const answerId = await scalar('SELECT id FROM answers WHERE attempt_id=$1', [
    saved.id,
  ]);
  await assert.rejects(
    db.query('SELECT review_attempt_answer($1,$2,true)', [
      other.parent,
      answerId,
    ]),
    /OWNERSHIP_INVALID/
  );
  await db.query('SELECT review_attempt_answer($1,$2,true)', [
    a.parent,
    answerId,
  ]);
  assert.equal(
    Number(await scalar('SELECT score FROM attempts WHERE id=$1', [saved.id])),
    100
  );
  await db.query('SELECT review_attempt_answer($1,$2,false)', [
    a.parent,
    answerId,
  ]);
  assert.equal(
    Number(await scalar('SELECT score FROM attempts WHERE id=$1', [saved.id])),
    100
  );
});
test('storage and child limits: paths are owned, bucket private, parallel requests obey plan limits', async () => {
  const a = await account();
  assert.equal(
    await scalar<boolean>(
      "SELECT public FROM storage.buckets WHERE id='avatars'"
    ),
    false
  );
  await asUser(a.uid, async () => {
    await db.query(
      "INSERT INTO storage.objects(bucket_id,name)VALUES('avatars',$1)",
      [`${a.uid}/photo.png`]
    );
    await assert.rejects(
      db.query(
        "INSERT INTO storage.objects(bucket_id,name)VALUES('avatars',$1)",
        [`${randomUUID()}/photo.png`]
      ),
      /row-level security/
    );
  });
  await db.query(
    "UPDATE profiles SET subscription_tier='free_trial' WHERE id=$1",
    [a.parent]
  );
  await assert.rejects(
    db.query(
      "INSERT INTO children(parent_id,name,birth_date,level)VALUES($1,'Second','2018-01-01','SD')",
      [a.parent]
    ),
    /CHILD_LIMIT/
  );
  const r = await reserve(a.parent);
  await assert.rejects(
    db.query('SELECT admin_update_profile($1,$2,300)', [
      a.parent,
      {
        role: 'user',
        subscription_tier: 'basic',
        subscription_status: 'active',
        subscription_period_end: null,
      },
    ]),
    /GENERATION_PENDING/
  );
  await db.query("SELECT fail_generation($1,'FAIL','{}')", [r.id]);
});
test('all 16 types pass real database generation, edit, save, hydrate, answer and score', async () => {
  const a = await account(60);
  for (const fixture of fixtures) {
    const result = validateWorksheet({
      title: `Latihan ${fixture.type}`,
      questions: [fixture],
    });
    const r = await reserve(a.parent, randomUUID(), 1);
    const id = await scalar('SELECT finalize_generation($1,$2,$3,$4,$5,$6)', [
      r.id,
      a.child,
      a.subject,
      { difficulty: 'mudah', questionType: fixture.type },
      result,
      {},
    ]);
    await db.query('SELECT update_worksheet_content($1,$2,$3)', [
      a.parent,
      id,
      result,
    ]);
    const stored = (
      await db.query<Question>(
        'SELECT * FROM questions WHERE worksheet_id=$1',
        [id]
      )
    ).rows[0];
    const q = hydrateQuestion(stored);
    assert.deepEqual(q, result.questions[0]);
    assert.ok(q);
    const saved = await scalar<{
      id: string;
      score: number | null;
      status: string;
    }>('SELECT save_scored_attempt($1,$2,$3,5,$4)', [
      a.parent,
      id,
      randomUUID(),
      [
        {
          question_id: stored.id,
          user_answer: correctInput(q),
          is_correct: gradeAnswer(q, correctInput(q)),
        },
      ],
    ]);
    assert.equal(
      saved.status,
      q.type === 'essay' ? 'pending_review' : 'completed'
    );
    assert.equal(Number(saved.score), q.type === 'essay' ? 0 : 100);
  }
  assert.equal(await balance(a.parent), 44);
});
test('quota audit records all changes and admin reconciliation refunds stale reservations once', async () => {
  const a = await account(),
    r = await reserve(a.parent);
  await db.query(
    "UPDATE generation_requests SET created_at=now()-interval '16 minutes' WHERE id=$1",
    [r.id]
  );
  const before = await balance(a.parent);
  await db.query('SELECT reconcile_generation_reservations()');
  assert.equal(await balance(a.parent), before + 5);
  await db.query('SELECT reconcile_generation_reservations()');
  assert.equal(await balance(a.parent), before + 5);
  const audit = await scalar<{ discrepancies: number }>('SELECT quota_audit()');
  assert.equal(audit.discrepancies, 0);
});
test('refunded repeated failures are rate limited to prevent API spending abuse', async () => {
  const a = await account(20);
  for (let i = 0; i < 20; i++) {
    const r = await reserve(a.parent, randomUUID(), 1);
    await db.query("SELECT fail_generation($1,'FAILED','{}')", [r.id]);
  }
  assert.equal(await balance(a.parent), 20);
  await assert.rejects(reserve(a.parent, randomUUID(), 1), /RATE_LIMIT/);
});
