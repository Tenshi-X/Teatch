# Implementation Plan Teatch

Tanggal: 30 Oktober 2026. Status: implementasi kode tahap 1–3 tersedia; verifikasi provider dan pilot pengguna belum selesai. Lihat [status pengembangan](development-status.md) untuk bukti pemeriksaan dan langkah menjalankan.

Penyesuaian dari pemilik: belum ada pengguna pelanggan. Pengujian pribadi tidak menunggu rekrutmen pilot dan dapat memakai proyek Supabase yang ada. Mode `public` yang tetap memerlukan login disiapkan untuk akun sendiri; mode pilot dan pembatasan kelas/pelajaran tersedia saat diperlukan. Checklist berikut mempertahankan kriteria rencana awal; status aktual per paket dicatat pada dokumen pengembangan agar pekerjaan lokal tidak disamakan dengan bukti produksi.

Tujuan: membawa fitur yang sudah tersedia menuju pilot terukur, lalu penjualan awal dengan aktivasi paket yang dapat ditelusuri. Dokumen ini menjadi backlog implementasi; [rollout.md](rollout.md) tetap menjadi panduan operasi dan peluncuran.

## 1. Baseline dan batas analisis

Hasil pemeriksaan lokal pada analisis sebelumnya di sesi yang sama:

| Pemeriksaan                     | Hasil                                                                       |
| ------------------------------- | --------------------------------------------------------------------------- |
| Tes otomatis                    | 59 lulus; database lokal PGlite dan model tiruan                            |
| Lint / TypeScript               | Lulus                                                                       |
| Build Webpack                   | `npm run build -- --webpack` berhasil                                       |
| Build default Turbopack         | Gagal dengan error internal saat membuat proses pengolah CSS                |
| Audit dependensi terbaru        | Belum selesai; registry npm tidak dapat diakses dari lingkungan pemeriksaan |
| Database / deployment produksi  | Belum diverifikasi                                                          |
| Biaya dan mutu respons AI nyata | Belum dibuktikan oleh pemeriksaan lokal                                     |

Profil anak, 16 kontrak tipe soal, penyimpanan otomatis hasil generate, pengerjaan, penilaian lokal, tinjauan uraian, laporan, cetak, dan reservasi kuota sudah tersedia. Hasil generate langsung siap digunakan dan tidak dapat diedit pengguna; migrasi 007 menghapus tahap draf dan persetujuan. Bukti implementasi lokal serta pekerjaan yang menunggu akses provider dicatat pada dokumen status pengembangan.

## 2. Cakupan rilis pertama

- Pengguna pilot: 10–15 orang tua anak SD kelas 1–4, selama sekitar dua minggu.
- Materi generasi baru: Matematika dan Bahasa Indonesia pada lingkup tujuan belajar yang tersedia.
- Tipe awal: `multiple_choice`, `short_answer`, `true_false`.
- Alur utama: login Google → profil anak → pilih materi → buat latihan → otomatis tersimpan → kerjakan → lihat hasil dan latihan berikutnya.
- Pertahankan akses ke profil dan latihan tersimpan di luar cakupan pilot. Pembatasan berlaku pada generasi baru, diperiksa pada server dan formulir.
- Pertahankan Next.js + Supabase, penilaian lokal, serta hitungan kuota per soal. Pembaruan 30 Oktober 2026: atas permintaan pemilik, panggilan model kini maksimal tiga dengan fallback 3.8 Flash → 3.5 Flash-Lite → 3.6 Flash, tetap satu operasi generasi dan satu debit kuota.
- Harga dan kuota saat ini menjadi baseline eksperimen. Perubahan penawaran diputuskan setelah biaya nyata dan respons peserta diketahui.

Rilis pertama belum mencakup aplikasi native, chatbot, akun guru/kelas, pembukaan seluruh tipe soal, pembayaran otomatis, atau sinkronisasi jawaban lintas perangkat. Kebutuhan tersebut dinilai kembali setelah pilot.

## 3. Urutan pekerjaan dan dependensi

Estimasi adalah hari kerja efektif satu pengembang, termasuk pemeriksaan dan perbaikan biasa. Waktu akses provider, review materi, rekrutmen, dan pengukuran berbayar dapat menambah durasi. Perkiraan keseluruhan: 18–28 hari kerja pengembangan, ditambah observasi pilot sekitar dua minggu; kurang lebih 6–8 minggu kalender jika dependensi tersedia.

