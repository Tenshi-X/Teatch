# Status pengembangan tahap 1–3

Tanggal: 30 Oktober 2026. Konteks: belum ada pengguna pelanggan; pengujian pribadi memakai akun sendiri dan data contoh. Tahap pilot pengguna dan pembayaran otomatis belum dijalankan.

## Perubahan yang tersedia di kode

| Paket  | Implementasi                                                                                                                                                                              | Bukti lokal / pekerjaan eksternal                                                                                                                                                                                                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OPS-00 | Script `check:runtime`, inventaris konfigurasi tanpa membuka nilai kunci                                                                                                                  | Empat kredensial aplikasi tersedia; Supabase dan metadata model gagal dijangkau karena DNS `ENOTFOUND`. Tidak ada kredensial pengelolaan database pada lingkungan yang diperiksa. Status migrasi/rotasi kunci provider belum dapat diverifikasi. |
| PR-01  | Cookie refresh dan header cache dipertahankan pada redirect; halaman publik melewati pemeriksaan sesi; memoization per request; build Webpack                                             | Tes cookie/header dan redirect lulus. Build penuh berhasil pada output verifikasi Windows; eksekusi GitHub CI belum dilakukan.                                                                                                                   |
| PR-02  | Model server dari allowlist, kategori error, metadata kelas, sampler dengan dry-run/checkpoint/batas biaya, pembanding lintas model                                                       | Tes model tiruan dan batas evaluasi lulus. Tidak ada panggilan generasi provider; mutu, tarif, akses model, dan biaya nyata belum dibuktikan.                                                                                                    |
| PR-03  | Endpoint baca status milik sendiri, polling tanpa POST AI, pengambilan ulang draf, endpoint maintenance ber-secret dan SQL scheduler                                                      | Tes status, idempotensi, refund, dan maintenance lokal lulus. Migrasi serta jadwal maintenance belum dipasang ke Supabase nyata.                                                                                                                 |
| PR-04  | WhatsApp opsional, kelas wajib saat membuat profil, kelanjutan ke pembuat latihan, preset tujuan, default 10 soal, state akun/perangkat dibersihkan saat logout, feedback setelah latihan | TypeScript dan build lulus. Pratinjau browser lokal belum terverifikasi karena browser tidak dapat menjangkau port QA. Tidak ada klaim login/OAuth nyata sudah lulus.                                                                            |
| PR-05  | RPC agregasi dashboard dan laporan; browser menerima ringkasan alih-alih semua jawaban; admin dipaginasi 50 akun                                                                          | Tes kesetaraan nilai/tren, pengecualian data lama/pending/di luar 90 hari, dan isolasi akun lulus. Jumlah request data utama dashboard menjadi tiga: anak, overview, dan summary, di luar auth/storage. Latensi produksi belum diukur.           |
| PR-06  | Mode public/pilot eksplisit; cakupan pilot konsisten di UI/API; feedback dan metrik minimal; pembatasan event; retensi 90 hari; copy penawaran dan privasi diperbarui                     | Tes pilot kosong ditolak, ownership, deduplikasi event, pembatasan feedback, dan pembersihan data lulus. Kontak/toko yang sudah ada dipertahankan; janji dukungan 24/7 dan label terpopuler dihapus.                                             |

`public` pada konfigurasi berarti semua akun yang sah boleh mencoba generasi sesuai kuotanya, bukan akses tanpa login. Mode ini sesuai pengujian pribadi sekarang dan tidak mewajibkan peserta pilot. Kill switch `TEATCH_AI_ENABLED` tetap berlaku; nilai yang sudah ada di `.env.local` dipertahankan. Environment hosting tidak diubah oleh pekerjaan ini.

## Menjalankan pada proyek Supabase saat ini

Karena belum ada pelanggan, proyek Supabase yang ada dapat dipakai untuk pengembangan dengan data contoh. Tidak perlu menunggu perekrutan pengguna atau membuat proyek staging terpisah untuk mencoba kode.

