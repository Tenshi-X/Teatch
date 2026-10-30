import type { Metadata } from 'next';
import { LegalLayout } from '@/components/legal-layout';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description:
    'Ketentuan penggunaan layanan Teatch: akun, langganan, dan aturan penggunaan platform.',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Syarat & Ketentuan" updated="30 Oktober 2026">
      <section>
        <h2>1. Penerimaan Ketentuan</h2>
        <p>
          Dengan mendaftar dan menggunakan Teatch, Anda menyetujui syarat &amp;
          ketentuan ini. Teatch adalah layanan pendampingan belajar berbasis AI
          untuk anak, dan akun didaftarkan oleh orang dewasa (orang tua/guru)
          atas tanggung jawabnya sendiri.
        </p>
      </section>

      <section>
        <h2>2. Akun &amp; Tanggung Jawab</h2>
        <ul>
          <li>
            Akun hanya boleh didaftarkan oleh orang dewasa berusia minimal 18
            tahun.
          </li>
          <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun.</li>
          <li>
            Satu akun digunakan untuk memantau profil anak sesuai kuota paket
            yang berlaku.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Paket Langganan &amp; Pembayaran</h2>
        <ul>
          <li>
            Paket <strong>Free Trial</strong> tersedia tanpa biaya dan tanpa
            kartu kredit.
          </li>
          <li>
            Paket <strong>Basic</strong> dan <strong>Pro</strong> dibayarkan per
            bulan melalui toko resmi kami di Shopee
            (shopee.co.id/trenovaintelligence).
          </li>
          <li>
            Harga dan kuota (jumlah soal, jumlah profil anak) sebagaimana
            tercantum pada halaman beranda saat pembelian dilakukan.
          </li>
          <li>
            Aktivasi paket dilakukan setelah konfirmasi pembayaran dari Shopee
            diterima oleh tim kami. Aktivasi dan pengisian kuota dilakukan
            manual. Hubungi dukungan dengan email akun yang digunakan.
            Perpanjangan otomatis belum tersedia.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Penggunaan yang Diperbolehkan</h2>
        <p>
          Anda setuju untuk tidak menjual kembali, mendistribusikan, atau
          mengambil isi soal secara massal untuk keperluan di luar penggunaan
          pribadi keluarga/kelas Anda. Layanan tidak boleh digunakan untuk
          membuat konten yang melanggar hukum.
        </p>
      </section>

      <section>
        <h2>5. Hasil AI</h2>
        <p>
          Soal latihan dihasilkan secara otomatis oleh AI. Kami berupaya menjaga
          kualitas dan kesesuaian kurikulum, namun Anda sebagai pendamping
          disarankan meninjau materi sebelum diberikan kepada anak.
        </p>
      </section>

      <section>
        <h2>6. Pengakhiran Layanan</h2>
        <p>
          Anda dapat menghentikan penggunaan kapan saja dengan meminta
          penghapusan akun. Kami berhak menangguhkan akun yang melanggar
          ketentuan ini.
        </p>
      </section>

      <section>
        <h2>7. Kontak</h2>
        <p>
          Pertanyaan mengenai ketentuan ini:{' '}
          <strong>trenova151@gmail.com</strong> atau WhatsApp{' '}
          <strong>+62 877 9507 8879</strong>.
        </p>
      </section>
    </LegalLayout>
  );
}