| ID       | Hasil yang dikirim                                           | Dependensi                              | Estimasi           |
| -------- | ------------------------------------------------------------ | --------------------------------------- | ------------------ |
| OPS-00   | Inventaris staging, migrasi, kredensial, dan baseline        | Akses provider dari pemilik             | 1–2 hari           |
| PR-01    | Sesi login dan jalur build yang dapat direproduksi           | Baseline lokal                          | 1–2 hari           |
| PR-02    | Konfigurasi model dan perangkat evaluasi mutu/biaya          | OPS-00 untuk pengukuran nyata           | 3–4 hari           |
| PR-03    | Pembacaan status generasi dan pemulihan kuota                | PR-01; staging bermigrasi               | 2–3 hari           |
| PR-04    | Alur latihan pertama dan pilihan materi siap pakai           | PR-01; PR-02/03 untuk penerimaan penuh  | 2–3 hari           |
| PR-05    | Pembacaan dashboard dan laporan yang lebih efisien           | Baseline performa; staging              | 2–3 hari           |
| PR-06    | Pembatasan pilot, feedback, metrik, dan penawaran yang jelas | PR-02/03/04                             | 2–3 hari           |
| PILOT-07 | Laporan dua minggu dan backlog berdasarkan pemakaian         | Seluruh gate pilot lulus                | 2 minggu observasi |
| PR-08    | Pencatatan pesanan dan aktivasi paket yang atomik            | Hasil pilot dan aturan paket ditetapkan | 3–5 hari           |

Urutan mulai: OPS-00 dan PR-01, kemudian PR-02 → PR-03 → PR-04 → PR-05 → PR-06. Pekerjaan lokal yang tidak bergantung pada akun provider tetap dapat dilanjutkan ketika verifikasi eksternal belum tersedia. AI pilot baru diaktifkan setelah gate pada bagian 8 lulus.

## 4. Detail pekerjaan

### OPS-00 — Verifikasi kondisi aktual

**Pekerjaan**

- [ ] Catat commit aplikasi terpasang, lingkungan deployment, region aplikasi/database, versi Node, dan konfigurasi fitur tanpa menyimpan nilai rahasia.
- [ ] Bandingkan riwayat migrasi nyata dengan 001–005. Buat cadangan dan uji pemulihan pada staging sebelum perubahan skema.
- [ ] Periksa RLS, hak kolom profil, hak eksekusi RPC, bucket privat, dan kebijakan storage tambahan pada staging.
- [ ] Verifikasi status rotasi kunci yang dicatat pernah terpapar dalam rollout. Jika belum selesai, pemilik provider mengganti/mencabut kunci dan memperbarui environment.
- [ ] Verifikasi akses model pada proyek tujuan, konfigurasi OAuth/redirect Google, dan keberadaan akun admin yang ditetapkan secara terotorisasi.
- [ ] Siapkan dua akun orang tua, satu admin, data contoh anonim, serta skenario saldo terbatas.
- [ ] Simpan catatan hasil dan tanggal pemeriksaan pada dokumen penerimaan staging; tandai informasi lama yang belum dikonfirmasi di rollout.

**Output:** `docs/staging-acceptance.md` (baru), pembaruan status pada `docs/rollout.md`.

**Selesai ketika:** setiap dependensi mempunyai bukti verifikasi atau pemilik tindak lanjut; migrasi diketahui urutannya; staging dapat dipakai tanpa data anak produksi. Migrasi 005 tidak dijalankan ulang pada database yang sudah menerapkannya.

### PR-01 — Perbaikan sesi dan kepastian build

**File utama:** `lib/supabase/proxy.ts`, `lib/supabase/server.ts`, `lib/server/ownership.ts`, `proxy.ts`, `package.json`, `.github/workflows/ci.yml`, `tests/auth.test.ts`.

- [ ] Teruskan header cache dari callback SSR SDK sesuai tipe versi terpasang. Saat membuat redirect, salin cookie hasil refresh beserta header `cache-control`, `expires`, dan `pragma` yang relevan.
- [ ] Pastikan respons yang membawa sesi tidak tersimpan sebagai cache publik. Otorisasi tetap diperiksa pada akses data/server action/API.
- [ ] Batasi pemeriksaan pada proxy ke rute yang membutuhkannya; ukur pengaruhnya pada landing page dan API.
- [ ] Satukan pembacaan user/profil berulang dalam satu request melalui helper server. Cache hanya selama request, tanpa cache bersama antar akun.
- [ ] Evaluasi `getClaims()` untuk pemeriksaan identitas yang sesuai konfigurasi signing key. Pertahankan `getUser()` pada operasi yang membutuhkan status sesi terkini; penggantian tidak dilakukan secara menyeluruh tanpa uji pencabutan sesi.
- [ ] Reproduksi build default di CI Linux dengan `npm ci`. Jika masalah hanya muncul pada lingkungan lokal, dokumentasikan workaround. Jika gagal juga di CI, gunakan Webpack secara eksplisit untuk jalur rilis dan catat tindak lanjut Turbopack.
- [ ] Ulangi audit runtime saat registry tersedia; tangani temuan berdasarkan advisori aktual, tanpa menganggap hasil audit lama masih berlaku.

