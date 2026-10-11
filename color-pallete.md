# Palet warna Teatch

Palet dipilih pengguna dari referensi empat warna. Keempat warna dasar dipertahankan; turunan dan warna netral melengkapi kebutuhan keterbacaan dan mode gelap.

| Warna  | Nilai   | Fungsi                                                        |
| ------ | ------- | ------------------------------------------------------------- |
| Mint   | #8AD6D1 | Tombol utama mode gelap, avatar, tanda pilihan                |
| Teal   | #359FA0 | Identitas dan progres; turunan gelap untuk tombol mode terang |
| Krem   | #FFF0C5 | Ikon panduan dan label tinjauan kecil                         |
| Oranye | #FF8C52 | Aksen apresiasi kecil; tidak menjadi warna semua tombol       |

- Teks utama mode terang: #292824. Aksen oranye memakai teks gelap.
- Tautan dan kontrol bertulisan putih memakai teal yang lebih gelap: #267879, bukan teal dasar.
- Latar terang: #F7F6F2; lembar soal dan kartu putih. Netral memakai abu-abu hangat, tanpa tint biru.
- Mode gelap: latar #181818, sidebar #1E1E1E, kartu #222222, hover #2C2C2C, dan garis #454545. Seluruh bidang besar netral; jangan memakai hijau sebagai latar halaman atau kartu.
- Teks mode gelap: #F2F1ED untuk isi utama dan #B8B5AE untuk keterangan. Input memakai garis #77746D agar batasnya terbaca. Mint digunakan pada tombol dan tanda aktif yang kecil, dengan teks #1C4042.
- Gunakan `--action-*`, `--selection-*`, `--text-muted`, dan `--accent-color` untuk elemen interaktif. Warna fokus, pilihan, serta kontrol native mengikuti tema, termasuk slider dan checkbox.
- Kesalahan memakai merah semantik terpisah, disertai pesan yang jelas.
- Hindari teks putih berukuran kecil pada #359FA0 (3.17:1) atau #FF8C52 (2.30:1).
- Nilai warna dikendalikan melalui token di `app/globals.css`. Komponen mengikuti fungsi token agar perubahan palet tetap konsisten.
