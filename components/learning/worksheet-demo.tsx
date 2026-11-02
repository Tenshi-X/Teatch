'use client';

import { useState } from 'react';
import { BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const options = ['4 apel', '5 apel', '6 apel', '11 apel'];

export function WorksheetDemo() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = answer === '5 apel';
  return (
    <section
      id="contoh-latihan"
      aria-labelledby="demo-title"
      className="practice-sheet scroll-mt-28"
    >
      <header className="flex items-start justify-between gap-4 border-b border-[var(--card-border)] pb-4">
        <div>
          <h2 id="demo-title" className="text-lg font-semibold">
            Coba satu soal
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Contoh Matematika · SD kelas 2
          </p>
        </div>
        <BookOpen
          size={24}
          className="shrink-0 text-[var(--accent-color)]"
          aria-hidden="true"
        />
      </header>
      <fieldset className="mt-6 min-w-0">
        <legend className="text-xl font-medium leading-relaxed">
          Ibu membeli 8 apel, lalu memberikan 3 apel kepada tetangga. Berapa
          apel yang tersisa?
        </legend>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {options.map((option, index) => (
            <button
              type="button"
              key={option}
              aria-pressed={answer === option}
              className="answer-choice flex items-center gap-3"
              onClick={() => {
                setAnswer(option);
                setChecked(false);
              }}
            >
              <span data-answer-label className="text-sm font-semibold">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="flex-1">{option}</span>
              {answer === option && <Check size={18} aria-hidden="true" />}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5" role="status">
        {checked && (
          <div className="rounded-lg bg-[var(--note-bg)] p-4 text-base text-[var(--note-text)]">
            <p className="font-semibold">
              {correct ? 'Benar, tersisa 5 apel.' : 'Mari hitung bersama.'}
            </p>
            <p className="mt-1">
              Dari 8 apel, diberikan 3. Jadi, 8 − 3 = 5 apel.
            </p>
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          disabled={!answer}
          onClick={() => {
            if (checked) {
              setAnswer(null);
              setChecked(false);
            } else setChecked(true);
          }}
        >
          {checked ? 'Coba lagi' : 'Periksa jawaban'}
        </Button>
        <p className="text-sm text-[var(--text-muted)]">
          Contoh ini tidak memakai kuota.
        </p>
      </div>
    </section>
  );
}
