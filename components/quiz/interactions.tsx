'use client';
import { useState } from 'react';
import type { GeneratedQuestion } from '@/lib/learning/contracts';
import { AssetVisual, PlantVisual } from '@/components/worksheets/asset-visual';
import { MathText } from '@/components/ui/math-text';
import { ASSETS, type AssetId } from '@/lib/learning/assets';
const parse = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};
const mapValue = (v: unknown): Record<string, string> =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, string>)
    : {};
const choiceClass = (selected: boolean) =>
  `border-2 rounded-lg p-3 text-left ${selected ? 'border-primary-500 bg-primary-50 text-surface-900' : 'border-surface-200'}`;

export function QuestionInput({
  question: q,
  value,
  onChange,
}: {
  question: GeneratedQuestion;
  value: string;
  onChange: (v: string) => void;
}) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  if (q.type === 'multiple_choice' || q.type === 'true_false') {
    const options =
      q.type === 'multiple_choice' ? q.options : ['Benar', 'Salah'];
    return (
      <div className="grid gap-3" role="group" aria-label="Pilihan jawaban">
        {options.map((o, i) => (
          <button
            key={i}
            className={choiceClass(value === o)}
            aria-pressed={value === o}
            onClick={() => onChange(o)}
          >
            <MathText content={o} />
          </button>
        ))}
      </div>
    );
  }
  if (
    q.type === 'word_jumble' ||
    q.type === 'sentence_jumble' ||
    q.type === 'ordering'
  ) {
    const raw = parse(value);
    const selected: string[] = Array.isArray(raw)
      ? raw.filter((v): v is string => typeof v === 'string')
      : [];
    const used = new Set<number>();
    selected.forEach((s) => {
      const i = q.options.findIndex((v, i) => v === s && !used.has(i));
      if (i >= 0) used.add(i);
    });
    return (
      <div className="space-y-4">
        <p className="text-sm">
          Klik potongan sesuai urutan. Klik kembali untuk menghapus.
        </p>
        <div className="min-h-20 border-2 border-dashed rounded-lg p-3 flex flex-wrap gap-2">
          {selected.map((s, i) => (
            <button
              key={i}
              className="border rounded p-2"
              onClick={() =>
                onChange(JSON.stringify(selected.filter((_, j) => i !== j)))
              }
            >
              <MathText content={s} />
              <span aria-hidden> ×</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {q.options.map(
            (s, i) =>
              !used.has(i) && (
                <button
                  key={i}
                  className="border rounded p-3"
                  onClick={() => onChange(JSON.stringify([...selected, s]))}
                >
                  <MathText content={s} />
                </button>
              )
          )}
        </div>
      </div>
    );
  }
  if (q.type === 'matching' || q.type === 'image_matching') {
    const selected = mapValue(parse(value));
    const right = [...q.pairs.slice(1), q.pairs[0]].map((p) => p.right);
    return (
      <div>
        <p className="text-sm mb-3">
          Pilih objek di kiri, lalu pasangannya di kanan.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            {q.pairs.map((p) => (
              <button
                key={p.left}
                className={choiceClass(selectedLeft === p.left)}
                onClick={() => setSelectedLeft(p.left)}
                aria-pressed={selectedLeft === p.left}
              >
                {q.type === 'image_matching' ? (
                  <AssetVisual id={p.left as AssetId} />
                ) : (
                  <MathText content={p.left} />
                )}
                <span className="text-xs">
                  {selected[p.left] || 'Belum dipasangkan'}
                </span>
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            {right.map((r) => (
              <button
                key={r}
                className="border rounded p-3"
                disabled={!selectedLeft}
                onClick={() => {
                  if (selectedLeft) {
                    const updated = { ...selected };
                    Object.keys(updated).forEach((k) => {
                      if (updated[k] === r) delete updated[k];
                    });
                    updated[selectedLeft] = r;
                    onChange(JSON.stringify(updated));
                    setSelectedLeft(null);
                  }
                }}
              >
                <MathText content={r} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (q.type === 'grouping') {
    const selected = mapValue(parse(value));
    return (
      <div className="space-y-3">
        {q.items.map((item) => (
          <label
            className="flex items-center justify-between gap-3"
            key={item.name}
          >
            <MathText content={item.name} />
            <select
              className="input-base max-w-64"
              value={selected[item.name] || ''}
              onChange={(e) => {
                const next = { ...selected };
                if (e.target.value) next[item.name] = e.target.value;
                else delete next[item.name];
                onChange(Object.keys(next).length ? JSON.stringify(next) : '');
              }}
            >
              <option value="">Pilih kategori</option>
              {q.categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    );
  }
  if (q.type === 'choose_image')
    return (
      <div className="grid grid-cols-2 gap-4">
        {q.image_options.map((id) => (
          <button
            key={id}
            aria-label={`Pilih gambar ${ASSETS[id].label}`}
            aria-pressed={value === id}
            className={choiceClass(value === id)}
            onClick={() => onChange(id)}
          >
            <AssetVisual id={id} />
          </button>
        ))}
      </div>
    );
  return (
    <div>
      {'asset_id' in q && (
        <AssetVisual
          id={q.asset_id}
          count={q.type === 'count_image' ? q.count : 1}
        />
      )}{' '}
      {q.type === 'image_label' && <PlantVisual target={q.label_target} />}
      <label className="block">
        <span className="text-sm">Jawaban</span>
        {q.type === 'essay' ? (
          <textarea
            className="input-base w-full"
            rows={6}
            maxLength={5000}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="input-base w-full"
            type={q.type === 'count_image' ? 'number' : 'text'}
            maxLength={1000}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </label>
    </div>
  );
}
