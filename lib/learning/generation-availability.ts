export interface GenerationAvailability {
  enabled: boolean;
  message: string | null;
}

export function resolveGenerationAvailability(
  enabled: boolean,
  pilotParentIds: string[],
  parentId: string
): GenerationAvailability {
  if (!enabled) {
    return {
      enabled: false,
      message:
        'Pembuatan soal AI belum diaktifkan. Latihan yang sudah tersimpan tetap dapat digunakan.',
    };
  }
  if (pilotParentIds.length && !pilotParentIds.includes(parentId)) {
    return {
      enabled: false,
      message: 'Pembuatan soal AI sedang diuji pada akun terbatas.',
    };
  }
  return { enabled: true, message: null };
}