**Penerimaan:** login/callback/logout, token mendekati kedaluwarsa, redirect setelah refresh, akun tanpa sesi, dan akses admin diuji. Cookie refresh bertahan setelah redirect; tidak ada kebocoran cache antar akun; satu jalur build produksi lulus pada CI.

### PR-02 — Model AI dan evaluasi yang dapat dijalankan

**File utama:** `services/ai/gemini.ts`, `services/ai/generation.ts`, `services/ai/prompts.ts`, `lib/learning/cost-evaluation.ts`, `scripts/evaluate-ai-cost.ts`, `.env.example`, `tests/generation.test.ts`, `tests/cost.test.ts`.

**Tambahan yang direncanakan:** konfigurasi model server, manifest kasus evaluasi, dan script pengambilan sampel AI staging.

- [ ] Pindahkan pilihan model ke konfigurasi server dengan daftar model yang sudah diuji. Model/prompt terpilih dicatat pada usage; browser tidak boleh memilih model bebas.
- [ ] Uji kompatibilitas schema JSON, pengaturan thinking, batas output, timeout, dan metadata token untuk setiap kandidat. Evaluasi tiap model tetap satu request tanpa fallback; runtime memakai fallback terbatas yang diminta pemilik, tanpa retry SDK tersembunyi.
- [ ] Pisahkan kategori kegagalan: konfigurasi/akses model, rate limit, timeout, transport, respons terpotong, JSON/schema tidak valid, dan kegagalan simpan. Simpan kode aman untuk admin serta pesan yang dapat ditindaklanjuti pengguna.
- [ ] Buat manifest kasus anonim untuk kelas 1–4, dua pelajaran, tiga tipe, tingkat kesulitan yang dibuka, dan variasi jumlah soal. Tambahkan metadata kelas, tujuan, versi prompt, serta ID kasus pada pengukuran agar cakupan kelas tidak hilang dalam label `SD`.
- [ ] Hitung jumlah panggilan dan proyeksi biaya dari manifest sebelum eksekusi. Terapkan batas jumlah request/biaya, checkpoint, dan penghentian saat anggaran tercapai. Tarif diverifikasi pada tanggal pengukuran; script nyata terpisah dari CI biasa.
- [ ] Ambil baseline dari versi terpasang yang teridentifikasi bila tersedia. Jika tidak tersedia, tetapkan baseline terukur terlebih dahulu dan jangan mengklaim penghematan dibanding produksi.
- [ ] Jalankan evaluator yang ada: minimal 20 baseline dan 20 kandidat per kelompok yang dibandingkan; kelompok meliputi model, jenjang, pelajaran, tipe, kesulitan, dan jumlah soal. Cakupan jumlah 1–20 adalah keseluruhan data; jangan mengasumsikan semua kombinasi harus dibuat tanpa menghitung anggaran.
- [ ] Jika membandingkan model berbeda, gunakan laporan benchmark terpisah dengan tarif per model dan kasus berpasangan. Evaluator saat ini memakai model pada kunci kelompok dan satu pasangan tarif; hasil lintas model tidak boleh dipaksakan menjadi lulus.
- [ ] Bila model baru dipilih, tetapkan baseline baru dan jalankan kembali gate prompt pada model yang sama. Simpan alasan pemilihan, hasil review, tarif, dan batas biaya yang diterima.
- [ ] Tinjau semua soal valid: kunci, pembahasan, ambiguitas, usia/kelas, dan kesesuaian tujuan. Jangan hanya meninjau struktur JSON.

**Penerimaan:** respons valid pertama minimal 95% pada setiap kelompok yang dinilai; seluruh kunci valid ditinjau dan konsisten; biaya gagal ikut dihitung; token tak diketahui tetap ditandai belum direkonsiliasi. Gate evaluator yang ada tetap berlaku. Pemilihan model baru memerlukan laporan penerimaan eksplisit, bukan klaim penghematan dari tes tiruan.

### PR-03 — Status generasi dan pemulihan yang aman

**File utama:** `app/api/ai/generate/route.ts`, `services/ai/pipeline.ts`, `components/worksheets/worksheet-builder.tsx`, `app/actions/admin.ts`, `tests/generation.test.ts`, `tests/database.test.ts`.

