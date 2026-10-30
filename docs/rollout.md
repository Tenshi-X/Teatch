# Peluncuran roadmap Teatch

> Pembaruan 30 Oktober 2026: kode tahap 1–3 telah dikembangkan untuk kondisi belum ada pelanggan. Gunakan [status pengembangan](development-status.md) untuk migrasi 006, konfigurasi akses pribadi, hasil pemeriksaan, dan keterbatasan aktual. Bagian berikut berasal dari rollout migrasi 005; keterangan historis bukan bukti deployment terbaru.

## Status implementasi

Kode aplikasi dan migrasi sudah tersedia secara lokal. Database produksi belum diubah dan aplikasi belum diterbitkan. Tes menggunakan PostgreSQL lokal melalui PGlite, klien model tiruan, dan contoh soal; tidak ada panggilan Gemini berbayar selama pemeriksaan ini.

| Area            | Implementasi                                                                                          | Gate sebelum produksi                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Paket dan kuota | Free Trial 10 soal/1 anak, Basic 300/3, Pro 500/6; Family/Teacher lama 500/6 tetap terbaca            | Tinjau paket akun lama; saldo lama dipertahankan                                      |
| Generasi        | Reservasi atomik, satu panggilan Gemini 2.5 Flash, idempotensi, validasi dan draf, pengembalian kuota | Uji dua koneksi database dan kegagalan jaringan pada staging                          |
| Keamanan        | Izin kolom profil, prosedur hanya server, foto privat dan validasi file                               | Jalankan migrasi, cek kebijakan tambahan di proyek, rotasi kunci                      |
| Soal            | Kontrak lengkap 16 tipe, payload JSON, aset lokal, pemulihan respons lama                             | Buka setiap tipe setelah penerimaan staging dan peninjauan mutu                       |
| Penilaian       | Aturan lokal versi 2, uraian dengan rubrik dan tinjauan orang tua                                     | Uji alur login → draf → terbit → latihan → tinjau → cetak                             |
| Perkembangan    | Bukti jawaban, minimal 5 per tujuan, tren 5 latihan vs 5 sebelumnya, latihan ulang dan laporan cetak  | Uji data akun staging; ringkasan hanya memakai hasil baru yang selesai dinilai        |
| Biaya           | Token tercatat; evaluator biaya/mutu tersedia; tidak ada retry model otomatis                         | Pengukuran baseline/kandidat dengan tarif produksi yang terverifikasi belum dilakukan |

## 1. Persiapan dan migrasi

1. Buat cadangan database dan storage proyek Supabase. Siapkan proyek staging terpisah dengan data contoh anonim.
2. Periksa migrasi 001–004 sudah diterapkan. Terapkan `supabase/migrations/005_reliable_learning.sql` sekali di staging sebelum menjalankan kode baru. Migrasi berada dalam transaksi dan tidak boleh diterapkan ulang secara manual.
3. Migrasi mempertahankan saldo, paket lama, serta nilai historis. Saldo negatif lama dikoreksi menjadi 0. Semua nilai lama ditandai versi 1. Respons AI lama dipakai untuk memulihkan payload bila tersedia; materi yang masih kehilangan payload bisa dibaca/cetak dan tidak bisa dilatih interaktif.
4. Cek daftar kebijakan nyata pada `profiles`, tabel belajar, dan `storage.objects`. Hapus kebijakan tambahan yang memberi akses lebih luas daripada migrasi. Kebijakan storage bersifat OR: kebijakan publik tambahan dapat membatalkan perlindungan foto.
5. Isi konfigurasi dari `.env.example` dengan kunci staging yang baru. `SUPABASE_SERVICE_ROLE_KEY` dan `GEMINI_API_KEY` hanya boleh berada pada server. `TEATCH_AI_ENABLED` tetap `false` sampai evaluasi biaya dan mutu lulus.
6. Contoh konfigurasi lokal sudah diganti placeholder. Pemeriksaan baca saja pada 10 Oktober 2026 mendapat HTTP 200 untuk kredensial publik Supabase, kredensial server Supabase, dan metadata model Gemini yang terkonfigurasi di `.env.local`; pemeriksaan ini tidak menghasilkan soal atau mengubah data. Kunci lama yang sudah dihapus dari contoh tidak dibandingkan ulang. Pemilik akun provider perlu mencabut/mengganti kunci Gemini dan service role yang pernah terpapar, memperbarui konfigurasi deployment, lalu memeriksa log penggunaan. Rotasi belum dilakukan karena akses pengelolaan kunci provider tidak tersedia. Menghapus contoh tidak mencabut kredensial.
7. Tetapkan admin pertama melalui operasi database yang terotorisasi. Pendaftaran baru tidak lagi otomatis menjadi admin berdasarkan alamat email.

