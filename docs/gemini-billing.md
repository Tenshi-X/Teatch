# Gemini: pemisahan trial, pelanggan, dan pemeriksaan billing

Diperbarui 30 Oktober 2026. Sebelum perubahan ini, seluruh paket memakai `GEMINI_API_KEY` yang sama. Hubungan key lama dengan akun "Billing Trenova" belum terverifikasi: gambar hanya memperlihatkan pilihan akun billing, koneksi API lokal sebelumnya gagal DNS, akses gcloud tidak tersedia, dan pemeriksaan Google AI Studio melalui browser berhenti karena permintaan akses aplikasi kehabisan waktu. Tidak ada billing, API key, atau proyek Google yang diubah dari sesi ini.

## Cara kerja yang sekarang

| Akun Teatch | Credential runtime | Proyek Google yang wajib dipakai |
| --- | --- | --- |
| `free_trial` aktif | `GEMINI_FREE_API_KEY` | Proyek dengan Gemini Free tier yang tidak terhubung ke paid billing |
| `basic`, `pro`, `family`, `teacher` aktif | `GEMINI_PAID_API_KEY` | Proyek Paid tier yang telah diverifikasi terhubung ke billing yang dituju |
| Paket tidak aktif, kedaluwarsa, atau tidak dikenali | Tidak mengirim request AI | Ditolak |

Model yang sama, termasuk 3.8 Flash, dapat ditawarkan pada Free tier dan Paid tier. Nama model tidak menentukan apakah suatu request gratis. Credential memilih proyek pemilik key; tier/billing proyek tersebut menentukan penagihan. Membuat dua key pada proyek berbayar yang sama tidak menghasilkan satu key gratis.

Model utama tetap 3.8 Flash, lalu fallback 3.5 Flash-Lite dan 3.6 Flash. Seluruh percobaan memakai **credential dari jalur yang sama**. Trial tidak pernah beralih ke key paid/legacy ketika key gratis tidak tersedia, rate limit tercapai, atau ketiga model gagal. Server memilih jalur dari profil pengguna di database, bukan body browser. Profil dibaca kembali setelah reservasi untuk menangani perubahan paket oleh admin saat preflight; `admin_update_profile` memblokir perubahan paket selama generasi masih reserved.

Key identik atau project ID identik pada dua jalur ditolak. Pemeriksaan ini menangkap kesalahan konfigurasi sederhana; ia tidak membuktikan project ID yang diisi benar-benar pemilik key. Tidak ada API flag pada request generasi yang memaksa key proyek berbayar menjadi gratis. Jika proyek free kemudian dihubungkan ke billing, asumsi gratis tidak lagi berlaku; status proyek Google tetap perlu diperiksa oleh pengelola.

## Pemeriksaan key ke Billing Trenova

1. Di **Google AI Studio → API Keys**, temukan key yang benar-benar dipakai di Vercel. Cocokkan key secara privat; jangan membagikan nilainya atau memasukkannya ke log. Catat **project ID** milik key, bukan hanya nama tampilan.
2. Buka proyek dengan ID tersebut di **Google Cloud Console → Billing**. Pastikan halaman proyek menunjukkan akun billing yang terhubung adalah **Billing Trenova**. Memilih nama billing pada dropdown belum membuktikan proyek key sudah terhubung ke akun itu.
3. Periksa akun billing aktif dan tidak ditangguhkan. Di AI Studio, periksa proyek berstatus Paid tier serta status kredit/pembayaran yang diperlukan. Metadata `models.list`/detail model HTTP 200 saja tidak membuktikan izin inference, saldo, atau billing aktif.
4. Setelah hubungan itu terbukti, gunakan key proyek tersebut sebagai `GEMINI_PAID_API_KEY`. Key lama boleh dipakai kembali hanya setelah proyek dan tier-nya diperiksa.
5. Untuk `GEMINI_FREE_API_KEY`, gunakan proyek lain yang di AI Studio berstatus Free tier dan tidak terhubung ke paid billing. Kelayakan free tier ditentukan Google; tidak semua proyek/akun dijamin mendapat akses gratis. Jika ditolak atau kuota habis, kode trial tetap berhenti tanpa memakai paid key.