**Tambahan:** `app/api/ai/generation-status/route.ts` dan tes pembacaan status (baru).

- [ ] Tambahkan endpoint baca status berdasarkan `requestKey`. Ambil parent dari sesi, lalu batasi pencarian ke parent tersebut; service client hanya dipakai di server. Kunci tidak dikenal atau milik akun lain menghasilkan respons yang sama tanpa membocorkan keberadaannya.
- [ ] Respons minimal: `not_found`, `reserved`, `succeeded`, atau `failed`, `worksheetId` jika sesuai, dan informasi aman tentang langkah berikutnya. Gunakan `private, no-store`.
- [ ] Pisahkan pembacaan status dari izin membuat AI baru: hasil milik sendiri tetap dapat diambil saat kill switch dimatikan atau akun keluar dari pilot.
- [ ] Pada reload/koneksi terputus, cek status permintaan tersimpan terlebih dahulu. Poll dengan jeda meningkat, berhenti saat terminal, tab tersembunyi, unmount, atau batas waktu pemantauan tercapai.
- [ ] `succeeded` membuka latihan tersimpan yang sama; `reserved` menampilkan proses masih berlangsung; `failed` menjelaskan status kuota. `not_found` tidak otomatis membuat operasi baru.
- [ ] Pengiriman ulang POST hanya mengikuti tindakan pengguna dan memakai kunci yang sama saat hasil belum pasti. Tombol operasi baru menjelaskan bahwa operasi sebelumnya masih mungkin selesai dan memakai kuota tersendiri.
- [ ] Jadwalkan RPC rekonsiliasi yang sudah ada setiap lima menit pada scheduler database jika tersedia. Jika memakai scheduler HTTP eksternal, endpoint harus terautentikasi dengan secret server; kredensial service role tidak pernah masuk URL/browser/log.
- [ ] Ambang reservasi usang tetap 15 menit. Pemantauan membaca umur reservasi, hasil rekonsiliasi, dan `quota_audit()`; kegagalan scheduler terlihat oleh operator.
- [ ] Ukur durasi end-to-end. Request generasi tetap sinkron pada tahap ini; polling tidak menjamin proses tetap hidup setelah server berhenti. Jika timeout operasional sering terjadi, buat rancangan worker/queue persisten sebagai pekerjaan terpisah.

**Penerimaan:** polling tidak memanggil Gemini, tidak mengubah kuota, dan tidak bisa membaca akun lain. Respons commit yang hilang mengembalikan worksheet yang sama. Dua koneksi staging membuktikan debit/refund tepat sekali, saldo nonnegatif, serta rekonsiliasi berulang dan finalisasi terlambat tetap aman.

### PR-04 — Latihan pertama yang mudah dipahami

**File utama:** `app/(auth)/onboarding/page.tsx`, `app/actions/profile.ts`, `components/children/child-form.tsx`, `app/actions/children.ts`, `components/worksheets/worksheet-builder.tsx`, `app/(dashboard)/dashboard/dashboard-view.tsx`, `components/quiz/quiz-engine.tsx`, `components/worksheets/worksheet-printable.tsx`.

- [ ] Jadikan nomor WhatsApp opsional untuk mencoba layanan; ubah UI dan validasi server bersama. Periksa nullability database sebelum memutuskan perlu migrasi. Pengaturan akun tetap menyediakan cara melengkapinya.
- [ ] Arahkan akun tanpa anak ke tambah anak, lalu ke pemilihan latihan pertama. Simpan ulang form yang gagal tanpa menghilangkan isian.
- [ ] Tambahkan pilihan materi berbasis kelas dan objective yang sudah tersedia, misalnya penjumlahan sampai 20 dan memahami bacaan pendek. Ini preset parameter generasi, bukan bank soal yang mengaku sudah direview.
- [ ] Gunakan default 10 soal untuk cakupan pilot, dengan kontrol jumlah dan ringkasan kuota yang jelas. Parameter pilihan materi tetap divalidasi API.
- [ ] Jelaskan bahwa hasil otomatis tersimpan, langsung siap dikerjakan, dan tidak dapat diedit pengguna. Jelaskan penilaian dan latihan ulang. Hindari persentase progres generasi yang tidak mempunyai dasar.
- [ ] Uji layout 360 px, sentuhan, keyboard, fokus, status loading/error, pergantian profil, serta hasil cetak A4 dan kunci terpisah.
- [ ] Pisahkan progres tersimpan menurut akun dan anak; bersihkan state sesi serta progres sensitif saat logout secara terkontrol. Pertahankan jawaban saat submit gagal pada akun yang sama.
- [ ] Nyatakan bahwa progres belum tersinkron lintas perangkat. Uji penyimpanan browser tidak tersedia agar pengguna memperoleh pesan yang jelas.

