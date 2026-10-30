# Dasar harga Teatch

Diperbarui 30 Oktober 2026. Paket yang disetujui sudah diterapkan pada kode dan migrasi 008; panduan operasional ada di [subscription-packages.md](subscription-packages.md). Database produksi dan listing penjualan belum diperbarui dari sesi implementasi ini.

| Paket      |               Harga |                      Soal baru | Profil |
| ---------- | ------------------: | -----------------------------: | -----: |
| Free Trial |                 Rp0 | 30 sekali selama trial 30 hari |      1 |
| Basic      |  Rp69.000 / 30 hari |                1.000 / periode |      3 |
| Pro        | Rp149.000 / 30 hari |                2.500 / periode |      6 |

## Sampel yang diberikan pengguna

Pengguna menjalankan `npm run evaluate:paid` dan membagikan hasil pada 30 Oktober 2026 pukul 19:24 WIB. Satu request `GEMINI_PAID_API_KEY` / `gemini-3.8-flash` berhasil menghasilkan 10 soal pilihan ganda Matematika SD kelas 2, penjumlahan dan pengurangan sampai 20. Prompt versi 3, valid=true, metered=true, durasi 10.288 ms.

| Ukuran                                                |      Nilai |
| ----------------------------------------------------- | ---------: |
| Token input                                           |        187 |
| Token output                                          |        944 |
| Token thinking                                        |          0 |
| Total token                                           |      1.131 |
| Estimasi USD / request                                | 0,00368025 |
| Estimasi rupiah / 10 soal                             |    Rp66,75 |
| Estimasi rupiah / soal                                |     Rp6,68 |
| Proyeksi / soal dengan tarif Januari 2027, kurs tetap |    Rp13,35 |

Ini pemakaian token dari satu respons yang dibagikan pengguna dan estimasi berdasarkan tarif, bukan invoice provider atau rata-rata seluruh penggunaan. Percobaan sebelumnya dari lingkungan agen gagal DNS sebelum respons; hasil sukses terbaru berasal dari terminal pengguna. Validasi bentuk soal tidak membuktikan semua kunci dan mutu pedagogis telah ditinjau manusia.

Sumber tarif: [Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing), Standard Gemini 3.8 Flash: USD0,75 per juta token input dan USD3,75 per juta token output/thinking sampai 31 Desember 2026; USD1,50 dan USD7,50 mulai 1 Januari 2027. Kurs yang dipakai pada hasil pengguna: [BI JISDOR 30 Oktober 2026](https://www.bi.go.id/en/statistik/informasi-kurs/jisdor/Default.aspx), Rp18.138/USD. Kurs settlement dapat berbeda.

Rumus: `(input * tarif_input + (output + thinking) * tarif_output) / 1.000.000 * kurs / soal_valid`. Biaya permintaan gagal dan fallback perlu dimasukkan ke biaya keseluruhan, termasuk jika provider tidak mengembalikan metadata.

## Perencanaan biaya, bukan jaminan margin

Jika semua soal memiliki biaya sama dengan sampel tersebut, 1.000 soal sekitar Rp6.675 dan 2.500 soal sekitar Rp16.688 pada tarif sekarang. Pada tarif Januari 2027 menjadi Rp13.350 dan Rp33.376 dengan kurs tetap. Menambah cadangan perencanaan 50% menghasilkan sekitar Rp20.026 dan Rp50.064. Cadangan 50% merupakan pilihan perencanaan, bukan angka kegagalan yang terukur.

Belum termasuk hosting, database, transaksi/Shopee, pajak, biaya kurs, dan operasional. Satu sampel mudah tanpa thinking tidak mewakili soal sulit/panjang, uraian, batch satu soal, atau fallback. Pantau biaya per soal berhasil dari beberapa variasi sebelum menaikkan kuota lebih jauh atau menawarkan unlimited.

## Fitur dan penawaran

Fitur latihan dasar tersedia di semua paket. Basic menambahkan grafik perkembangan nilai. Pro menambahkan penguasaan per topik, tren, laporan cetak, dan tautan latihan lanjutan. Komponen sudah ada dan sekarang dibatasi berdasarkan paket di server/RPC. Tidak ada klaim prioritas dukungan atau model yang pasti lebih berkualitas pada paket lebih mahal. Laporan dihitung dari jawaban tersimpan tanpa request AI tambahan.

Paket latihan tujuh hari, sesi khusus soal salah, serta target/lencana masih ide pengembangan dan tidak dimasukkan ke kartu harga sebagai fitur yang tersedia. Harga dan limit lama 10/300/500 sudah digantikan oleh 30/1.000/2.500; migrasi 008 menyesuaikan akun lama secara tercatat dan hanya sekali.

## Mengulang probe

`npm run evaluate:paid` mengirim satu permintaan produksi berbayar tanpa retry/fallback dan tanpa memotong kuota akun Teatch. Hasil termasuk soal untuk diperiksa disimpan ke `evaluation-results/paid-cost-probe.json`, diabaikan git. Script membaca `.env.local` dan tidak mencetak key. Tes implementasi paket tidak menjalankan probe berbayar lagi.
