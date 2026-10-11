import type { EducationLevel } from '@/types';
import type { LearningSegment } from '@/lib/config/segments';
import { LEARNING_SEGMENTS } from '@/lib/config/segments';

export interface LearningObjective {
  id: string;
  label: string;
  phase: string;
  curriculumVerified: boolean;
  source: string;
}
const source = 'https://kurikulum.kemendikdasmen.go.id/';
const cpSource =
  'https://bpmpbabel.kemendikdasmen.go.id/PPID/wp-content/uploads/2025/07/KepKaBSKAP-046_2025-ttg-CP.pdf';
// Curated scopes paraphrased from CP 046/H/KR/2025, PDF pp. 94–95 and 111–115.
// These are partial mappings, not a guarantee that every generated question meets the curriculum.
const MAPPED: Record<string, Record<string, string[]>> = {
  Matematika: {
    A: [
      'Penjumlahan dan pengurangan sampai 20',
      'Bilangan cacah sampai 100',
      'Membandingkan panjang dan berat',
    ],
    B: [
      'Perkalian dan pembagian sampai 100',
      'Pecahan senilai dan perbandingan pecahan',
      'Pengukuran luas dan volume dengan satuan',
    ],
    C: [
      'Operasi bilangan cacah sampai 100.000',
      'Operasi pecahan dan bilangan asli',
      'Keliling dan luas bangun datar',
    ],
  },
  'Bahasa Indonesia': {
    A: [
      'Membaca kata sederhana',
      'Memahami bacaan tentang keluarga dan lingkungan',
      'Menulis kalimat sederhana',
    ],
    B: [
      'Menemukan ide pokok dan ide pendukung',
      'Memahami pesan dan informasi bacaan',
      'Menulis teks sederhana dengan kosakata baru',
    ],
  },
};
// Other subjects retain local guides without a verified CP claim.
const TOPICS: Record<string, string[]> = {
  'Mengenal Huruf': ['Bunyi huruf', 'Huruf awal benda', 'Suku kata sederhana'],
  'Mengenal Angka': [
    'Menghitung benda 1–10',
    'Membandingkan jumlah',
    'Urutan bilangan',
  ],
  Mewarnai: ['Mengenal warna', 'Mengenal bentuk', 'Pola warna'],
  'Mengenal Bentuk': [
    'Lingkaran dan persegi',
    'Segitiga',
    'Mencocokkan bentuk',
  ],
  'Mengenal Hewan': ['Nama hewan', 'Ciri hewan', 'Tempat hidup hewan'],
  'Mengenal Buah': ['Nama buah', 'Warna buah', 'Mengelompokkan buah'],
  Matematika: ['Bilangan dan operasi', 'Pengukuran', 'Geometri'],
  'Bahasa Indonesia': [
    'Memahami bacaan',
    'Kosakata dan kalimat',
    'Menulis gagasan',
  ],
  IPA: ['Makhluk hidup', 'Materi dan energi', 'Lingkungan'],
  IPS: ['Lingkungan masyarakat', 'Geografi', 'Sejarah dan budaya'],
  'Bahasa Inggris': ['Vocabulary', 'Reading comprehension', 'Grammar'],
  'Pendidikan Agama': ['Perilaku baik', 'Toleransi', 'Tanggung jawab'],
  'Seni Budaya': ['Unsur seni rupa', 'Musik', 'Budaya lokal'],
  PJOK: ['Gerak dasar', 'Kesehatan', 'Keselamatan olahraga'],
  Informatika: ['Berpikir komputasional', 'Data', 'Keamanan digital'],
  Biologi: ['Sel dan organisme', 'Ekosistem', 'Genetika'],
  Fisika: ['Gerak dan gaya', 'Energi', 'Gelombang'],
  Kimia: ['Struktur atom', 'Reaksi kimia', 'Larutan'],
  Sejarah: ['Kronologi sejarah', 'Sejarah Indonesia', 'Membaca sumber sejarah'],
  Ekonomi: ['Kebutuhan dan kelangkaan', 'Kegiatan ekonomi', 'Pasar'],
  Geografi: ['Peta dan wilayah', 'Lingkungan', 'Kependudukan'],
  Sosiologi: ['Interaksi sosial', 'Kelompok sosial', 'Perubahan sosial'],
};
export function phaseFor(level: EducationLevel, grade: string): string {
  const n = Number(grade.match(/\d+/)?.[0] || 0);
  if (['PAUD', 'TK A', 'TK B'].includes(level)) return 'Fondasi';
  if (level === 'SD') return n <= 2 ? 'A' : n <= 4 ? 'B' : 'C';
  return level === 'SMP' ? 'D' : n === 10 ? 'E' : 'F';
}
export function getObjectives(
  subject: string,
  level: EducationLevel,
  grade: string
): LearningObjective[] {
  const phase = phaseFor(level, grade);
  let topics = TOPICS[subject] ?? [
    'Konsep dasar',
    'Penerapan konsep',
    'Pemecahan masalah',
  ];
  const mapped = level === 'SD' && grade ? MAPPED[subject]?.[phase] : undefined;
  if (mapped) topics = mapped;
  return topics.map((label, i) => ({
    id: `${level}:${grade}:${subject}:${i}`,
    label,
    phase,
    curriculumVerified: !!mapped,
    source: mapped ? cpSource : source,
  }));
}
export function subjectSegment(name: string): LearningSegment {
  const s = name.toLowerCase();
  const id =
    s.includes('matematika') || s.includes('angka') || s.includes('bentuk')
      ? 'matematika'
      : s.includes('huruf') || s.includes('indonesia')
        ? 'bahasa_indonesia'
        : s.includes('inggris')
          ? 'bahasa_inggris'
          : ['ipa', 'sains', 'biologi', 'fisika', 'kimia', 'hewan'].some((t) =>
                s.includes(t)
              )
            ? 'ipa'
            : ['ips', 'sejarah', 'geografi', 'ekonomi', 'sosiologi'].some((t) =>
                  s.includes(t)
                )
              ? 'ips'
              : s.includes('logika')
                ? 'logika'
                : 'umum';
  return LEARNING_SEGMENTS.find((segment) => segment.id === id)!;
}