**Penerimaan:** alur login → profil → 10 soal otomatis tersimpan → latihan → hasil → cetak selesai di mobile dan desktop. Tidak ada editor atau langkah persetujuan soal. Reload mempertahankan progres pada perangkat yang sama; kegagalan menyimpan tidak menghapus jawaban; pergantian akun tidak menampilkan progres sebelumnya.

### PR-05 — Performa dashboard dan laporan

**File utama:** `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/statistics/page.tsx`, `lib/server/learning-evidence.ts`, `lib/learning/insights.ts`, `components/learning/learning-summary.tsx`, `app/actions/admin.ts`, `tests/database.test.ts`, `tests/learning.test.ts`.

- [ ] Catat baseline jumlah query, waktu auth/database, TTFB, ukuran payload, dan waktu navigasi pada data 1, 3, dan 6 anak dengan riwayat kecil/besar. Pisahkan cold/warm dan dokumentasikan region serta kondisi jaringan.
- [ ] Ganti perulangan pembacaan semua attempt untuk total/rata-rata dengan agregasi database. Gunakan query batch atau RPC baca yang tetap menerapkan kepemilikan/RLS, dengan akses default ditolak sebelum grant yang diperlukan.
- [ ] Agregasikan bukti 90 hari sebelum dikirim ke browser. Pertahankan grouping per anak, pelajaran, objective/topik, dan kesulitan; hanya versi penilaian 2 yang selesai; minimal lima jawaban; tren lima latihan dibanding lima sebelumnya.
- [ ] Buat pengujian kesetaraan hasil agregasi dengan fungsi lama memakai data yang mewakili batas hari, riwayat lama, review tertunda, dan beberapa anak. Perbaiki pengelompokan array yang menyalin seluruh kelompok setiap baris bila masih dipakai pada data besar.
- [ ] Periksa index nyata dan `EXPLAIN` di staging. Tambahkan hanya index yang terbukti membantu pola filter/join/order.
- [ ] Batasi daftar admin dan aktivitas dengan pagination; gunakan agregasi untuk total agar seluruh profil/generasi tidak perlu dimuat pada setiap pembukaan.

**Penerimaan:** nilai dan rekomendasi setara, akun terisolasi, dan jumlah request data dashboard tidak bertambah linear terhadap jumlah anak. Target awal maksimal enam query data utama per load, di luar auth/storage. Target performa sementara: p95 TTFB warm dashboard ≤800 ms pada kondisi staging yang dicatat; jika gagal, dokumentasikan bottleneck dan tindakan sebelum memperbesar pilot. Ini target pengukuran, bukan hasil saat ini.

### PR-06 — Pembatasan pilot, feedback, dan metrik

**File utama:** `lib/server/features.ts`, `lib/learning/generation-availability.ts`, `app/api/ai/generate/route.ts`, `components/worksheets/worksheet-builder.tsx`, `app/actions/attempts.ts`, `app/actions/worksheets.ts`, `app/actions/admin.ts`, `app/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`.

- [ ] Tambahkan mode akses eksplisit `disabled`, `pilot`, dan `public` pada konfigurasi server. `TEATCH_AI_ENABLED=false` tetap kill switch; mode pilot dengan daftar kosong menolak generasi semua akun. Mode public hanya aktif bila dipilih eksplisit, bukan akibat daftar pilot kosong.
- [ ] Gunakan resolver cakupan yang sama pada form dan API untuk kelas/pelajaran/tipe. Penolakan dilakukan sebelum reservasi kuota. Tes akun nonpilot, kelas kosong, dan manipulasi input.
- [ ] Tambahkan feedback sederhana setelah hasil serta di dashboard: kategori, komentar opsional terbatas, dan konteks worksheet milik akun. Pakai tabel feedback di Supabase dan tampilan admin, tanpa layanan pesan eksternal baru.
- [ ] Gunakan tabel domain sebagai sumber metrik pembuatan/penerbitan/hasil agar event tidak hilang akibat browser ditutup. Tambahkan event minimal untuk awal latihan, kunjungan kembali, dan klik paket yang belum tercatat pada domain.
- [ ] Event hanya berisi ID internal, jenis, waktu, dan sumber terbatas; tanpa nama anak, tanggal lahir, isi jawaban, topik bebas, atau kontak. Identitas ditentukan server. Event klien dideduplikasi, dibatasi frekuensinya, dan ditandai sebagai sinyal observasi.
- [ ] Kegagalan pencatatan analitik tidak menggagalkan worksheet atau jawaban yang sudah committed. Tentukan retensi event mentah 90 hari dan pembersihannya; akses admin/akun sendiri mengikuti kebijakan yang diuji.
- [ ] Rapikan nama produk dan tautan kontak/penjualan berdasarkan identitas yang dikonfirmasi pemilik. Jangan mengganti kontak dengan data rekaan. Hapus janji dukungan 24/7/premium yang belum mempunyai layanan jelas; tampilkan kuota, masa aktif, dan proses aktivasi manual.
- [ ] Perbarui kebijakan privasi sesuai data feedback/event yang benar-benar dikumpulkan. Dokumentasikan alur permintaan salinan/penghapusan akun yang saat ini melalui dukungan.

