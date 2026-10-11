# Palet warna Teatch

Palet dipilih pengguna dari referensi empat warna. Keempat warna dasar dipertahankan; turunan dan warna netral melengkapi kebutuhan keterbacaan dan mode gelap.

| Warna  | Nilai   | Fungsi                                    |
| ------ | ------- | ----------------------------------------- |
| Mint   | #8AD6D1 | Sorotan lembut, avatar, bidang pendamping |
| Teal   | #359FA0 | Identitas, progres, elemen aktif          |
| Krem   | #FFF0C5 | Bidang panduan dan tinjauan orang tua     |
| Oranye | #FF8C52 | Tombol utama dan aksi penting             |

- Teks utama gelap: #1E293B. Tombol oranye memakai teks gelap; kontras sekitar 6.36:1.
- Tautan dan kontrol bertulisan putih memakai teal yang lebih gelap: #267879, bukan teal dasar.
- Latar terang: #FFFDF7; lembar soal dan kartu putih membantu menjaga hierarki.
- Mode gelap memakai latar #122527 dan bidang #1C3335; gunakan teks terang dan turunan mint untuk sorotan.
- Kesalahan memakai merah semantik terpisah, disertai pesan yang jelas.
- Hindari teks putih berukuran kecil pada #359FA0 (3.17:1) atau #FF8C52 (2.30:1).
- Nilai warna dikendalikan melalui token di `app/globals.css`. Komponen mengikuti fungsi token agar perubahan palet tetap konsisten.
