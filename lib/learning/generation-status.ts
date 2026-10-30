export interface GenerationStatus {
  status: 'not_found' | 'reserved' | 'succeeded' | 'failed';
  worksheetId?: string;
  message: string;
}
type RequestRow = {
  status: 'reserved' | 'succeeded' | 'failed';
  worksheet_id: string | null;
};
export async function readGenerationStatus(
  parentId: string,
  requestKey: string,
  findOwned: (
    parentId: string,
    requestKey: string
  ) => Promise<RequestRow | null>
): Promise<GenerationStatus> {
  const row = await findOwned(parentId, requestKey);
  if (!row)
    return {
      status: 'not_found',
      message:
        'Permintaan belum ditemukan. Anda dapat mengirim ulang dengan kunci yang sama.',
    };
  if (row.status === 'succeeded' && row.worksheet_id)
    return {
      status: 'succeeded',
      worksheetId: row.worksheet_id,
      message: 'Draf sudah tersimpan.',
    };
  if (row.status === 'succeeded')
    return {
      status: 'succeeded',
      message:
        'Draf pernah tersimpan tetapi sudah dihapus. Pembuatan berikutnya memakai kuota baru.',
    };
  if (row.status === 'failed')
    return {
      status: 'failed',
      message:
        'Permintaan sudah dihentikan dan kuota dikembalikan. Anda dapat membuat draf baru.',
    };
  return {
    status: 'reserved',
    message:
      'Draf masih diproses. Hasil diperiksa otomatis; Anda dapat kembali nanti.',
  };
}