1. Periksa migrasi 001–005 pada proyek. Bila belum diterapkan, jalankan berurutan; jangan mengulangi migrasi yang sudah berhasil.
2. Terapkan [006_runtime_readiness.sql](../supabase/migrations/006_runtime_readiness.sql) setelah 005. Versi perbaikan migrasi ini aman dijalankan ulang, menetapkan schema `public`, dan mempertahankan baris yang sudah ada. Jalankan **seluruh file**, termasuk `COMMIT;` dan `SELECT` terakhir. Hasil akhirnya harus berupa satu baris dengan `dashboard_ready`, `learning_ready`, `feedback_ready`, `events_ready`, `maintenance_ready`, dan `admin_ready` semuanya `true`.
3. Sesuaikan environment lokal/hosting dari `.env.example`. Untuk mencoba dengan akun sendiri gunakan:

   ```dotenv
   TEATCH_AI_ACCESS_MODE=public
   TEATCH_AI_MODEL=gemini-2.5-flash
   TEATCH_ENABLED_TYPES=multiple_choice,short_answer,true_false
   ```

   Aktifkan `TEATCH_AI_ENABLED=true` saat migrasi dan akses provider sudah siap. Nama model lain hanya diterima bila ada dalam allowlist yang diuji; penggantian model tetap membutuhkan evaluasi nyata.

4. Jalankan `npm run check:runtime`. Script hanya membaca kesiapan tabel dan metadata model, tanpa menghasilkan soal atau menerapkan migrasi. HTTP berhasil pada pemeriksaan ini belum membuktikan seluruh kebijakan RLS, OAuth, atau model generasi bekerja.
5. Login Google, lengkapi nama, tambah anak dengan kelas, lalu pilih materi. Buat 10 soal, periksa draf, terbitkan, kerjakan, lihat hasil, kirim feedback, dan coba cetak dari halaman latihan.
6. Untuk pemulihan otomatis, aktifkan `pg_cron` pada Supabase lalu jalankan [schedule-maintenance.sql](../supabase/operations/schedule-maintenance.sql). Periksa `cron.job` dan `cron.job_run_details`; script tidak dijalankan dari sesi ini. Jadwal lima menit mengembalikan reservasi berumur lebih dari 15 menit serta menghapus event mentah lebih dari 90 hari.
7. Bila scheduler database tidak tersedia, scheduler server dapat memanggil `GET /api/internal/maintenance` dengan header `Authorization: Bearer <TEATCH_MAINTENANCE_SECRET>`. Secret harus acak, server-only, dan tidak ditempatkan pada URL. Jangan menggunakan service role sebagai secret HTTP ini.

Dashboard/laporan/admin versi baru membutuhkan migrasi 006. Deploy database dahulu, kemudian versi aplikasi ini. Tidak ada push atau deployment hosting yang dilakukan oleh sesi implementasi.

### Jika dashboard gagal setelah login dan pengecekan migrasi masih NULL

`to_regprocedure('public.dashboard_overview()')` yang menghasilkan `NULL` berarti fungsi tersebut tidak ditemukan di schema `public` pada database yang sedang diperiksa. Ini pemeriksaan katalog PostgreSQL, bukan cache API. Pesan lama aplikasi "Periksa migrasi database 006" terlalu umum: pesan itu sebelumnya dipakai untuk setiap kegagalan RPC laporan.

1. Gunakan SQL Editor pada proyek yang sama dengan `NEXT_PUBLIC_SUPABASE_URL` di environment Production Vercel. Pastikan cabang database yang dipilih juga sesuai bila memakai branching.
2. Buka query baru. Salin seluruh versi terbaru file 006 dari repository, dari `BEGIN;` sampai `SELECT` verifikasi terakhir. Hapus seleksi sebagian teks sebelum menekan Run agar semua perintah dijalankan. Script memeriksa prasyarat 005, memperbarui/membuat fungsi di `public`, memasang ulang izin/kebijakan terkait, lalu commit. Tidak ada penghapusan tabel/data atau penjadwalan ulang cron.
3. Hasil akhir harus enam kolom `true`, bukan hanya "Success. No rows returned". Bila gagal, simpan pesan error SQL lengkap; jangan lanjut ke deployment. Bila pengecekan terpisah masih `NULL`, cocokkan proyek/cabang dan pastikan script telah dijalankan sampai `COMMIT;`.
4. Script juga mengirim `NOTIFY pgrst, 'reload schema';` ketika commit. Reload cache membantu API mengenali fungsi yang sudah tersimpan; tidak dapat menciptakan fungsi yang masih hilang dari katalog.
5. Commit dan push perbaikan aplikasi, tunggu deployment Ready, lalu muat ulang dashboard. Kegagalan RPC kini menghasilkan status laporan belum tersedia dan tautan latihan, bukan menjatuhkan halaman setelah login. Log Vercel dengan awalan `[reports]` mencatat nama RPC, kode, pesan, serta hint database; diagnostik ini tidak dikirim sebagai props ke browser.

