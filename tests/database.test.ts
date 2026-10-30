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
import { buildInsights, type AnswerEvidence } from '@/lib/learning/insights';
import type { LearningTopic } from '@/lib/learning/summary';
import { GenerateContentResponse, FinishReason } from '@google/genai';
import { generateWorksheetWithFallback } from '@/services/ai/fallback';
import { fulfillGeneration, PipelineError } from '@/services/ai/pipeline';
let db: PGlite;
let legacyDraft: Awaited<ReturnType<typeof worksheet>> & { parent: string };
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
  const legacyWorksheet = await scalar(
    "INSERT INTO worksheets(child_id,subject_id,title,difficulty,question_type,question_count,ai_response)VALUES($1,$2,'Latihan lama','mudah','matching',1,$3)RETURNING id",
    [child, subject, { title: 'Latihan lama', questions: [fixtures[3]] }]
  );
  await db.query(
    "INSERT INTO questions(id,worksheet_id,type,question,answer,explanation,options,order_index)VALUES($1,$2,'matching',$3,$4,$5,'[]',0)",
    [
      legacyQuestionId,
      legacyWorksheet,
      fixtures[3].question,
      fixtures[3].answer,
      fixtures[3].explanation,
    ]
  );
  await db.query(
    "INSERT INTO attempts(id,worksheet_id,child_id,score,status)VALUES($1,$2,$3,83.5,'completed')",
    [legacyAttemptId, legacyWorksheet, child]
  );
  await db.exec(
    await readFile('supabase/migrations/005_reliable_learning.sql', 'utf8')
  );
  await db.exec(
    await readFile('supabase/migrations/006_runtime_readiness.sql', 'utf8')
  );
  const draftOwner = await account(10);
  legacyDraft = { ...(await worksheet(draftOwner)), parent: draftOwner.parent };
  assert.equal(
    await scalar('SELECT status FROM worksheets WHERE id=$1', [legacyDraft.id]),
    'draft'
  );
  await db.exec(
    await readFile('supabase/migrations/007_ready_worksheets.sql', 'utf8')
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
test('ready worksheet migration is repeatable and preserves existing draft content and quota', async () => {
  await db.exec(
    await readFile('supabase/migrations/007_ready_worksheets.sql', 'utf8')
  );
  assert.equal(
    await scalar('SELECT status FROM worksheets WHERE id=$1', [legacyDraft.id]),
    'generated'
  );
  assert.deepEqual(
    await scalar('SELECT ai_response FROM worksheets WHERE id=$1', [
      legacyDraft.id,
    ]),
    legacyDraft.result
  );
  const stored = (
    await db.query<Question>('SELECT * FROM questions WHERE id=$1', [
      legacyDraft.qid,
    ])
  ).rows[0];
  assert.deepEqual(hydrateQuestion(stored), legacyDraft.result.questions[0]);
  assert.equal(await balance(legacyDraft.parent), 9);
  assert.equal(
    await scalar(
      "SELECT to_regprocedure('public.update_worksheet_content(uuid,uuid,jsonb)')"
    ),
    null
  );
});
test('generated worksheets are immediately ready and users cannot edit content before an attempt', async () => {
  const a = await account(),
    w = await worksheet(a);
  assert.equal(
    await scalar('SELECT status FROM worksheets WHERE id=$1', [w.id]),
    'generated'
  );
  await asUser(a.uid, async () => {
    await assert.rejects(
      db.query("UPDATE worksheets SET title='Changed' WHERE id=$1", [w.id]),
      /permission denied/
    );
    for (const update of ["question='Changed'", "answer='999'", "content='{}'"])
      await assert.rejects(
        db.query(`UPDATE questions SET ${update} WHERE id=$1`, [w.qid]),
        /permission denied/
      );
    await assert.rejects(
      db.query('SELECT update_worksheet_content($1,$2,$3)', [
        a.parent,
        w.id,
        w.result,
      ]),
      /does not exist/
    );
  });
  await assert.rejects(
    db.query("UPDATE worksheets SET status='draft' WHERE id=$1", [w.id]),
    /worksheets_status_check/
  );
  assert.equal(
    await scalar('SELECT answer FROM questions WHERE id=$1', [w.qid]),
    '5'
  );
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
test('attempts: answers are atomic, retries reuse result, parent review determines final score', async () => {
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
test('all 16 types pass real database generation, immediate practice, hydrate, answer and score', async () => {
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
    assert.equal(
      await scalar('SELECT status FROM worksheets WHERE id=$1', [id]),
      'generated'
    );
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
test('fallback keeps one database reservation, one worksheet or refund, and stores every model attempt', async () => {
  for (const succeeds of [true, false]) {
    const a = await account(20),
      key = randomUUID();
    const reservation = await reserve(a.parent, key, 1);
    let calls = 0;
    const pending = fulfillGeneration({
      generate: () =>
        generateWorksheetWithFallback(
          {
            age: 8,
            level: 'SD',
            grade: 'Kelas 2',
            subject: 'Matematika',
            questionType: 'short_answer',
            difficulty: 'mudah',
            questionCount: 1,
          },
          {
            generateContent: async () => {
              calls++;
              if (calls === 1 || !succeeds) throw { status: 429 };
              const response = new GenerateContentResponse();
              response.candidates = [
                {
                  content: {
                    parts: [
                      {
                        text: JSON.stringify({
                          title: 'Latihan fallback',
                          questions: [fixtures[2]],
                        }),
                      },
                    ],
                  },
                  finishReason: FinishReason.STOP,
                },
              ];
              response.usageMetadata = {
                promptTokenCount: 100,
                candidatesTokenCount: 60,
                thoughtsTokenCount: 20,
                totalTokenCount: 180,
              };
              return response;
            },
          }
        ),
      save: ({ worksheet, usage }) =>
        scalar('SELECT finalize_generation($1,$2,$3,$4,$5,$6)', [
          reservation.id,
          a.child,
          a.subject,
          { difficulty: 'mudah', questionType: 'short_answer' },
          worksheet,
          usage,
        ]),
      release: (code, usage) =>
        scalar('SELECT fail_generation($1,$2,$3)', [
          reservation.id,
          code,
          usage,
        ]),
    });
    if (succeeds) assert.ok(await pending);
    else await assert.rejects(pending, PipelineError);
    assert.equal(calls, succeeds ? 2 : 3);
    assert.equal(await balance(a.parent), succeeds ? 19 : 20);
    assert.equal(
      await scalar('SELECT count(*)::int FROM worksheets WHERE child_id=$1', [
        a.child,
      ]),
      succeeds ? 1 : 0
    );
    assert.equal(
      await scalar(
        'SELECT count(*)::int FROM generation_requests WHERE parent_id=$1',
        [a.parent]
      ),
      1
    );
    const stored = await scalar<{
      model: string;
      calls: number;
      metered: boolean;
      attempts: unknown[];
    }>('SELECT usage FROM generation_requests WHERE id=$1', [reservation.id]);
    assert.equal(stored.calls, calls);
    assert.equal(
      stored.model,
      succeeds ? 'gemini-3.5-flash-lite' : 'gemini-3.6-flash'
    );
    assert.equal(stored.attempts.length, calls);
    assert.equal(stored.metered, false);
    assert.equal((await reserve(a.parent, key, 1)).created, false);
    assert.equal(await balance(a.parent), succeeds ? 19 : 20);
  }
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

test('database summaries match local scoring rules, exclude legacy/pending/old evidence and isolate parents', async () => {
  const a = await account(),
    b = await account(),
    w = await worksheet(a),
    other = await worksheet(b);
  await db.query("UPDATE worksheets SET topic='',objective_id='' WHERE id=$1", [
    w.id,
  ]);
  for (let i = 0; i < 13; i++) {
    const aid = randomUUID();
    await db.query(
      `INSERT INTO attempts(id,worksheet_id,child_id,score,total_questions,correct_answers,status,scoring_version,created_at)
      VALUES($1,$2,$3,$4,1,$5,$6,$7,now()-($8||' days')::interval)`,
      [
        aid,
        w.id,
        a.child,
        i < 5 ? 0 : 100,
        i < 5 ? 0 : 1,
        i === 11 ? 'pending_review' : 'completed',
        i === 10 ? 1 : 2,
        i === 12 ? 100 : i,
      ]
    );
    await db.query(
      'INSERT INTO answers(attempt_id,question_id,is_correct)VALUES($1,$2,$3)',
      [aid, w.qid, i >= 5]
    );
  }
  await db.query(
    "INSERT INTO attempts(worksheet_id,child_id,score,total_questions,correct_answers,status,scoring_version)VALUES($1,$2,100,1,1,'completed',2)",
    [other.id, b.child]
  );
  const evidenceRows = await db.query<{
    id: string;
    score: number;
    date: Date | string;
    correct: boolean;
  }>(
    `SELECT a.id,a.score,a.created_at date,x.is_correct correct FROM attempts a JOIN answers x ON x.attempt_id=a.id WHERE a.child_id=$1 AND a.scoring_version=2 AND a.status='completed' AND a.created_at>=now()-interval '90 days' ORDER BY x.id`,
    [a.child]
  );
  const evidence: AnswerEvidence[] = evidenceRows.rows.map((r) => ({
    childId: a.child,
    subjectId: a.subject,
    subject: 'Matematika',
    topic: 'Latihan',
    objectiveId: null,
    difficulty: 'mudah',
    correct: r.correct,
    attemptId: r.id,
    score: Number(r.score),
    date: new Date(r.date).toISOString(),
  }));
  await asUser(a.uid, async () => {
    const summaries = await scalar<LearningTopic[]>(
      'SELECT learning_summary()'
    );
    assert.equal(summaries.length, 1);
    const { childId, ...topic } = summaries[0];
    assert.equal(childId, a.child);
    assert.deepEqual(topic, buildInsights(evidence)[0]);
    const overview = await scalar<
      Record<
        string,
        {
          stats: {
            totalWorksheets: number;
            totalAttempts: number;
            totalQuestions: number;
            averageScore: number;
          };
          activities: unknown[];
          pendingReviews: number;
          latestWorksheet: { id: string };
        }
      >
    >('SELECT dashboard_overview()');
    assert.deepEqual(Object.keys(overview), [a.child]);
    assert.equal(overview[a.child].stats.totalWorksheets, 1);
    assert.equal(overview[a.child].stats.totalAttempts, 11);
    assert.equal(overview[a.child].pendingReviews, 1);
    assert.equal(overview[a.child].latestWorksheet.id, w.id);
    assert.equal(overview[a.child].activities.length, 5);
    await assert.rejects(
      db.query('SELECT admin_runtime_summary()'),
      /permission denied/
    );
  });
  const empty = await account();
  await asUser(empty.uid, async () => {
    assert.deepEqual(await scalar('SELECT learning_summary()'), []);
  });
});

test('migration 006 repairs a partial installation, commits in public and preserves data and permissions when rerun', async () => {
  const a = await account(),
    b = await account();
  const feedback = await scalar(
    'SELECT submit_product_feedback($1,NULL,$2,$3)',
    [a.parent, 'idea', 'Keep this feedback']
  );
  const eventKey = randomUUID();
  await db.query('SELECT record_product_event($1,$2,$3,NULL)', [
    a.parent,
    eventKey,
    'visit',
  ]);
  const quota = await balance(a.parent);
  const migration = await readFile(
    'supabase/migrations/006_runtime_readiness.sql',
    'utf8'
  );

  // Reproduce the reported state: other objects exist but the overview is absent.
  await db.exec(
    'DROP FUNCTION public.dashboard_overview(); CREATE SCHEMA migration_editor; SET search_path=migration_editor,public'
  );
  try {
    for (let run = 0; run < 2; run++) {
      const results = await db.exec(migration);
      assert.deepEqual(results.at(-1)?.rows, [
        {
          dashboard_ready: true,
          learning_ready: true,
          feedback_ready: true,
          events_ready: true,
          maintenance_ready: true,
          admin_ready: true,
        },
      ]);
      assert.equal(await scalar('SELECT current_schema()'), 'migration_editor');
    }
    assert.equal(
      await scalar(
        "SELECT count(*)::int FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='migration_editor'"
      ),
      0
    );
  } finally {
    await db.exec('RESET search_path');
  }

  assert.equal(await balance(a.parent), quota);
  assert.equal(
    await scalar('SELECT id FROM public.product_feedback WHERE id=$1', [
      feedback,
    ]),
    feedback
  );
  assert.equal(
    await scalar(
      'SELECT count(*)::int FROM public.product_events WHERE event_key=$1',
      [eventKey]
    ),
    1
  );
  await asUser(a.uid, async () => {
    const overview = await scalar<Record<string, unknown>>(
      'SELECT public.dashboard_overview()'
    );
    assert.deepEqual(Object.keys(overview), [a.child]);
    assert.deepEqual(
      await scalar(
        'SELECT public.learning_summary(p_since => $1::timestamptz)',
        [new Date().toISOString()]
      ),
      []
    );
    assert.equal(
      await scalar(
        'SELECT count(*)::int FROM public.product_feedback WHERE id=$1',
        [feedback]
      ),
      1
    );
    await assert.rejects(
      db.query('SELECT public.maintain_runtime()'),
      /permission denied/
    );
  });
  await asUser(b.uid, async () => {
    assert.equal(
      await scalar(
        'SELECT count(*)::int FROM public.product_feedback WHERE id=$1',
        [feedback]
      ),
      0
    );
  });
  await db.exec('SET ROLE anon');
  try {
    await assert.rejects(
      db.query('SELECT public.dashboard_overview()'),
      /permission denied/
    );
    await assert.rejects(
      db.query('SELECT public.learning_summary()'),
      /permission denied/
    );
  } finally {
    await db.exec('RESET ROLE');
  }
});

test('feedback/events enforce ownership, service-only writes, duplicate keys, rate limits and maintenance retention', async () => {
  const a = await account(),
    b = await account(),
    w = await worksheet(a);
  const id = await scalar('SELECT submit_product_feedback($1,$2,$3,$4)', [
    a.parent,
    w.id,
    'problem',
    'Contoh kendala',
  ]);
  await assert.rejects(
    db.query('SELECT submit_product_feedback($1,$2,$3,$4)', [
      b.parent,
      w.id,
      'idea',
      'Tidak boleh',
    ]),
    /OWNERSHIP_INVALID/
  );
  const key = randomUUID();
  for (let i = 0; i < 2; i++)
    await db.query('SELECT record_product_event($1,$2,$3,$4)', [
      a.parent,
      key,
      'attempt_started',
      w.id,
    ]);
  assert.equal(
    Number(
      await scalar('SELECT count(*) FROM product_events WHERE parent_id=$1', [
        a.parent,
      ])
    ),
    1
  );
  for (let i = 0; i < 59; i++)
    await db.query('SELECT record_product_event($1,$2,$3,NULL)', [
      a.parent,
      randomUUID(),
      'visit',
    ]);
  await assert.rejects(
    db.query('SELECT record_product_event($1,$2,$3,NULL)', [
      a.parent,
      randomUUID(),
      'visit',
    ]),
    /RATE_LIMIT/
  );
  await asUser(a.uid, async () => {
    assert.equal(
      (
        await scalar<{ id: string }[]>(
          'SELECT jsonb_agg(t) FROM product_feedback t'
        )
      )[0].id,
      id
    );
    await assert.rejects(
      db.query('SELECT record_product_event($1,$2,$3,NULL)', [
        a.parent,
        randomUUID(),
        'visit',
      ]),
      /permission denied/
    );
    await assert.rejects(
      db.query('SELECT maintain_runtime()'),
      /permission denied/
    );
    await assert.rejects(
      db.query(
        "INSERT INTO product_feedback(parent_id,category)VALUES($1,'idea')",
        [a.parent]
      ),
      /permission denied/
    );
  });
  await asUser(b.uid, async () =>
    assert.equal(
      Number(await scalar('SELECT count(*) FROM product_feedback')),
      0
    )
  );
  for (let i = 0; i < 4; i++)
    await db.query('SELECT submit_product_feedback($1,NULL,$2,$3)', [
      a.parent,
      'helpful',
      '',
    ]);
  await assert.rejects(
    db.query('SELECT submit_product_feedback($1,NULL,$2,$3)', [
      a.parent,
      'helpful',
      '',
    ]),
    /RATE_LIMIT/
  );
  await db.query(
    "UPDATE product_events SET created_at=now()-interval '91 days' WHERE event_key=$1",
    [key]
  );
  const r = await reserve(a.parent, randomUUID(), 1);
  await db.query(
    "UPDATE generation_requests SET created_at=now()-interval '16 minutes' WHERE id=$1",
    [r.id]
  );
  const maintenance = await scalar<{ deletedEvents: number }>(
    'SELECT maintain_runtime()'
  );
  assert.equal(maintenance.deletedEvents, 1);
  assert.equal(
    (await scalar<{ deletedEvents: number }>('SELECT maintain_runtime()'))
      .deletedEvents,
    0
  );
  const admin = await scalar<{
    profiles: { id: string }[];
    matchedUsers: number;
  }>('SELECT admin_runtime_summary(0,$1)', [a.uid]);
  assert.equal(admin.matchedUsers, 1);
  assert.equal(admin.profiles[0].id, a.parent);
  assert.equal(
    (await scalar<{ discrepancies: number }>('SELECT quota_audit()'))
      .discrepancies,
    0
  );
});