**Penerimaan:** hanya peserta dan cakupan yang ditentukan dapat membuat AI; latihan tersimpan tetap dapat dipakai. Feedback masuk admin; event tidak mengandung isi belajar pribadi; pembelian belum dijanjikan otomatis. Ringkasan pilot dapat dihitung tanpa menghitung retry sebagai pengguna atau transaksi baru.

### PILOT-07 — Pengujian bersama pengguna

**Pelaksana:** pemilik produk mengajak peserta; pengembang memantau sistem dan memperbaiki temuan. Dokumen rencana ini tidak mengirim undangan atau mengaktifkan konfigurasi produksi.

- [ ] Aktifkan untuk peserta setelah seluruh gate teknis lulus; beri panduan singkat dan satu latihan awal.
- [ ] Catat kesulitan tanpa mengarahkan seluruh langkah pengguna. Kelompokkan masalah menjadi mutu materi, kebingungan UI, kegagalan sistem, dan kebutuhan produk.
- [ ] Tinjau log kegagalan, laporan soal, pemakaian token, dan audit kuota setiap hari pilot. Matikan tipe/generasi yang bermasalah bila perlu.
- [ ] Lakukan wawancara singkat: manfaat yang dirasakan, alasan kembali, alasan berhenti, dan respons terhadap paket saat ini.
- [ ] Hasil akhir berupa `docs/pilot-report.md`: denominator, jumlah absolut, periode, segmen, kendala, biaya per soal diterima, keputusan lanjut/perbaiki, dan backlog berurutan.

| Metrik          | Definisi dan target awal                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aktivasi        | Peserta eligible yang menerbitkan dan mengirim minimal satu latihan dalam 72 jam sejak akses diberikan / seluruh peserta eligible; target hipotesis ≥70%            |
| Kembali belajar | Peserta teraktivasi yang mengirim latihan pada hari ke-7 sampai ke-13 sejak aktivasi / peserta yang sudah melewati seluruh jendela observasi; target hipotesis ≥40% |
| Validitas AI    | Operasi model dengan hasil valid pertama / seluruh operasi yang memanggil model; target teknis ≥95%                                                                 |
| Mutu            | Tidak ada laporan salah kunci atau materi tidak sesuai yang belum ditangani untuk cakupan yang tetap dibuka                                                         |
| Kuota           | Selisih ledger 0; tidak ada debit/refund ganda atau reservasi usang melewati jadwal rekonsiliasi berikutnya                                                         |
| Biaya           | Biaya termasuk kegagalan per soal diterima; dibedakan menurut model dan kelompok evaluasi                                                                           |

Target aktivasi/retensi adalah hipotesis produk pada sampel kecil, bukan bukti statistik. Jendela retensi peserta yang belum lengkap dilaporkan sebagai belum matang, bukan dianggap gagal. Hasil pilot menentukan apakah perlu memperbaiki pengalaman dahulu atau melanjutkan penjualan.

### PR-08 — Pesanan dan aktivasi berlangganan

**File utama:** `lib/subscription.ts`, `app/actions/admin.ts`, `components/admin/edit-user-modal.tsx`, `app/(dashboard)/settings/settings-client.tsx`, `app/page.tsx`, `types/database.ts`, tes database.

**Tambahan:** server action pesanan, tampilan pesanan admin, serta bagian paket/riwayat pembelian pengguna.