Pemeriksaan koneksi baca saja dari sesi perbaikan masih gagal DNS `ENOTFOUND`, sehingga penerapan database produksi dan penyebab pasti migrasi yang belum tersimpan belum dapat dibuktikan dari lingkungan ini.

## Pemeriksaan dan build

```sh
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --omit=dev --audit-level=high
```

Hasil terakhir yang sudah diperiksa: 71 tes lulus, lint lulus, typecheck lulus. Tes tambahan membuktikan pemulihan instalasi 006 parsial, pengulangan migrasi dari search path berbeda, pelestarian data/kuota/isolasi akun, serta status laporan gagal yang dibedakan dari laporan kosong. Build produksi penuh melalui Webpack berhasil pada direktori `.next-verify`. Build normal sempat mendapat `EPERM` ketika worker Windows membuat folder output; mode verifikasi menyiapkan folder di proses utama dan memakai satu worker:

```sh
npm run build:verify
```

Mode verifikasi adalah workaround lokal; konfigurasi normal CI/hosting tetap memakai output `.next`. `npm run build:turbo` tersedia untuk reproduksi Turbopack. Audit npm terbaru terhalang DNS registry; jangan memakai hasil audit 10 Oktober sebagai bukti keamanan dependensi saat ini.

Untuk pratinjau alur tanpa kredensial/provider, setelah build normal jalankan:

```sh
npm run preview:runtime
```

Buka `http://127.0.0.1:3003/worksheets/new`. Jika memakai build verifikasi, set `TEATCH_ISOLATED_BUILD=true` sebelum menjalankan preview. Harness memakai komponen asli dengan server/action tiruan, mensimulasikan respons generasi hilang, dan menyediakan penghitung operasi. Ia hanya mendengarkan loopback, tidak memanggil Gemini, dan bukan bypass login pada aplikasi produksi. Harness belum diverifikasi lewat browser pada sesi ini karena koneksi ke port lokal timeout.

## Evaluasi AI setelah jaringan provider tersedia

```sh
npm run evaluate:sample -- evaluation-results/manifest.json --init
npm run evaluate:sample -- evaluation-results/manifest.json
```

Perintah kedua adalah dry-run. Manifest awal memuat kelas 1–4, dua pelajaran, tiga tipe, jumlah 1–20 secara keseluruhan, dan 20 pengulangan. Jumlah request aktual harus ditinjau sebelum menaikkan batas; tarif contoh 0 sengaja membuat eksekusi ditolak. Isi tarif aktual, tanggal/sumber, dan anggaran yang diterima. Cakupan kesulitan awal mudah; tambahkan sedang/sulit serta tujuan lain sesuai materi yang akan dibuka. Ini dataset awal untuk ditinjau, bukan bukti semua soal SD sudah tervalidasi.

```sh
npm run evaluate:sample -- evaluation-results/manifest.json --run
```

Sampler mencatat respons valid/gagal, worksheet, kelas, case ID, versi prompt, dan token. Review seluruh kunci lalu isi `reviewedQuestions`/`inconsistentKeys`. Batas biaya menggunakan perkiraan input maksimum; pemakaian yang tidak terukur atau melampaui perkiraan menghentikan sampling untuk rekonsiliasi provider, sehingga batas lokal bukan pengganti budget/billing provider.

Gunakan `evaluate:cost` untuk baseline dan kandidat pada model yang sama sesuai format rollout. Metadata kelas sekarang dipertahankan dan masuk pengelompokan; dataset lama tanpa kelas tidak cukup untuk klaim penerimaan semua kelas. Untuk membandingkan model berbeda:

```sh
npm run evaluate:benchmark -- baseline.samples.json candidate.samples.json report.json
```

Tarif masing-masing run dihitung terpisah dan kasus harus berpasangan. Laporan lintas model tidak otomatis memilih model atau meluluskan gate prompt. Model baru yang dipilih tetap membutuhkan baseline dan penerimaan prompt pada model yang sama.

## Hal yang belum dibuktikan

- Penerapan migrasi dan RLS nyata, OAuth, rotasi kunci provider, dan penjadwalan maintenance.
- Konkurensi dengan dua koneksi PostgreSQL/Supabase independen; PGlite lokal memakai satu backend.
- Kualitas dan biaya respons Gemini nyata; tidak ada batch berbayar dijalankan.
- Target p95 latensi, pengujian browser mobile/cetak, dan hasil GitHub CI.
- Retensi/konversi pengguna, karena belum ada peserta. Aktivasi pesanan dan pembayaran tetap menjadi tahap berikutnya.
