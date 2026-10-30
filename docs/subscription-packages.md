# Paket belajar Teatch

Implementasi 30 Oktober 2026. Terapkan migrasi 001–008 sebelum deploy aplikasi.

| Paket      | Harga / 30 hari |               Soal baru | Profil anak | Grafik nilai | Analisis topik, tren, cetak laporan |
| ---------- | --------------: | ----------------------: | ----------: | ------------ | ----------------------------------- |
| Free Trial |             Rp0 | 30, sekali selama trial |           1 | Tidak        | Tidak                               |
| Basic      |        Rp69.000 |         1.000 / periode |           3 | Ya           | Tidak                               |
| Pro        |       Rp149.000 |         2.500 / periode |           6 | Ya           | Ya                                  |

Semua paket mencakup pemilihan kelas/pelajaran/topik/kesulitan/tipe soal yang diaktifkan, pengerjaan di web, nilai dan pembahasan, cetak soal/kunci terpisah, riwayat, dan pengerjaan ulang. Uraian memerlukan tinjauan orang tua bila diaktifkan. Kuota dibagi seluruh profil; hanya soal baru berhasil dibuat memakai kuota. Reservasi dikembalikan jika pembuatan gagal.

Pro menyediakan penguasaan per topik dari jawaban yang selesai dinilai, minimal lima jawaban sebelum menyimpulkan penguasaan dan sepuluh latihan sebelum membandingkan lima latihan terbaru dengan lima sebelumnya. Tautan latihan lanjutan mengisi topik pada pembuat latihan; soal baru tetap memakai kuota.

## Akses

Harga/kuota UI berasal dari `lib/subscription.ts`. Pemeriksaan fitur memakai paket dari profil database, status aktif, dan masa berlaku. Role admin tidak otomatis memberikan fitur Pro. Family/Teacher lama mengikuti Pro (2.500 soal/6 anak).

Halaman statistik memeriksa akses grafik di server. `getLearningSummary` mengembalikan status `locked` untuk tier lain tanpa memanggil RPC; data laporan tidak dikirim ke browser lalu disembunyikan. Dashboard dan statistik menyediakan penjelasan fitur serta tautan harga.

008 juga melindungi RPC `learning_summary` dari panggilan REST langsung: trial, Basic, dan paket kedaluwarsa menerima daftar kosong. RLS dan pemeriksaan pemilik tetap berlaku. Riwayat, soal, nilai, cetak dan pengerjaan ulang tetap dapat diakses setelah paket berakhir. Routing key trial/gratis dan pelanggan/paid tidak diubah.

## Database sebelum deployment

1. Pastikan 001–007 sudah terpasang pada proyek Supabase yang sama dengan environment aplikasi.
2. Jalankan **seluruh** `supabase/migrations/008_subscription_packages.sql` di SQL Editor. Empat hasil akhirnya harus `true`: `trial_quota_ready`, `existing_quotas_migrated`, `paid_quotas_ready`, `feature_access_ready`.
3. Jika muncul `GENERATION_PENDING`, transaksi dibatalkan tanpa perubahan parsial. Tunggu generasi selesai; untuk reservasi lebih dari 15 menit gunakan pemulihan admin/maintenance, lalu jalankan kembali 008.
4. Deploy aplikasi sesudah migrasi berhasil. Sesuaikan listing Shopee secara manual sebelum menerima pembelian paket baru.
5. Bila menjalankan ulang migrasi 006 untuk memperbaiki instalasi, jalankan kembali 007 dan 008 sesudahnya agar fungsi versi lama tidak menggantikan versi terbaru.

Default akun trial baru menjadi 30 soal untuk 30 hari. `quota_plan_version=2` menandai rollout per profil; pengulangan migrasi tidak mengisi ulang kuota atau mengaktifkan paket yang kedaluwarsa.

## Akun lama

Alokasi terakhir yang dikenali dari ledger dipakai untuk mempertahankan pemakaian. Saldo tidak dibagi/dikali 10.

| Saldo dan dasar alokasi lama                       |                                  Sesudah migrasi |
| -------------------------------------------------- | -----------------------------------------------: |
| Trial 0 dari 10                                    |                                       20 dari 30 |
| Basic 294 dari 300                                 |                                   994 dari 1.000 |
| Basic 2.994 dari alokasi 3.000 yang tercatat       |                                   994 dari 1.000 |
| Pro 4.994 dari alokasi 5.000 yang tercatat         |                                 2.494 dari 2.500 |
| Basic saldo khusus 450 tanpa alokasi yang dikenali |                                        Tetap 450 |
| Basic snapshot 2.994 tanpa catatan alokasi 3.000   | Dibatasi 1.000; pemakaian historis tidak ditebak |

Saldo khusus yang melebihi batas baru dibatasi ke batas paket. Penyesuaian saldo tercatat sebagai `plan_upgrade_20261030`. Tinjau bonus yang disengaja sebelum migrasi. Masa aktif, status, worksheet, jawaban, dan nilai lama dipertahankan.

## Aktivasi manual

Belum ada penagihan, perpanjangan, atau reset kuota bulanan otomatis. Pilih paket pada Edit Pengguna untuk menyiapkan status aktif, masa berlaku 30 hari, dan penggantian kuota sesuai paket. Untuk memperpanjang paket yang sama gunakan **Aktifkan 30 hari dari hari ini dan isi kuota paket**, periksa pilihan, lalu simpan.

Input tanggal/jam menggunakan waktu perangkat admin dan dikirim sebagai UTC; jam tidak hilang menjadi tengah malam. Penggantian kuota menetapkan saldo tepat sesuai paket, tidak menambah atau membawa saldo periode sebelumnya. Menyimpan metadata tanpa penetapan kuota tidak mengisi saldo. RPC admin menolak jumlah selain alokasi paket dan menolak pergantian tier/pengisian selama generasi reserved.

## Pemeriksaan

Tes lokal mencakup kebijakan fitur tiap tier/masa aktif, pemanggilan langsung RPC, isolasi pemilik, akses riwayat, limit SQL/TypeScript yang sama, debit/refund per soal, default trial baru, serta migrasi saldo dan pengulangannya. Tes memakai PGlite dan tidak menghubungi AI/database produksi.

Hasil pemeriksaan: 96 tes lulus, TypeScript dan lint lulus, serta build produksi `npm run build:verify` berhasil. Tes database/kebijakan paket dijalankan kembali setelah penambahan pemeriksaan pergantian tier selama reservasi (21 tes lulus). HTML hasil build memuat harga Rp69.000/Rp149.000 dan kuota 30/1.000/2.500 tanpa klaim prioritas dukungan. Pratinjau browser melalui port lokal terhalang pembatasan socket lingkungan; tidak ada klaim pengujian visual atau login produksi selesai.

Setelah deploy: coba trial membuka statistik, Basic melihat grafik tanpa laporan topik, Pro melihat analisis/cetak laporan, dan periksa saldo 1.000 menjadi 990 saat membuat 10 soal. Mengerjakan ulang dan mencetak worksheet yang sama tidak memotong kuota.