- [ ] Catat pesanan Shopee yang telah diverifikasi operator: provider, ID order eksternal unik, parent, paket, snapshot harga/kuota/durasi, status, operator verifikasi, dan waktu aktivasi. Hindari menyimpan data pembayaran yang tidak diperlukan.
- [ ] Gunakan status `pending_verification`, `verified`, `activated`, dan `rejected`. Konfirmasi pembayaran berasal dari verifikasi operator, bukan klaim klien atau klik tautan toko.
- [ ] Buat RPC aktivasi service-only: periksa admin pada server, kunci parent dan order dengan urutan konsisten, cek status, ubah paket/masa aktif/kuota, rekam referensi order pada ledger, lalu tandai aktivasi dalam satu transaksi.
- [ ] Terapkan keunikan aktivasi per order. Retry/koneksi hilang mengembalikan hasil lama; bukan mengisi kuota lagi. Tolak pengisian ulang ketika masih ada reservasi aktif sesuai mekanisme yang ada.
- [ ] Kebijakan awal yang sederhana: periode 30 hari, kuota direset sesuai paket saat aktivasi, saldo sebelumnya tidak ditumpuk. Perpanjangan dini dicatat sebagai order terverifikasi dan baru diaktifkan ketika periode berjalan berakhir; perubahan paket tengah periode belum ditawarkan. Kebijakan harus terlihat sebelum pembelian dan dikonfirmasi pemilik produk.
- [ ] Tampilkan paket aktif, sisa soal, masa berlaku, status pesanan, dan riwayat aktivasi. Penyesuaian admin di luar pesanan wajib mempunyai alasan dan jejak operator.
- [ ] Perbarui syarat, landing page, dan prosedur dukungan agar sesuai perilaku final. Payment gateway/webhook baru dipertimbangkan setelah volume manual menjadi masalah yang terukur.

**Penerimaan:** order yang sama diaktifkan bersamaan dari dua koneksi hanya memberikan satu paket/kuota; pengguna biasa tidak dapat mengaktifkan pesanan; perubahan gagal rollback seluruhnya; generasi yang sedang berjalan tidak kehilangan reservasi; pesanan tertunda/perpanjangan tidak mengubah paket lebih dini.

## 5. Perubahan database yang direncanakan

Migrasi 001–005 tetap menjadi riwayat. Perubahan baru dibuat sebagai migrasi maju dengan nomor berikutnya saat PR digabung; nomor file tidak dipatok sebelum urutan merge diketahui.

| Perubahan                  | Lingkup                                                              | Pembatasan penting                                                 |
| -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Agregasi dashboard/laporan | RPC baca dan index yang dibutuhkan                                   | RLS/kepemilikan; hasil setara aturan penilaian yang ada            |
| Feedback                   | `product_feedback`                                                   | Parent/worksheet milik pengirim; admin menindaklanjuti             |
| Observasi pilot            | `product_events` dan index waktu/parent                              | Jenis/properti dibatasi; retensi 90 hari; deduplikasi              |
| Pesanan                    | `orders`, `subscription_activations`, RPC aktivasi, referensi ledger | External order unik; aktivasi atomik; perubahan paket service-only |
| Onboarding                 | Nullable nomor telepon, hanya jika skema nyata memerlukannya         | Kompatibel dengan akun dan nilai yang sudah ada                    |

Setiap migrasi menyertakan hak tabel/fungsi dan RLS, pembaruan tipe database, data fixture, serta pengujian akses akun biasa dan admin. Penjadwalan rekonsiliasi disiapkan setelah mengecek kemampuan scheduler proyek. Tidak ada migrasi penghapusan data historis dalam tahap ini.

## 6. Strategi verifikasi

- **Setiap PR kode:** lint, typecheck, tes yang relevan, lalu seluruh tes dan build CI. Tes perilaku berfokus pada batas sesi, kuota, data, dan transaksi; perubahan copy tidak memerlukan tes yang hanya meniru teks.
- **Tes database lokal:** pertahankan seluruh kontrak 16 tipe, idempotensi, migrasi, dan penilaian lama. Tambahkan kasus agregasi, otorisasi status, event, dan aktivasi sesuai PR.
- **Integrasi staging:** dua akun orang tua dan admin, token pengguna sesungguhnya, dua koneksi independen, gangguan jaringan, storage privat, serta retry setelah commit. PGlite yang mengantre operasi tidak menggantikan tes ini.
- **Browser:** mobile/desktop, reload saat generasi/latihan, logout/ganti akun, error submit, manipulasi input, dan cetak A4. Skenario regresi lintas halaman diotomatisasi dengan runner browser pada tahap implementasi.
- **AI nyata:** script staging dengan budget eksplisit dan input anonim; berjalan terpisah dari tes CI. Simpan pengukuran mentah dan laporan secara aman tanpa kunci provider.
- **Performa:** bandingkan commit sebelum/sesudah pada dataset dan kondisi yang sama; laporkan p50/p95, cold/warm, jumlah query, dan ukuran payload.

