'use client';
import { useState } from 'react';
import { submitFeedback } from '@/app/actions/feedback';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
export function FeedbackForm({ worksheetId }: { worksheetId?: string }) {
  const [category, setCategory] = useState('helpful');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);
  return (
    <Card padding="lg">
      <h2 className="text-lg font-semibold">
        Bagaimana pengalaman belajar Anda?
      </h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Masukan Anda membantu kami memperbaiki Teatch. Hindari menuliskan
        identitas pribadi anak.
      </p>
      {saved ? (
        <p className="mt-4" role="status">
          Terima kasih. Masukan Anda sudah tersimpan.
        </p>
      ) : (
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage('');
            try {
              const result = await submitFeedback({
                category,
                comment,
                ...(worksheetId ? { worksheetId } : {}),
              });
              if (result.error) setMessage(result.error);
              else setSaved(true);
            } catch {
              setMessage('Sambungan terputus. Coba kirim kembali.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <label className="block text-sm">
            Jenis masukan
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-base mt-1 w-full"
              disabled={busy}
            >
              <option value="helpful">Latihan membantu</option>
              <option value="problem">Ada kendala</option>
              <option value="idea">Usulan perbaikan</option>
            </select>
          </label>
          <label className="block text-sm">
            Komentar (opsional)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              className="input-base mt-1 w-full"
              disabled={busy}
            />
          </label>
          <Button type="submit" isLoading={busy}>
            Kirim masukan
          </Button>
          {message && (
            <p role="alert" className="text-sm">
              {message}
            </p>
          )}
        </form>
      )}
    </Card>
  );
}
