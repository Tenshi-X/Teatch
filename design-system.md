# Teatch — panduan design system

Teatch membantu orang tua menyiapkan latihan, mendampingi anak, meninjau jawaban, dan memahami perkembangan belajar. Identitasnya mengambil karakter buku belajar modern: jelas, ramah, dan terstruktur. Prinsip interaksi mengacu pada Adobe Spectrum; komponen menggunakan implementasi lokal Teatch.

## Tipografi

- Source Sans 3, dimuat melalui `next/font`, menjadi font utama aplikasi.
- Teks isi 16px dengan tinggi baris 1.6; keterangan 14px, label kecil 12px hanya jika masih terbaca.
- Judul halaman 30–36px, judul bagian 20–24px, bobot 600.
- Halaman latihan memakai teks isi 18px; PAUD, TK, dan SD kelas 1–2 memakai 20px. Soal utama 20–24px.
- Angka statistik menggunakan tabular figures. Rumus tetap memakai KaTeX.

## Warna

Palet pilihan pengguna dan fungsi setiap warna ada di `color-pallete.md`. Gunakan token di `app/globals.css`; hindari warna literal pada komponen baru. Turunan lebih gelap dipakai untuk teks, tautan, dan fokus yang membutuhkan kontras. Status selalu disertai teks atau tanda; warna tidak menjadi satu-satunya pembeda.

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
- Tombol sebelumnya dan selanjutnya selalu jelas. Seluruh nomor soal dapat dibuka melalui bagian yang dapat diperluas.
- Jawaban tetap tersimpan di perangkat selama latihan. Tampilan hasil membedakan nilai final dari jawaban yang masih menunggu tinjauan.
- Ilustrasi menjelaskan soal atau materi. Hindari karakter dan dekorasi yang tidak berhubungan dengan aktivitas.

## Formulir, laporan, dan cetak

Form pembuatan terbagi menjadi materi belajar, bentuk latihan, dan ringkasan sebelum membuat draf. Label berada di atas input. Informasi kuota serta status draf tetap terlihat.

Laporan menampilkan topik, jumlah jawaban yang menjadi bukti, kesulitan, dan tindakan berikutnya. Grafik memakai token warna identitas. Worksheet cetak memakai tinta gelap di atas kertas putih, penomoran jelas, dan ruang untuk jawaban.

## Bahasa dan gerak

Gunakan bahasa Indonesia konkret: Buat latihan, Buka latihan, Tinjau jawaban, Latih topik ini. Kehangatan muncul dari bantuan dan umpan balik yang jelas. AI dijelaskan ketika relevan dengan pembuatan atau pemeriksaan draf.

Transisi singkat 150–200ms untuk perubahan keadaan; jangan menambahkan gerak pada seluruh kartu. Hormati `prefers-reduced-motion`. Semua tindakan dapat diakses melalui keyboard; teks dan tata letak harus terbaca di mode terang, gelap, dan layar kecil.

## Referensi

- https://spectrum.adobe.com/getting-started/principles
- https://github.com/adobe-fonts/source-sans
