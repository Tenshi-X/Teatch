import type { GeneratedQuestion } from '@/lib/learning/contracts';
import { ASSETS, type AssetId } from '@/lib/learning/assets';
import { MathText } from '@/components/ui/math-text';
import { AssetVisual, PlantVisual } from './asset-visual';

export const TYPE_LABELS: Record<GeneratedQuestion['type'], string> = {
  multiple_choice: 'Pilihan ganda',
  essay: 'Uraian',
  short_answer: 'Isian singkat',
  matching: 'Menjodohkan',
  guess_image: 'Tebak gambar',
  image_matching: 'Cocokkan gambar',
  true_false: 'Benar / salah',
  word_jumble: 'Susun kata',
  sentence_jumble: 'Susun kalimat',
  ordering: 'Urutkan',
  pattern_completion: 'Lengkapi pola',
  count_image: 'Hitung gambar',
  choose_image: 'Pilih gambar',
  image_label: 'Label gambar',
  grouping: 'Kelompokkan',
  story_qa: 'Cerita pendek',
};
export function QuestionContent({
  question: q,
  showAnswer = false,
  print = false,
}: {
  question: GeneratedQuestion;
  showAnswer?: boolean;
  print?: boolean;
}) {
  return (
    <div className="space-y-3">
      {'story' in q && (
        <div className="p-4 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap">
          {q.story}
        </div>
      )}
      <MathText content={q.question} />
      {'asset_id' in q && (
        <AssetVisual
          id={q.asset_id}
          count={q.type === 'count_image' ? q.count : 1}
        />
      )}
      {q.type === 'image_label' && <PlantVisual target={q.label_target} />}
      {'options' in q && (
        <div className="flex flex-wrap gap-2">
          {q.options.map((o, i) => (
            <div key={i} className="border rounded-lg p-3">
              <MathText
                content={`${q.type === 'multiple_choice' ? `${String.fromCharCode(65 + i)}. ` : ''}${o}`}
              />
            </div>
          ))}
        </div>
      )}
      {'pairs' in q && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            {q.pairs.map((p, i) => (
              <div key={i} className="border rounded p-2 my-2">
                {q.type === 'image_matching' ? (
                  <AssetVisual id={p.left as AssetId} />
                ) : (
                  <MathText content={p.left} />
                )}
              </div>
            ))}
          </div>
          <div>
            {(showAnswer ? q.pairs : [...q.pairs.slice(1), q.pairs[0]]).map(
              (p, i) => (
                <div key={i} className="border rounded p-2 my-2">
                  <MathText content={p.right} />
                </div>
              )
            )}
          </div>
        </div>
      )}
      {q.type === 'choose_image' && (
        <div className="grid grid-cols-2 gap-3">
          {q.image_options.map((id) => (
            <div className="border rounded-lg" key={id}>
              <AssetVisual id={id} />
              {showAnswer && (
                <p className="text-center">
                  {ASSETS[id].label}
                  {id === q.answer ? ' ✓' : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {q.type === 'grouping' && (
        <>
          <p>{q.items.map((i) => i.name).join(' • ')}</p>
          <div className="grid grid-cols-2 gap-3">
            {q.categories.map((c) => (
              <div className="border rounded p-3 min-h-24" key={c}>
                <b>{c}</b>
                {showAnswer && (
                  <p>
                    {q.items
                      .filter((i) => i.category === c)
                      .map((i) => i.name)
                      .join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {q.type === 'true_false' && !showAnswer && <p>□ Benar　 □ Salah</p>}
      {showAnswer && q.type === 'essay' && (
        <div>
          <b>Rubrik orang tua:</b>
          <ul className="list-disc pl-5">
            {q.rubric.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
      {print &&
        !showAnswer &&
        [
          'essay',
          'short_answer',
          'guess_image',
          'image_label',
          'count_image',
          'pattern_completion',
          'story_qa',
          'ordering',
          'word_jumble',
          'sentence_jumble',
        ].includes(q.type) && (
          <div className="space-y-6 py-4">
            <hr />
            <hr />
            {q.type === 'essay' && (
              <>
                <hr />
                <hr />
              </>
            )}
          </div>
        )}
      {showAnswer && (
        <div className="rounded-lg border p-3 bg-primary-50 text-surface-900">
          <b>Jawaban:</b>
          <MathText content={q.answer} />
          <b>Pembahasan / panduan:</b>
          <MathText content={q.explanation} />
        </div>
      )}
    </div>
  );
}