## Environment sebelum deployment

Isi pada Vercel Production dan `.env.local` untuk pengujian lokal:

```dotenv
GEMINI_FREE_API_KEY=<key-proyek-free-tier>
GEMINI_PAID_API_KEY=<key-proyek-paid-tier>
TEATCH_AI_MODEL=gemini-3.8-flash

# Dianjurkan untuk guard konfigurasi dan pencatatan; bukan verifikasi provider.
GEMINI_FREE_PROJECT_ID=<project-id-gratis>
GEMINI_PAID_PROJECT_ID=<project-id-berbayar>
```

Kedua key wajib terpisah dan masing-masing diperlukan untuk jalurnya. Runtime web tidak lagi memakai `GEMINI_API_KEY`. Variabel lama hanya dipakai CLI evaluasi milik pengelola dan boleh dikosongkan jika tidak menjalankan evaluasi. Jangan otomatis menyalin key lama ke jalur trial karena tier-nya belum diketahui.

Setelah konfigurasi benar, commit/push versi ini dan tunggu deployment Ready. Tidak ada migrasi database tambahan. Jalankan `npm run check:runtime` untuk memeriksa kelengkapan kedua jalur dan endpoint metadata; hasilnya **bukan bukti billing terhubung**. Pengujian read-only sesi ini mendeteksi key jalur free/paid belum diisi; key generik lama tetap dipertahankan dan tidak dipakai runtime baru.

## Biaya per soal

Tarif Standard text Gemini 3.8 Flash sampai 31 Desember 2026: **US$0,75 per satu juta token input** dan **US$3,75 per satu juta token output termasuk thinking**. Mulai 1 Januari 2027, tarif yang diumumkan adalah US$1,50 dan US$7,50. Gemini 3.6 Flash memakai tarif yang sama; 3.5 Flash-Lite US$0,30 input dan US$2,50 output per juta token.

```text
biaya USD = (token input × tarif input + (token output + thinking) × tarif output) / 1.000.000
biaya per soal = total biaya seluruh percobaan / jumlah soal yang diterima
```

Contoh berikut memakai token ilustratif dan asumsi konversi **Rp16.500/US$**, bukan kurs real-time atau pengukuran produksi:

| Isi satu request | Input | Output termasuk thinking | Biaya/request | Biaya/soal |
| --- | ---: | ---: | ---: | ---: |
| 1 soal | 2.000 | 500 | US$0,003375 ≈ Rp56 | ≈ Rp56 |
| 10 soal | 2.000 | 3.500 | US$0,014625 ≈ Rp241 | ≈ Rp24 |

Ini bukan harga tetap atau batas biaya. Pajak, kurs tagihan, biaya hosting/database, respons gagal, dan token tambahan pada fallback belum dimasukkan dalam contoh. Biaya yang sesungguhnya baru diketahui dari metadata request yang terukur serta laporan provider. Sesi ini tidak menjalankan generasi provider dan belum dapat mengakses data penggunaan produksi.

JSON `generation_requests.usage` sekarang menyimpan `billingTier`, `keySource`, project ID yang dikonfigurasi bila diisi, serta metadata setiap percobaan model. API key tidak disimpan dalam metadata. Jalur paid juga mencatat `pricingDate` dan `estimatedCostUSD`; nilainya `null` bila ada token yang tidak terukur, model tanpa tarif, atau metadata tidak konsisten. Tarif fallback dihitung per model. Estimasi ini memakai tarif publik, bukan invoice atau bukti project billing sudah diverifikasi.

## Sumber resmi

- [Google: Billing Gemini API](https://ai.google.dev/gemini-api/docs/billing)
- [Google: proyek pemilik API key](https://ai.google.dev/gemini-api/docs/api-key)
- [Google: memeriksa billing proyek](https://docs.cloud.google.com/billing/docs/how-to/verify-billing-enabled)
- [Google: tarif Gemini API](https://ai.google.dev/gemini-api/docs/pricing)
- [Google: kelayakan proyek dan masalah billing](https://ai.google.dev/gemini-api/docs/troubleshooting)
