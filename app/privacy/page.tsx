import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Bagaimana Teatch mengumpulkan, menggunakan, dan melindungi data Anda serta data anak Anda.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Kebijakan Privasi" updated="1 Januari 2026">
      <section>
        <h2>1. Data yang Kami Kumpulkan</h2>
        <p>
          Untuk menjalankan layanan, kami hanya meminta data yang diperlukan untuk menyesuaikan
          materi belajar, yaitu: nama akun, alamat email, usia dan jenjang kelas anak, serta topik
          pembelajaran yang dipilih. Kami <strong>tidak meminta</strong> data sensitif seperti NIK,
          alamat lengkap, atau data keuangan — pembayaran langganan sepenuhnya diproses oleh
          platform pihak ketiga (Shopee).
        </p>
      </section>

      <section>
        <h2>2. Penggunaan Data</h2>
        <ul>
          <li>Membuat soal latihan yang sesuai usia, jenjang, dan topik anak.</li>
          <li>Menyimpan riwayat pengerjaan untuk fitur statistik perkembangan belajar.</li>
          <li>Meningkatkan kualitas layanan dan dukungan pelanggan.</li>
        </ul>
        <p>
          Data anak <strong>tidak digunakan untuk iklan</strong> dan tidak dibagikan kepada pihak
          lain untuk tujuan pemasaran.
        </p>
      </section>

      <section>
        <h2>3. Penyimpanan &amp; Keamanan</h2>
        <p>
          Data disimpan pada infrastruktur penyedia database pihak ketiga yang memiliki standar
          keamanan industri. Kami menerapkan pembatasan akses, dan komunikasi dengan server dienkripsi
          melalui HTTPS.
        </p>
      </section>

      <section>
        <h2>4. Hak Anda</h2>
        <ul>
          <li>Meminta salinan data yang kami simpan.</li>
          <li>Meminta penghapusan akun beserta seluruh data anak yang terkait.</li>
          <li>Mengoreksi data yang tidak akurat melalui halaman pengaturan akun.</li>
        </ul>
        <p>
          Untuk permintaan tersebut, hubungi kami melalui email{' '}
          <strong>trenova151@gmail.com</strong> atau WhatsApp <strong>+62 877 9507 8879</strong>.
        </p>
      </section>

      <section>
        <h2>5. Perubahan Kebijakan</h2>
        <p>
          Bila kebijakan ini diperbarui, tanggal pembaruan di bagian atas halaman akan diubah dan
          versi terbaru berlaku sejak dipublikasikan di halaman ini.
        </p>
      </section>
    </LegalLayout>
  );
}
