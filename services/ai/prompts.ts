import type {
  AIGenerateParams,
  QuestionType,
  EducationLevel,
  Difficulty,
} from '@/types';

/**
 * Build the system instruction for the AI to generate educational content.
 */
export function buildSystemPrompt(): string {
  return `Kamu adalah asisten AI pendidikan Indonesia yang membantu orang tua membuat soal latihan untuk anaknya.

ATURAN PENTING:
1. Selalu gunakan Bahasa Indonesia yang baik dan benar.
2. Sesuaikan tingkat kesulitan dan bahasa dengan usia dan jenjang pendidikan anak.
3. Berikan pembahasan yang jelas dan mudah dipahami.
4. Untuk anak TK/PAUD, gunakan bahasa yang sangat sederhana dan menyenangkan.
5. Pastikan soal bersifat edukatif dan tidak mengandung unsur negatif.
6. SELALU kembalikan response dalam format JSON yang valid. JANGAN gunakan markdown.
7. Jangan tambahkan komentar, penjelasan, atau teks di luar JSON.`;
}

/**
 * Build the user prompt for generating a worksheet.
 */
export function buildGeneratePrompt(params: AIGenerateParams): string {
  const {
    childName,
    age,
    level,
    grade,
    subject,
    questionType,
    difficulty,
    questionCount,
    topic,
  } = params;

  const typeInstructions = getTypeInstructions(questionType);
  const difficultyGuide = getDifficultyGuide(difficulty, level);

  return `Buatkan ${questionCount} soal latihan dengan detail berikut:

PROFIL ANAK:
- Nama: ${childName}
- Usia: ${age} tahun
- Jenjang: ${level}
- Kelas: ${grade || '-'}

DETAIL SOAL:
- Mata Pelajaran: ${subject}
- Tipe Soal: ${questionType}
- Tingkat Kesulitan: ${difficulty}
${topic ? `- Topik Spesifik: ${topic}` : ''}

PANDUAN KESULITAN:
${difficultyGuide}

FORMAT TIPE SOAL:
${typeInstructions}

Kembalikan HANYA JSON valid dengan format berikut (tanpa markdown, tanpa backtick, tanpa penjelasan):
{
  "title": "Judul latihan yang menarik",
  "questions": [
    ${getQuestionSchema(questionType)}
  ]
}`;
}

function getTypeInstructions(type: QuestionType): string {
  switch (type) {
    case 'multiple_choice':
      return `- Berikan 4 pilihan jawaban (A, B, C, D)
- Pastikan hanya ada 1 jawaban benar
- Acak posisi jawaban benar (jangan selalu di A)
- Berikan pembahasan yang menjelaskan mengapa jawaban tersebut benar`;

    case 'short_answer':
      return `- Buat soal dengan jawaban singkat (1-3 kata)
- Jawaban harus jelas dan tidak ambigu
- Contoh: "2 + 3 = ___" jawaban: "5"
- Berikan pembahasan singkat`;

    case 'essay':
      return `- Buat soal uraian yang memerlukan penjelasan
- Berikan contoh jawaban ideal yang lengkap
- Berikan pembahasan dan poin-poin penting jawaban`;

    case 'matching':
      return `- Buat pasangan yang harus dihubungkan
- Minimal 4 pasangan
- Berikan dalam format pairs: [{left: "...", right: "..."}]
- Acak urutan sisi kanan`;

    case 'guess_image':
      return `- Buat deskripsi objek yang jelas
- Anak harus menebak apa objek tersebut
- Berikan petunjuk jika perlu
- Field "question" berisi pertanyaan
- WAJIB tambahkan field "search_keyword" berisi 1-2 kata kunci dalam Bahasa Inggris (English) yang merepresentasikan objek tersebut secara visual (contoh: "apple", "elephant", "car"). Kata kunci ini akan digunakan untuk mencari gambar di Google/API.`;

    case 'image_matching':
      return `- Buat soal mencocokkan teks dengan gambar/objek
- Berikan deskripsi instruksi yang jelas pada "question"
- Gunakan format pairs
- WAJIB tambahkan field "search_keyword" berisi kata kunci dalam Bahasa Inggris (English) untuk ilustrasi soal ini.`;

    default:
      return `- Buat soal sesuai tipe yang diminta
- Berikan jawaban dan pembahasan yang jelas`;
  }
}

function getDifficultyGuide(difficulty: Difficulty, level: EducationLevel): string {
  if (level === 'PAUD' || level === 'TK A' || level === 'TK B') {
    return `- Gunakan bahasa yang sangat sederhana dan ceria
- Tambahkan emoji untuk membuatnya menarik
- Soal harus visual dan konkret
- Hindari konsep abstrak`;
  }

  switch (difficulty) {
    case 'mudah':
      return `- Soal dasar sesuai kurikulum
- Konsep fundamental
- Tidak memerlukan pemikiran kompleks`;
    case 'sedang':
      return `- Soal menengah yang menguji pemahaman
- Memerlukan penerapan konsep
- Mungkin memerlukan 2-3 langkah penyelesaian`;
    case 'sulit':
      return `- Soal tingkat tinggi yang menantang
- Memerlukan analisis dan penerapan lanjutan
- Soal HOTS (Higher Order Thinking Skills)`;
  }
}

function getQuestionSchema(type: QuestionType): string {
  switch (type) {
    case 'multiple_choice':
      return `{
      "type": "multiple_choice",
      "question": "Teks pertanyaan",
      "options": ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"],
      "answer": "Pilihan yang benar (exact match dengan salah satu options)",
      "explanation": "Pembahasan lengkap"
    }`;

    case 'short_answer':
      return `{
      "type": "short_answer",
      "question": "Teks pertanyaan dengan ___ untuk bagian yang harus diisi",
      "answer": "Jawaban singkat",
      "explanation": "Pembahasan singkat"
    }`;

    case 'essay':
      return `{
      "type": "essay",
      "question": "Teks pertanyaan uraian",
      "answer": "Contoh jawaban ideal yang lengkap",
      "explanation": "Poin-poin penting dan pembahasan"
    }`;

    case 'matching':
      return `{
      "type": "matching",
      "question": "Instruksi: Hubungkan pasangan yang tepat",
      "pairs": [{"left": "Item kiri", "right": "Item kanan"}],
      "answer": "Penjelasan pasangan yang benar",
      "explanation": "Pembahasan"
    }`;

    case 'guess_image':
      return `{
      "type": "guess_image",
      "question": "Pertanyaan tentang objek...",
      "search_keyword": "elephant",
      "answer": "Jawaban yang benar",
      "explanation": "Pembahasan"
    }`;

    case 'image_matching':
      return `{
      "type": "image_matching",
      "question": "Instruksi: Hubungkan pasangan berikut",
      "search_keyword": "stars",
      "pairs": [{"left": "Item kiri", "right": "Item kanan"}],
      "answer": "Penjelasan",
      "explanation": "Pembahasan"
    }`;

    default:
      return `{
      "type": "${type}",
      "question": "Teks pertanyaan",
      "answer": "Jawaban",
      "explanation": "Pembahasan"
    }`;
  }
}
