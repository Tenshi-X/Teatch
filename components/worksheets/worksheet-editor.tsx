'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { publishWorksheet } from '@/app/actions/worksheets';
import {
  validateWorksheet,
  finalizeVisual,
  type GeneratedWorksheet,
  type GeneratedQuestion,
} from '@/lib/learning/contracts';
import { ASSET_IDS, ASSETS } from '@/lib/learning/assets';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { QuestionPreview } from './question-preview';
import { toast } from 'sonner';
const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <label className="block text-sm space-y-1">
    <span>{label}</span>
    <textarea
      className="input-base w-full"
      rows={2}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);
export function WorksheetEditor({
  id,
  initial,
  onClose,
}: {
  id: string;
  initial: GeneratedWorksheet;
  onClose?: () => void;
}) {
  const [result, setResult] = useState(initial);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const update = (
    index: number,
    transform: (q: GeneratedQuestion) => GeneratedQuestion
  ) =>
    setResult((r) => ({
      ...r,
      questions: r.questions.map((q, i) => (i === index ? transform(q) : q)),
    }));
  const save = async () => {
    setBusy(true);
    try {
      const valid = validateWorksheet(result);
      await publishWorksheet(id, valid);
      toast.success('Latihan disetujui dan tersimpan.');
      onClose?.();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Perubahan belum tersimpan.'
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-5">
      <p className="text-sm">
        Periksa kunci dan pembahasan. Perubahan manual tidak memakai kuota soal.
      </p>
      <Field
        label="Judul latihan"
        value={result.title}
        onChange={(title) => setResult({ ...result, title })}
      />
      {result.questions.map((q, i) => (
        <Card key={i} padding="lg">
          <h3 className="font-semibold mb-3">Edit soal {i + 1}</h3>
          <div className="space-y-3">
            <Field
              label="Pertanyaan"
              value={q.question}
              onChange={(question) => update(i, (q) => ({ ...q, question }))}
            />
            {'story' in q && (
              <Field
                label="Cerita"
                value={q.story}
                onChange={(story) =>
                  update(i, (q) =>
                    q.type === 'story_qa' ? { ...q, story } : q
                  )
                }
              />
            )}
            {q.type === 'essay' && (
              <Field
                label="Rubrik orang tua (2–4 inti, satu per baris)"
                value={q.rubric.join('\n')}
                onChange={(v) =>
                  update(i, (q) =>
                    q.type === 'essay' ? { ...q, rubric: v.split('\n') } : q
                  )
                }
              />
            )}
            {'options' in q && (
              <Field
                label="Pilihan / potongan (satu per baris)"
                value={q.options.join('\n')}
                onChange={(v) =>
                  update(i, (q) =>
                    'options' in q ? { ...q, options: v.split('\n') } : q
                  )
                }
              />
            )}
            {q.type === 'ordering' && (
              <Field
                label="Urutan benar (satu per baris)"
                value={q.correct_order.join('\n')}
                onChange={(v) =>
                  update(i, (q) =>
                    q.type === 'ordering'
                      ? {
                          ...q,
                          correct_order: v.split('\n'),
                          answer: v.split('\n').join(', '),
                        }
                      : q
                  )
                }
              />
            )}
            {q.type === 'matching' &&
              q.pairs.map((pair, j) => (
                <div key={j} className="grid grid-cols-2 gap-2">
                  <Field
                    label={`Pasangan ${j + 1}: kiri`}
                    value={pair.left}
                    onChange={(left) =>
                      update(i, (q) =>
                        q.type === 'matching'
                          ? {
                              ...q,
                              pairs: q.pairs.map((p, k) =>
                                k === j ? { ...p, left } : p
                              ),
                            }
                          : q
                      )
                    }
                  />
                  <Field
                    label="Kanan"
                    value={pair.right}
                    onChange={(right) =>
                      update(i, (q) =>
                        q.type === 'matching'
                          ? {
                              ...q,
                              pairs: q.pairs.map((p, k) =>
                                k === j ? { ...p, right } : p
                              ),
                            }
                          : q
                      )
                    }
                  />
                </div>
              ))}
            {q.type === 'image_matching' &&
              q.pairs.map((pair, j) => (
                <label key={j} className="block text-sm">
                  Gambar pasangan {j + 1}
                  <select
                    className="input-base"
                    value={pair.left}
                    onChange={(e) =>
                      update(i, (q) =>
                        q.type === 'image_matching'
                          ? finalizeVisual({
                              ...q,
                              pairs: q.pairs.map((p, k) =>
                                k === j
                                  ? {
                                      left: e.target
                                        .value as (typeof ASSET_IDS)[number],
                                      right: '',
                                    }
                                  : p
                              ),
                            })
                          : q
                      )
                    }
                  >
                    {ASSET_IDS.map((a) => (
                      <option key={a} value={a}>
                        {ASSETS[a].label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            {q.type === 'grouping' && (
              <>
                <Field
                  label="Kategori (satu per baris)"
                  value={q.categories.join('\n')}
                  onChange={(v) =>
                    update(i, (q) =>
                      q.type === 'grouping'
                        ? { ...q, categories: v.split('\n') }
                        : q
                    )
                  }
                />
                {q.items.map((item, j) => (
                  <div className="grid grid-cols-2 gap-2" key={j}>
                    <Field
                      label="Objek"
                      value={item.name}
                      onChange={(name) =>
                        update(i, (q) =>
                          q.type === 'grouping'
                            ? {
                                ...q,
                                items: q.items.map((item, k) =>
                                  k === j ? { ...item, name } : item
                                ),
                              }
                            : q
                        )
                      }
                    />
                    <label className="text-sm">
                      Kategori
                      <select
                        className="input-base"
                        value={item.category}
                        onChange={(e) =>
                          update(i, (q) =>
                            q.type === 'grouping'
                              ? {
                                  ...q,
                                  items: q.items.map((item, k) =>
                                    k === j
                                      ? { ...item, category: e.target.value }
                                      : item
                                  ),
                                }
                              : q
                          )
                        }
                      >
                        {q.categories.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </>
            )}
            {'asset_id' in q && (
              <label className="block text-sm">
                Objek
                <select
                  className="input-base"
                  value={q.asset_id}
                  onChange={(e) =>
                    update(i, (q) =>
                      'asset_id' in q
                        ? finalizeVisual({
                            ...q,
                            asset_id: e.target
                              .value as (typeof ASSET_IDS)[number],
                          })
                        : q
                    )
                  }
                >
                  {ASSET_IDS.map((a) => (
                    <option key={a} value={a}>
                      {ASSETS[a].label}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {q.type === 'count_image' && (
              <label className="block text-sm">
                Jumlah objek
                <input
                  type="number"
                  className="input-base"
                  min={1}
                  max={20}
                  value={q.count}
                  onChange={(e) =>
                    update(i, (q) =>
                      q.type === 'count_image'
                        ? finalizeVisual({
                            ...q,
                            count: Number(e.target.value),
                          })
                        : q
                    )
                  }
                />
              </label>
            )}
            {q.type === 'image_label' && (
              <label className="block text-sm">
                Bagian tumbuhan
                <select
                  className="input-base"
                  value={q.label_target}
                  onChange={(e) =>
                    update(i, (q) =>
                      q.type === 'image_label'
                        ? finalizeVisual({
                            ...q,
                            label_target: e.target.value as
                              'leaf' | 'stem' | 'root',
                          })
                        : q
                    )
                  }
                >
                  <option value="leaf">Daun</option>
                  <option value="stem">Batang</option>
                  <option value="root">Akar</option>
                </select>
              </label>
            )}
            {q.type === 'choose_image' && (
              <div>
                {q.image_options.map((a, j) => (
                  <select
                    aria-label={`Gambar pilihan ${j + 1}`}
                    className="input-base my-2"
                    value={a}
                    key={j}
                    onChange={(e) =>
                      update(i, (q) =>
                        q.type === 'choose_image'
                          ? {
                              ...q,
                              image_options: q.image_options.map((id, k) =>
                                k === j
                                  ? (e.target
                                      .value as (typeof ASSET_IDS)[number])
                                  : id
                              ),
                            }
                          : q
                      )
                    }
                  >
                    {ASSET_IDS.map((id) => (
                      <option value={id} key={id}>
                        {ASSETS[id].label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            )}
            {q.type === 'true_false' ? (
              <label className="block text-sm">
                Kunci jawaban
                <select
                  className="input-base"
                  value={q.answer}
                  onChange={(e) =>
                    update(i, (q) =>
                      q.type === 'true_false'
                        ? { ...q, answer: e.target.value as 'Benar' | 'Salah' }
                        : q
                    )
                  }
                >
                  <option>Benar</option>
                  <option>Salah</option>
                </select>
              </label>
            ) : (
              <Field
                label={q.type === 'essay' ? 'Contoh jawaban' : 'Kunci jawaban'}
                value={q.answer}
                onChange={(answer) =>
                  update(i, (q) =>
                    q.type === 'true_false' ? q : { ...q, answer }
                  )
                }
              />
            )}
            <Field
              label={
                q.type === 'essay'
                  ? 'Panduan penilaian orang tua'
                  : 'Pembahasan'
              }
              value={q.explanation}
              onChange={(explanation) =>
                update(i, (q) => ({ ...q, explanation }))
              }
            />
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm">
              Lihat pratinjau
            </summary>
            <QuestionPreview question={q} index={i} showAnswer />
          </details>
        </Card>
      ))}
      <Button isLoading={busy} onClick={save}>
        Simpan dan setujui latihan
      </Button>
    </div>
  );
}
