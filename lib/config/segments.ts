export interface LearningSegment {
  id: string;
  name: string;
  icon: string;
  description: string;
  aiPromptInstruction: string;
}

export const LEARNING_SEGMENTS: LearningSegment[] = [
  {
    id: 'umum',
    name: 'Umum',
    icon: '📚',
    description: 'Pengetahuan umum, benda sekitar, hewan, buah, dsb.',
    aiPromptInstruction: 'Bebas tentukan materi umum (hewan, buah, profesi, warna, benda di sekitar). Soal tidak boleh terlalu spesifik atau mengacu pada bidang studi lanjutan.',
  },
  {
    id: 'matematika',
    name: 'Matematika',
    icon: '🧮',
    description: 'Berhitung, bangun ruang, pengukuran, logika angka.',
    aiPromptInstruction: 'Fokus HANYA pada soal MATEMATIKA (berhitung, bangun ruang, pengukuran). WAJIB MENGGUNAKAN FORMAT LaTeX untuk angka, pecahan, atau rumus matematika (menggunakan lambang $ di awal dan akhir teks matematika).',
  },
  {
    id: 'bahasa_indonesia',
    name: 'Bahasa Indonesia',
    icon: '✍️',
    description: 'Membaca, menulis, struktur kalimat, kosa kata.',
    aiPromptInstruction: 'Fokus HANYA pada soal Bahasa Indonesia (membaca, struktur kalimat, sinonim/antonim, kosa kata, ejaan yang disempurnakan).',
  },
  {
    id: 'bahasa_inggris',
    name: 'Bahasa Inggris',
    icon: '🇬🇧',
    description: 'Vocabulary, grammar dasar, percakapan sehari-hari.',
    aiPromptInstruction: 'Fokus HANYA pada soal Bahasa Inggris (Vocabulary, simple grammar, terjemahan dasar). Hasilkan soal yang sesuai dengan tingkat pendidikan Indonesia untuk pelajaran Bahasa Inggris.',
  },
  {
    id: 'ipa',
    name: 'IPA',
    icon: '🔬',
    description: 'Ilmu Pengetahuan Alam, biologi, fisika dasar.',
    aiPromptInstruction: 'Fokus HANYA pada Ilmu Pengetahuan Alam (IPA) (Hewan, Tumbuhan, Tubuh Manusia, Tata Surya, Cuaca, Lingkungan).',
  },
  {
    id: 'ips',
    name: 'IPS',
    icon: '🌍',
    description: 'Sejarah, peta, geografi, budaya, sosial masyarakat.',
    aiPromptInstruction: 'Fokus HANYA pada Ilmu Pengetahuan Sosial (IPS) (Peta, Geografi lokal/global, Budaya Indonesia, Sejarah, Pekerjaan, Kenampakan Alam).',
  },
  {
    id: 'logika',
    name: 'Logika',
    icon: '🧩',
    description: 'Teka-teki, pola, urutan, berpikir kritis.',
    aiPromptInstruction: 'Fokus HANYA pada Logika, berpikir kritis, pola urutan, teka-teki logika sederhana. Bukan sekadar soal berhitung.',
  },
];
