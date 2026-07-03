'use client';

import { useActionState } from 'react';
import { createChild, updateChild, type ChildFormState } from '@/app/actions/children';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { EDUCATION_LEVELS, GRADES_BY_LEVEL, type EducationLevel, type Child } from '@/types';
import { useState, useMemo } from 'react';

interface ChildFormProps {
  child?: Child;
  mode: 'create' | 'edit';
}

export function ChildForm({ child, mode }: ChildFormProps) {
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>(
    (child?.level as EducationLevel) || 'SD'
  );

  const boundAction = mode === 'edit' && child
    ? updateChild.bind(null, child.id)
    : createChild;

  const [state, formAction, isPending] = useActionState<ChildFormState, FormData>(
    boundAction,
    {}
  );

  const levelOptions = EDUCATION_LEVELS.map((level) => ({
    value: level,
    label: level,
  }));

  const gradeOptions = useMemo(() => {
    return (GRADES_BY_LEVEL[selectedLevel] || []).map((grade) => ({
      value: grade,
      label: grade,
    }));
  }, [selectedLevel]);

  return (
    <Card padding="lg" className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">
        {mode === 'create' ? '➕ Tambah Profil Anak' : '✏️ Edit Profil Anak'}
      </h2>

      {state.error && (
        <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-600 dark:text-danger-500 text-sm">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <Input
          name="name"
          label="Nama Anak"
          placeholder="Masukkan nama anak"
          defaultValue={child?.name}
          error={state.fieldErrors?.name?.[0]}
          required
        />

        <Input
          name="birth_date"
          type="date"
          label="Tanggal Lahir"
          defaultValue={child?.birth_date}
          error={state.fieldErrors?.birth_date?.[0]}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            name="level"
            label="Jenjang Pendidikan"
            options={levelOptions}
            defaultValue={child?.level || 'SD'}
            error={state.fieldErrors?.level?.[0]}
            onChange={(e) => setSelectedLevel(e.target.value as EducationLevel)}
            required
          />

          {gradeOptions.length > 0 && (
            <Select
              name="grade"
              label="Kelas"
              options={gradeOptions}
              defaultValue={child?.grade || ''}
              placeholder="Pilih kelas"
            />
          )}
        </div>

        <Input
          name="interests"
          label="Minat (pisahkan dengan koma)"
          placeholder="contoh: membaca, menggambar, musik"
          defaultValue={child?.interests?.join(', ')}
          helperText="Opsional. Bantu AI membuat soal yang lebih menarik."
        />

        <Input
          name="favorite_subjects"
          label="Mata Pelajaran Favorit (pisahkan dengan koma)"
          placeholder="contoh: Matematika, IPA"
          defaultValue={child?.favorite_subjects?.join(', ')}
          helperText="Opsional. Mata pelajaran yang paling disukai anak."
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isPending}>
            {mode === 'create' ? 'Tambah Anak' : 'Simpan Perubahan'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => window.history.back()}
          >
            Batal
          </Button>
        </div>
      </form>
    </Card>
  );
}