Foto baru menggunakan path `uid/uuid.ext`, ukuran maksimal 2 MB, dan PNG/JPEG/WebP yang diperiksa dari byte file. URL lama hanya diterima bila menunjuk storage Supabase milik pengguna. URL tampilan ditandatangani dengan masa berlaku satu jam; muat ulang halaman untuk memperbaruinya.

## 2. Pemeriksaan lokal dan staging

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev --audit-level=high
```

CI menjalankan pemeriksaan yang sama tanpa kredensial provider. CI belum dijalankan di GitHub sebelum perubahan ini di-push.

Pengujian lokal mencakup seluruh 16 tipe dari kontrak → simpan di PostgreSQL → muat kembali → nilai, serta render pratinjau/interaksi/cetak. Pengujian browser dengan contoh lokal mencakup kontrol dan hasil penilaian; ini bukan pengujian akun Supabase produksi. Bukti tampilan ada di `docs/qa/count-image.jpg`.

Pada staging lakukan pemeriksaan berikut dengan dua akun orang tua dan akun admin:

- Coba mengubah role, tier, masa aktif, dan kuota melalui token pengguna biasa; semuanya harus ditolak. Nama dan nomor telepon sendiri tetap bisa diubah.
- Kirim dua permintaan secara bersamaan dari dua koneksi server. Kunci yang sama hanya menghasilkan satu worksheet dan satu debit. Dua kunci berbeda dengan saldo hanya cukup satu permintaan harus menghasilkan satu keberhasilan; saldo tidak negatif.
- Putuskan koneksi setelah worksheet sudah tersimpan, lalu kirim ulang kunci yang sama. Hasil tersimpan harus dikembalikan tanpa panggilan model lagi. Simulasikan AI tidak valid, timeout, dan kegagalan penyimpanan; reservasi harus kembali tepat sekali.
- Periksa bucket foto privat, unggah lintas pengguna ditolak, tipe file yang salah ditolak, dan foto lama masih terbaca oleh pemiliknya.
- Untuk setiap tipe: periksa data khusus, simbol matematika, jawaban benar/salah/kosong, edit draf, latihan, simpan, tinjauan, dan cetak. Uraian tidak mendapat nilai akhir sebelum orang tua meninjau.
- Muat ulang saat latihan dan saat pembuatan belum terkonfirmasi. Progres/kunci permintaan harus bertahan pada perangkat; galat menyimpan hasil harus membiarkan jawaban tetap tersedia.
- Pemeriksaan konkurensi lokal memakai antrean satu backend PGlite. Uji konkurensi dengan beberapa koneksi Supabase tetap diperlukan untuk gate produksi.

Pengaturan awal hanya membuka `multiple_choice,short_answer,true_false`. Kontrak, komponen, dan tes sudah mendukung 16 tipe. Buka tipe tambahan satu per satu melalui `TEATCH_ENABLED_TYPES` sesudah gate terkait lulus. `guess_image` maksimal 17 soal unik dan `image_label` maksimal 3 target tumbuhan; tipe lain maksimal 20.

## 3. Gate biaya dan mutu

Model tetap `gemini-2.5-flash`, satu kandidat, satu panggilan, timeout 55 detik, tanpa retry SDK atau fallback. Anggaran keluaran maksimal 8.192 token dan dibatasi lagi menurut tipe/jumlah soal. Thinking budget 0 adalah bagian perubahan yang perlu dinilai kualitasnya. Prompt baru tidak memuat nama anak.

Pengurangan panjang prompt dan batas keluaran belum membuktikan biaya nyata turun. Jangan mengaktifkan prompt baru hanya berdasarkan tes tiruan. Evaluasi harus memasukkan respons gagal dan seluruh biaya token, termasuk thinking jika ada. Kegagalan jaringan dengan pemakaian tidak diketahui harus direkonsiliasi dengan provider sebelum dianggap terukur.

Ambil baseline dari versi produksi sebelum perubahan dan kandidat dengan contoh anonim yang sama. Catat model, jenjang, pelajaran, tipe, kesulitan, jumlah soal, input/output/thinking/total token, jumlah panggilan, validitas, serta hasil tinjauan kunci. Bandingkan kelompok yang identik, minimal 20 sampel baseline dan 20 kandidat per kelompok. Sampel keseluruhan harus mencakup jenjang yang akan diluncurkan, tipe yang akan dibuka, serta jumlah 1–20. Untuk tipe dengan batas kecil, gunakan jumlah yang didukung; cakupan 1–20 dapat dipenuhi tipe lain.

Format berkas evaluator:

```json
{
  "rates": { "inputUSDPerMillion": 0.0, "outputUSDPerMillion": 0.0 },
  "coverage": {
    "levels": ["PAUD", "TK A", "TK B", "SD", "SMP", "SMA"],
    "types": ["multiple_choice", "short_answer", "true_false"]
  },
  "baseline": [],
  "candidate": []
}
```

Isi tarif positif dengan tarif produksi saat pengukuran, bukan angka contoh 0. Setiap baris baseline/kandidat:

```json
{
  "model": "gemini-2.5-flash",
  "level": "SD",
  "subject": "Matematika",
  "questionType": "short_answer",
  "difficulty": "mudah",
  "questionCount": 5,
  "inputTokens": 100,
  "outputTokens": 250,
  "thinkingTokens": 0,
  "totalTokens": 350,
  "calls": 1,
  "metered": true,
  "valid": true,
  "reviewedQuestions": 5,
  "inconsistentKeys": 0
}
```

Angka token di atas hanya contoh format dan bukan hasil pengukuran. Evaluator tidak memanggil AI:

```sh
npm run evaluate:cost -- evaluation-results/measurements.json evaluation-results/report.json
```

Gate gagal bila respons valid pertama kurang dari 95%, ada kunci tidak konsisten/soal valid belum ditinjau, data tidak cukup, model pembanding berbeda, panggilan lebih dari satu, token tidak lengkap, atau biaya/token per soal meningkat. Biaya rata-rata per soal diterima memasukkan biaya kegagalan. Persentil 95 biaya per soal diminta serta token input/output juga tidak boleh meningkat.

Analisis perkembangan, nilai, koreksi manual, tinjauan orang tua, aset gambar, dan laporan cetak semuanya dihitung lokal tanpa request AI. Regenerasi yang sengaja dipilih pengguna adalah operasi baru dan memakai kuota baru. Respons tidak valid mengembalikan kuota pengguna, tetapi provider tetap mungkin menagih token yang telah diproses.

## 4. Pilot dan pemantauan

Setelah laporan evaluator lulus dan staging diterima, aktifkan AI hanya untuk pilot:

```dotenv
TEATCH_AI_ENABLED=true
TEATCH_AI_PILOT_PARENT_IDS=uuid-profil-orang-tua-yang-diizinkan
TEATCH_ENABLED_TYPES=multiple_choice,short_answer,true_false
```

Daftar pilot menggunakan ID baris profil, bukan ID auth. Daftar kosong berarti semua akun dapat membuat soal. Jangan mengosongkannya sebelum pilot diterima.

Admin menampilkan generasi gagal, token, reservasi, laporan soal berikut isi/kunci, dan selisih ledger kuota. Reservasi usang dapat dipulihkan lewat tombol admin. Permintaan baru juga memulihkan reservasi pemilik yang berumur lebih dari 15 menit. Jadwalkan `reconcile_generation_reservations()` melalui pekerjaan server dengan hak service role setiap beberapa menit bila pemulihan tanpa interaksi diperlukan; penjadwalan eksternal belum dibuat.

Pantau validitas generasi dari `generation_requests.usage.valid`, pemakaian token dari `usage`, jumlah laporan terbuka, dan hasil `quota_audit()`. Selisih ledger harus 0. Kegagalan berulang dibatasi 20 operasi baru per orang tua per jam, termasuk operasi yang dikembalikan kuotanya. Batasi ulang fitur bila mutu atau biaya memburuk.

## 5. Penghentian dan batas yang tersisa

Matikan `TEATCH_AI_ENABLED` untuk menghentikan request model baru; latihan tersimpan tetap dapat digunakan. Tutup tipe bermasalah melalui `TEATCH_ENABLED_TYPES`. Pertahankan kode yang kompatibel dengan migrasi 005: kembali ke versi aplikasi lama akan gagal menulis karena hak browser lama sudah dicabut. Pulihkan cadangan database hanya dengan prosedur pemulihan yang disepakati agar tidak menghilangkan data baru.

Audit paket runtime setelah pembaruan Next/KaTeX menunjukkan 0 kerentanan pada 10 Oktober 2026. Audit seluruh paket masih melaporkan 5 entri high pada rantai alat lint `braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next`. Saat pemeriksaan tidak tersedia rilis perbaikan yang kompatibel; penurunan Next lint secara paksa tidak diterapkan. Catat dan periksa kembali advisori sebelum deployment.

Mekanisme pembayaran dan alur khusus guru tetap di luar perubahan ini. Riwayat menampilkan 100 worksheet/latihan terbaru akun; ringkasan memakai jawaban 90 hari terakhir, dengan pembacaan data bertahap. Progres tersimpan pada perangkat, bukan sinkron lintas perangkat.

## Sumber rancangan

- [Supabase: mengamankan data](https://supabase.com/docs/guides/database/secure-data).
- [Gemini: structured output](https://ai.google.dev/gemini-api/docs/structured-output) dan [library resmi](https://ai.google.dev/gemini-api/docs/libraries).
- [Katalog dan pemetaan CP](learning-catalog.md).
- CI memakai commit resmi [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1) dan [setup-node v7.1.0](https://github.com/actions/setup-node/releases/tag/v7.1.0).
