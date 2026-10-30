# Teatch

Platform latihan anak untuk orang tua: profil anak, worksheet, latihan interaktif, tinjauan jawaban, dan laporan perkembangan. Kuota pembuatan dihitung per soal. Penilaian serta analisis perkembangan dilakukan lokal tanpa request AI.

## Menjalankan aplikasi

Gunakan Node.js 24. Salin `.env.example` ke `.env.local`, isi kredensial proyek staging, dan terapkan migrasi database secara berurutan. Kunci server tidak boleh dibagikan ke browser atau disimpan di Git.

```sh
npm ci
npm run dev
```

Buka `http://localhost:3000`. Terapkan migrasi 001–006 sebelum memakai dashboard versi ini. Untuk pengujian pribadi gunakan `TEATCH_AI_ACCESS_MODE=public` dan aktifkan `TEATCH_AI_ENABLED` setelah konfigurasi provider siap. Model utama **Gemini 3.8 Flash**, dengan fallback berurutan **3.5 Flash-Lite → 3.6 Flash** ketika panggilan provider gagal. Maksimal tiga panggilan dalam 45 detik; satu hasil dan satu debit kuota per pembuatan. Di environment hosting, ubah `TEATCH_AI_MODEL` lama menjadi `gemini-3.8-flash` sebelum deployment baru.

## Pemeriksaan

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev --audit-level=high
```

Tes memakai PostgreSQL lokal dan klien model tiruan; tidak membutuhkan kunci AI. Untuk pengujian kontrol soal di browser sesudah build:

```sh
npx tsx scripts/preview-fixtures.ts
```

Pratinjau hanya tersedia pada `http://127.0.0.1:3002` dan menggunakan contoh lokal, tanpa akun/data produksi.

## Dokumentasi

- [Status implementasi tahap 1–3 dan cara menjalankan pengujian pribadi](docs/development-status.md).
- [Implementation plan: urutan PR, dependensi, dan kriteria penerimaan](docs/implementation-plan.md).
- [Migrasi, keamanan, biaya, pilot, dan gate produksi](docs/rollout.md).
- [Sumber dan batas pemetaan tujuan belajar](docs/learning-catalog.md).

Perubahan kode ini belum menerapkan migrasi ke produksi, merotasi kredensial provider, atau membuktikan biaya nyata prompt baru. Langkah tersebut dijelaskan dalam panduan peluncuran.
