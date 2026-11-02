# Teatch — panduan design system

Teatch membantu orang tua menyiapkan latihan, mendampingi anak, meninjau jawaban, dan memahami perkembangan belajar. Identitasnya mengambil karakter buku belajar modern: jelas, ramah, dan terstruktur. Prinsip interaksi mengacu pada Adobe Spectrum; komponen menggunakan implementasi lokal Teatch.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1. Kehangatan datang dari palet keluarga dan bahasa pendampingan; komposisi mengikuti pekerjaan pengguna; gerak hanya memberi respons pada perubahan keadaan.

## Alasan pilihan visual

- Teal menandai tindakan utama; mint menjadi turunannya di mode gelap. Krem membantu membaca panduan, oranye memberi apresiasi setelah latihan selesai.
- Source Sans 3 dipertahankan agar formulir, soal, dan angka memiliki satu suara tipografi yang mudah dibaca.
- Pemisah header pada lembar latihan mengingatkan struktur buku kerja sekaligus membedakan konteks dan isi. Kartu dipakai untuk lembar soal dan tindakan utama; tinjauan serta ringkasan memakai susunan yang lebih ringan.
- Jarak kelipatan 4px menyatukan komponen. Ruang lebih luas di sekitar soal membantu anak memusatkan perhatian.
- Ikon buku menandai latihan, clipboard menandai tinjauan, printer menandai cetak. Ikon yang ada dipertahankan untuk konsistensi, selalu disertai teks ketika menjadi tindakan.
- Bayangan hanya menandai menu dan dialog yang berada di atas halaman; latar besar tetap netral.

## Tipografi

- Source Sans 3, dimuat melalui `next/font`, menjadi font utama aplikasi.
- Teks isi 16px dengan tinggi baris 1.6; keterangan 14px, label kecil 12px hanya jika masih terbaca.
- Judul halaman 30–36px, judul bagian 20–24px, bobot 600.
- Halaman latihan memakai teks isi 18px; PAUD, TK, dan SD kelas 1–2 memakai 20px. Soal utama 20–24px.
- Angka statistik menggunakan tabular figures. Rumus tetap memakai KaTeX.

## Warna

Palet pilihan pengguna dan fungsi setiap warna ada di `color-pallete.md`. Gunakan token di `app/globals.css`; hindari warna literal pada komponen baru. Turunan lebih gelap dipakai untuk teks, tautan, dan fokus yang membutuhkan kontras. Status selalu disertai teks atau tanda; warna tidak menjadi satu-satunya pembeda.

Bidang besar selalu netral. Mode gelap memakai charcoal, bukan latar hijau. Teal dan mint menandai tindakan atau pilihan; cream dan orange hanya aksen kecil. Panel tinjauan tetap mengikuti permukaan kartu, dengan ikon cream sebagai penanda. Teks keterangan memakai `--text-muted` agar tetap terbaca pada kedua tema. Batas kontrol lebih kuat daripada garis dekoratif kartu.

## Bentuk dan ruang

- Jarak mengikuti kelipatan 4px; jarak umum 8, 12, 16, 20, 24, 32, dan 40px.
- Radius input dan tombol 8px; lembar soal, kartu, dan dialog 12px.
- Bentuk pil hanya untuk label pendek, progres, dan avatar.
- Kartu statis memakai bidang rata dengan garis tipis. Kartu tidak terangkat ketika disentuh atau di-hover.
- Bayangan dipakai untuk menu dan dialog yang mengambang. Hindari glow dan gradien dekoratif.
- Susunan mengikuti isi: baris untuk riwayat dan topik, kelompok angka untuk ringkasan, kartu untuk tindakan berikutnya dan lembar soal.

## Dashboard orang tua

Urutan informasi: identitas anak, latihan terbaru dan tinjauan yang tertunda, ringkasan angka, materi untuk dilatih lagi, aktivitas terakhir. Rata-rata nilai ditampilkan satu kali dan tidak dilabeli sebagai persentase penguasaan seluruh materi.

Topik menggunakan `buildInsights` dan sumber bukti yang sama dengan laporan: jawaban yang sudah dinilai, scoring version 2, dalam 90 hari terakhir. Topik dengan data belum cukup tidak dipresentasikan sebagai kelemahan anak. Semua data dipisahkan per anak dan kesulitan.

## Latihan anak

- Satu soal menjadi pusat perhatian. Navigasi orang tua dan informasi kuota disembunyikan selama pengerjaan.
- Pilihan jawaban dan potongan mempunyai area tekan minimal 48px, fokus keyboard terlihat, dan status pilihan disertai tanda.
- Tombol umum berukuran minimal 48px; tombol kecil dan ikon minimal 44px. Tautan berbentuk tombol menggunakan `buttonStyles`, tanpa menumpuk elemen tombol di dalam tautan.
- Tombol sebelumnya dan selanjutnya selalu jelas. Seluruh nomor soal dapat dibuka melalui bagian yang dapat diperluas.
- Jawaban tetap tersimpan di perangkat selama latihan. Tampilan hasil membedakan nilai final dari jawaban yang masih menunggu tinjauan.
- Ilustrasi menjelaskan soal atau materi. Hindari karakter dan dekorasi yang tidak berhubungan dengan aktivitas.

## Formulir, laporan, dan cetak

Form pembuatan terbagi menjadi materi belajar, bentuk latihan, dan ringkasan sebelum membuat soal. Label berada di atas input; bantuan dan kesalahan terhubung melalui `aria-describedby`. Pilihan materi menampilkan status terpilih. Hasil otomatis tersimpan dan tidak dapat diedit; informasi kuota dan status pemrosesan tetap terlihat.

Laporan menampilkan topik, jumlah jawaban yang menjadi bukti, kesulitan, dan tindakan berikutnya. Grafik memakai token warna identitas. Worksheet cetak memakai tinta gelap di atas kertas putih, penomoran jelas, dan ruang untuk jawaban.

## Bahasa dan gerak

Gunakan bahasa Indonesia konkret: Buat latihan, Buka latihan, Tinjau jawaban, Latih topik ini. Kehangatan muncul dari bantuan dan umpan balik yang jelas. AI dijelaskan ketika relevan dengan pembuatan soal.

Dialog menggunakan elemen native `dialog` agar fokus terkunci di dalamnya, Escape menutup, dan fokus kembali ke pemicu. Navigasi mobile mengunci fokus dan menonaktifkan isi di belakangnya. Menu akun dan pemilih anak dapat ditutup dengan Escape. Tautan lewati navigasi tersedia bagi pengguna keyboard.

Halaman depan menampilkan contoh soal interaktif yang jelas ditandai sebagai contoh. Angka nilai, poin, dan testimoni tanpa sumber tidak ditampilkan. Harga mengikuti konfigurasi paket aplikasi.

Transisi singkat 150–200ms untuk perubahan keadaan; jangan menambahkan gerak pada seluruh kartu. Hormati `prefers-reduced-motion`. Semua tindakan dapat diakses melalui keyboard; teks dan tata letak harus terbaca di mode terang, gelap, dan layar kecil.

## Referensi

- https://spectrum.adobe.com/getting-started/principles
- https://github.com/adobe-fonts/source-sans
