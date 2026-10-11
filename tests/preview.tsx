import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { QuestionInput } from '@/components/quiz/interactions';
import {
  QuestionContent,
  TYPE_LABELS,
} from '@/components/worksheets/question-content';
import { MathText } from '@/components/ui/math-text';
import { gradeAnswer } from '@/lib/learning/scoring';
import { fixtures } from './fixtures';
function Preview() {
  const [selected, setSelected] = useState('multiple_choice');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState(false);
  const q = fixtures.find((q) => q.type === selected)!;
  const value = answers[selected] || '';
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-5">
      <h1 className="text-2xl font-bold">Pemeriksaan lokal 16 tipe soal</h1>
      <label>
        Tipe soal
        <select
          className="input-base"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            setShowKey(false);
          }}
        >
          {fixtures.map((q) => (
            <option key={q.type} value={q.type}>
              {TYPE_LABELS[q.type]}
            </option>
          ))}
        </select>
      </label>
      <section className="card p-6 space-y-4">
        <MathText content={q.question} />
        {'story' in q && <p className="border rounded p-4">{q.story}</p>}
        <QuestionInput
          key={q.type}
          question={q}
          value={value}
          onChange={(v) => setAnswers((a) => ({ ...a, [selected]: v }))}
        />
        <output>
          Penilaian:{' '}
          {!value
            ? 'Belum dijawab'
            : gradeAnswer(q, value) === null
              ? 'Tinjauan orang tua'
              : gradeAnswer(q, value)
                ? 'Benar'
                : 'Perlu latihan'}
        </output>
        <button
          className="border rounded p-3 block"
          onClick={() => setShowKey(!showKey)}
        >
          Lihat kunci
        </button>
        {showKey && <QuestionContent question={q} showAnswer />}
      </section>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
