import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Bagaimana Teatch mengumpulkan, menggunakan, dan melindungi data Anda serta data anak Anda.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Kebijakan Privasi" updated="30 Oktober 2026">
      <section>
        <h2>1. Data yang Kami Kumpulkan</h2>
        <p>
          Untuk menjalankan layanan, kami hanya meminta data yang diperlukan
          untuk menyesuaikan materi belajar, yaitu: nama akun, alamat email,
          nomor telepon, nama dan tanggal lahir anak, jenjang kelas, minat, foto
          opsional, serta topik pembelajaran yang dipilih. Kami{' '}
          <strong>tidak meminta</strong> data sensitif seperti NIK, alamat
          lengkap, atau data keuangan — pembayaran langganan sepenuhnya diproses
          oleh platform pihak ketiga (Shopee).
        </p>
      </section>

      <section>
        <h2>2. Penggunaan Data</h2>
        <ul>
          <li>
            Membuat soal latihan yang sesuai usia, jenjang, dan topik anak.
          </li>
          <li>
            Menyimpan riwayat pengerjaan untuk fitur statistik perkembangan
            belajar.
          </li>
          <li>Meningkatkan kualitas layanan dan dukungan pelanggan.</li>
        </ul>
        <p>
          Data anak <strong>tidak digunakan untuk iklan</strong> dan tidak
          dibagikan kepada pihak lain untuk tujuan pemasaran.
        </p>
      </section>

      <section>
        <h2>3. Penyimpanan &amp; Keamanan</h2>
        <p>
          Data disimpan pada infrastruktur penyedia database pihak ketiga yang
          memiliki standar keamanan industri. Kami menerapkan pembatasan akses,
          dan komunikasi dengan server dienkripsi melalui HTTPS.
        </p>
      </section>

      <section>
        <h2>Penyedia Layanan AI</h2>
        <p>
          Untuk menyusun draf, konteks usia, kelas, mata pelajaran, tujuan,
          topik, dan satu minat diproses oleh Google Gemini. Nama, tanggal lahir
          lengkap, serta foto anak tidak dimasukkan ke prompt. Jangan memasukkan
          identitas pribadi ke topik atau minat. Data akun dan hasil latihan
          disimpan melalui Supabase. Foto memakai penyimpanan privat dan tautan
          akses sementara.
        </p>
        <p>
          Progres latihan disimpan di perangkat yang digunakan sampai hasil
          terkirim. Penggunaan perangkat bersama perlu didampingi orang tua.
        </p>
      </section>
      <section>
        <h2>4. Hak Anda</h2>
        <p>
          Masukan yang Anda kirim berisi kategori, komentar opsional, dan
          referensi latihan jika dipilih. Masukan dipakai untuk perbaikan
          layanan dan ditinjau pengelola. Hindari menuliskan informasi pribadi
          anak dalam komentar.
        </p>
        <p>
          Kami mencatat ID akun internal, waktu kunjungan, awal latihan, dan
          klik pilihan paket untuk memahami pemakaian. Catatan ini tidak memuat
          nama anak, tanggal lahir, isi jawaban, atau kontak. Event mentah
          dihapus setelah 90 hari melalui pemeliharaan terjadwal. Data hasil
          latihan tetap disimpan untuk laporan perkembangan sampai Anda meminta
          penghapusan.
        </p>
        <ul>
          <li>Meminta salinan data yang kami simpan.</li>
          <li>
            Meminta penghapusan akun beserta seluruh data anak yang terkait.
          </li>
          <li>
            Mengoreksi data yang tidak akurat melalui halaman pengaturan akun.
          </li>
        </ul>
        <p>
          Untuk permintaan tersebut, hubungi kami melalui email{' '}
          <strong>trenova151@gmail.com</strong> atau WhatsApp{' '}
          <strong>+62 877 9507 8879</strong>.
        </p>
      </section>

      <section>
        <h2>5. Perubahan Kebijakan</h2>
        <p>
          Bila kebijakan ini diperbarui, tanggal pembaruan di bagian atas
          halaman akan diubah dan versi terbaru berlaku sejak dipublikasikan di
          halaman ini.
        </p>
      </section>
    </LegalLayout>
  );
}