## 7. Aktivasi dan penghentian fitur

1. Verifikasi backup, lingkungan staging, dan migrasi; deploy kode yang kompatibel dengan AI tetap mati.
2. Jalankan pemeriksaan integrasi, browser, biaya/mutu, dan build pada versi yang akan dirilis.
3. Isi mode pilot dan daftar parent secara eksplisit; pastikan akun pembanding di luar daftar ditolak.
4. Aktifkan generasi hanya setelah bukti penerimaan lengkap. Pantau error, token, kuota, dan feedback selama pilot.
5. Bila terjadi masalah, hentikan generasi melalui kill switch atau tutup tipe terkait; pembacaan hasil dan latihan tersimpan tetap berfungsi.
6. Rollback aplikasi hanya ke versi yang kompatibel dengan migrasi dan izin terbaru. Jangan kembali ke versi sebelum 005 yang mengandalkan hak tulis browser. Utamakan perbaikan maju; pemulihan database memerlukan evaluasi dampak pada data baru.

## 8. Checklist sebelum pilot

- [ ] OPS-00 diverifikasi; status kredensial dan migrasi aktual tercatat.
- [ ] Build rilis dan pemeriksaan CI lulus; audit dependensi terbaru mempunyai hasil dan tindak lanjut.
- [ ] Sesi/redirect teruji; otorisasi antar akun serta storage privat diterima di staging.
- [ ] Model proyek tujuan tersedia; laporan mutu/biaya nyata lulus pada cakupan yang dibuka.
- [ ] Debit, refund, finalisasi, dan rekonsiliasi lulus tes dua koneksi; audit kuota 0.
- [ ] Reload/koneksi putus mengambil hasil lama tanpa model/debit baru.
- [ ] Alur mobile/desktop dan cetak selesai; jawaban bertahan saat submit gagal.
- [ ] Pembatasan pilot diperiksa di UI dan API; daftar kosong tidak membuka akses publik.
- [ ] Feedback dan metrik tersedia sebelum peserta mulai.
- [ ] Identitas, kontak, paket, dan janji layanan sesuai keadaan aktual.
- [ ] Operator mengetahui cara menghentikan generasi serta menangani laporan salah soal.

## 9. Backlog setelah pilot

| Prioritas | Pekerjaan                                                                           | Pemicu pengerjaan                                               |
| --------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| P1        | Koleksi soal terkurasi dengan versi, provenance review, dan aturan kuota tersendiri | Pengguna membutuhkan latihan instan atau mutu AI tidak stabil   |
| P1        | Sesi berikutnya berdasarkan hasil belajar; gunakan aturan lokal yang ada            | Peserta bingung memilih latihan setelah menyelesaikan sesi      |
| P1        | Pencarian dan pagination riwayat per anak                                           | Batas 100 data menghambat pemakaian nyata                       |
| P2        | Sinkronisasi progres lintas perangkat dengan konflik versi yang jelas               | Peserta sering berpindah perangkat dan kehilangan progres       |
| P2        | Pembukaan `count_image` / `choose_image`, kemudian tipe lain satu per satu          | Mutu, interaksi, cetak, dan biaya tipe terkait lulus penerimaan |
| P2        | Worker/queue persisten dan status job                                               | Timeout/lifecycle request menyebabkan kegagalan nyata berulang  |
| P2        | Pembayaran otomatis dan perpanjangan terjadwal                                      | Aktivasi manual menghambat penjualan atau menambah kesalahan    |
| P3        | Cakupan jenjang lebih luas dan alur guru/kelas                                      | Ada permintaan serta kapasitas review materi/dukungan           |

## 10. Referensi implementasi

- [Panduan operasi Teatch](rollout.md) dan [katalog tujuan belajar](learning-catalog.md).
- Dokumentasi Next.js versi terpasang: `node_modules/next/dist/docs/01-app/02-guides/data-security.md`, `01-app/01-getting-started/16-proxy.md`, dan `01-app/03-api-reference/06-cli/next.md`. Baca panduan relevan sebelum setiap perubahan API/framework.
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs) dan [panduan lanjut sesi/cache](https://supabase.com/docs/guides/auth/server-side/advanced-guide).
- [Ketersediaan model Gemini](https://ai.google.dev/gemini-api/docs/deprecations) dan [structured output](https://ai.google.dev/gemini-api/docs/structured-output). Ketersediaan, kompatibilitas, serta tarif diverifikasi kembali ketika PR-02 dijalankan.
