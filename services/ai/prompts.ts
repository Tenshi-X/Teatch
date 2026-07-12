import type {
  AIGenerateParams,
  QuestionType,
  EducationLevel,
  Difficulty,
} from '@/types';
import { LEARNING_SEGMENTS } from '@/lib/config/segments';

export function buildSystemPrompt(): string {
  return `Kamu adalah asisten AI pendidikan Indonesia yang ahli dalam membuat soal latihan untuk anak.
ATURAN PENTING:
1. Selalu gunakan Bahasa Indonesia yang baik dan benar (kecuali materi Bahasa Inggris).
2. Sesuaikan tingkat kesulitan dengan jenjang usia anak.
3. Berikan pembahasan yang jelas.
4. SELALU kembalikan response dalam format JSON yang valid tanpa backtick (tanpa \`\`\`json).
5. Jangan ada teks di luar JSON.`;
}

export function buildGeneratePrompt(params: AIGenerateParams): string {
  const {
    segmentId,
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

  const segment = LEARNING_SEGMENTS.find(s => s.id === segmentId);
  const segmentInstruction = segment ? `INSTRUKSI SEGMEN KHUSUS (${segment.name}):\n${segment.aiPromptInstruction}` : '';

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

${segmentInstruction}

PANDUAN KESULITAN:
${difficultyGuide}

FORMAT TIPE SOAL (${questionType}):
${typeInstructions}

Kembalikan HANYA JSON valid dengan format persis seperti di bawah ini (GANTI isinya dengan soal buatanmu):
{
  "title": "Judul Latihan yang menarik",
  "questions": [
    ${getQuestionSchema(questionType)}
  ]
}`;
}

function getTypeInstructions(type: QuestionType): string {
  switch (type) {
    case 'multiple_choice':
      return '- Berikan 4 pilihan (options)\n- Pastikan hanya 1 jawaban benar\n- answer harus sama persis dengan salah satu options';
    case 'short_answer':
      return '- Pertanyaan yang jawabannya sangat singkat (1-3 kata)';
    case 'essay':
      return '- Pertanyaan uraian yang butuh penjelasan';
    case 'matching':
      return '- Berikan minimal 4 pasangan (pairs)\n- Acak urutan logika (kiri dan kanan harus mix & match)';
    case 'guess_image':
      return '- Pertanyaan menebak sebuah benda visual\n- WAJIB beri 1-2 kata kunci Bahasa Inggris (search_keyword) untuk mencari gambar benda aslinya di internet';
    case 'image_matching':
      return '- Seperti mencocokkan biasa, tapi tambahkan 1 search_keyword benda visual (bahasa Inggris) sebagai ilustrasi umum soal';
    
    // NEW TYPES
    case 'true_false':
      return '- Berikan pernyataan faktual\n- Jawaban mutlak "Benar" atau "Salah"';
    case 'word_jumble':
      return '- Berikan sebuah kalimat yang dipotong-potong per kata ke dalam "options"\n- "options" harus dalam keadaan ACAK/JUMBLED\n- "answer" adalah susunan kalimat utuh yang benar';
    case 'sentence_jumble':
      return '- Berikan beberapa kalimat ke dalam "options" yang jika disusun berurutan akan menjadi sebuah cerita/paragraf\n- "options" harus ACAK\n- "answer" adalah paragraf gabungan yang benar';
    case 'ordering':
      return '- Berikan daftar urutan (bilangan, langkah, proses)\n- "options" adalah daftarnya dalam keadaan ACAK\n- "correct_order" adalah array dari item tersebut yang sudah terurut dengan benar dari awal-akhir/kecil-besar\n- "answer" adalah string penjelasnya';
    case 'pattern_completion':
      return '- Berikan deret pola (huruf, angka, logika) dengan bagian rumpang (misal ...)\n- "answer" adalah bagian pengisi rumpang tersebut';
    case 'count_image':
      return '- Minta anak menghitung jumlah suatu objek. "search_keyword" adalah objeknya (B. Inggris plurals misal "3 apples" atau sekadar "apples" atau "birds"). "answer" adalah angkanya';
    case 'choose_image':
      return '- Berikan pertanyaan memilih gambar. "image_options" berisi 3-4 kata kunci benda dalam B.Inggris. "answer" adalah kata kunci benda yang benar.';
    case 'image_label':
      return '- "search_keyword" adalah objek visual (B.Inggris). Pertanyaannya menunjuk/menanyakan bagian dari objek itu (misal: "Apa benda yang dikendarai orang ini?")';
    case 'grouping':
      return '- Berikan 2 atau lebih kategori di "categories"\n- Berikan 4-6 item, dan petakan masing-masing item ke kategorinya di dalam "items"\n- Pastikan nama kategori di items persis sama dengan yang ada di "categories"';
    case 'story_qa':
      return '- "story" berisi teks/cerita pendek 2-3 paragraf\n- "question" berisi pertanyaan spesifik yang jawabannya ada di cerita tersebut';

    default:
      return '- Buat soal sesuai format standar';
  }
}

function getDifficultyGuide(difficulty: Difficulty, level: EducationLevel): string {
  if (level === 'PAUD' || level === 'TK A' || level === 'TK B') {
    return '- Gunakan bahasa sangat sederhana, konkret, dan ceria\n- Hindari konsep abstrak.';
  }
  return difficulty === 'mudah' ? '- Soal dasar, mudah dicerna' : difficulty === 'sedang' ? '- Butuh sedikit pemikiran' : '- Soal menantang / HOTS';
}

function getQuestionSchema(type: QuestionType): string {
  const baseSchema = `
      "type": "${type}",
      "question": "Teks pertanyaan",
      "explanation": "Pembahasan"`;

  switch (type) {
    case 'multiple_choice':
      return `{${baseSchema},
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }`;
    case 'short_answer':
    case 'essay':
    case 'pattern_completion':
      return `{${baseSchema},
      "answer": "Jawaban"
    }`;
    case 'matching':
    case 'image_matching':
      return `{${baseSchema},
      ${type === 'image_matching' ? '"search_keyword": "english word",\n' : ''}      "pairs": [{"left": "A", "right": "B"}],
      "answer": "A-B"
    }`;
    case 'guess_image':
    case 'image_label':
    case 'count_image':
      return `{${baseSchema},
      "search_keyword": "english word",
      "answer": "Jawaban singkat"
    }`;
    case 'true_false':
      return `{${baseSchema},
      "answer": "Benar"
    }`;
    case 'word_jumble':
    case 'sentence_jumble':
      return `{${baseSchema},
      "options": ["acak 2", "acak 1", "acak 3"],
      "answer": "acak 1 acak 2 acak 3"
    }`;
    case 'ordering':
      return `{${baseSchema},
      "options": ["B", "C", "A"],
      "correct_order": ["A", "B", "C"],
      "answer": "A, B, C"
    }`;
    case 'choose_image':
      return `{${baseSchema},
      "image_options": ["apple", "banana", "orange"],
      "answer": "banana"
    }`;
    case 'grouping':
      return `{${baseSchema},
      "categories": ["Karnivora", "Herbivora"],
      "items": [{"name": "Sapi", "category": "Herbivora"}, {"name": "Harimau", "category": "Karnivora"}],
      "answer": "Sapi(Herbivora), Harimau(Karnivora)"
    }`;
    case 'story_qa':
      return `{${baseSchema},
      "story": "Teks cerita...",
      "answer": "Jawaban pertanyaan"
    }`;
    default:
      return `{${baseSchema},
      "answer": "Jawaban"
    }`;
  }
}
