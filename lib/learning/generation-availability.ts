export interface GenerationAvailability {
  enabled: boolean;
  message: string | null;
}

export function resolveGenerationAvailability(
  enabled: boolean,
  pilotParentIds: string[],
  parentId: string,
  mode: string = 'pilot'
): GenerationAvailability {
  if (!enabled) {
    return {
      enabled: false,
      message:
        'Pembuatan soal AI belum diaktifkan. Latihan yang sudah tersimpan tetap dapat digunakan.',
    };
  }
  if (
    !['pilot', 'public'].includes(mode) ||
    (mode === 'pilot' && !pilotParentIds.includes(parentId))
  ) {
    return {
      enabled: false,
      message: 'Pembuatan soal AI sedang diuji pada akun terbatas.',
    };
  }
  return { enabled: true, message: null };
}

export function generationScopeMessage(
  level: string,
  grade: string | null,
  subject?: string,
  mode = 'pilot'
) {
  if (mode !== 'pilot') return null;
  if (
    level !== 'SD' ||
    !['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4'].includes(grade || '')
  )
    return 'Tahap uji coba tersedia untuk SD kelas 1–4.';
  if (subject && !['Matematika', 'Bahasa Indonesia'].includes(subject))
    return 'Tahap uji coba tersedia untuk Matematika dan Bahasa Indonesia.';
  return null;
}
