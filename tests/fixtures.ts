import {
  finalizeVisual,
  type GeneratedQuestion,
} from '@/lib/learning/contracts';
const base = {
  question: 'Contoh pertanyaan untuk latihan.',
  answer: 'Contoh',
  explanation: 'Penjelasan pendek yang membantu memahami konsep.',
};
export const fixtures: GeneratedQuestion[] = (
  [
    {
      ...base,
      type: 'multiple_choice',
      question: 'Berapa 2 + 3?',
      answer: '5',
      options: ['4', '5', '6', '7'],
    },
    {
      ...base,
      type: 'essay',
      question: 'Jelaskan cara merawat tanaman.',
      answer: 'Memberi air dan cahaya.',
      rubric: ['Kebutuhan air yang cukup', 'Cahaya untuk tanaman'],
      explanation:
        'Nilai dua inti: kebutuhan air yang cukup dan cahaya. Terima ungkapan lain yang bermakna sama.',
    },
    { ...base, type: 'short_answer', question: 'Berapa 2 + 3?', answer: '5' },
    {
      ...base,
      type: 'matching',
      pairs: [
        { left: 'Satu', right: '1' },
        { left: 'Dua', right: '2' },
        { left: 'Tiga', right: '3' },
        { left: 'Empat', right: '4' },
      ],
    },
    { ...base, type: 'guess_image', asset_id: 'apple' },
    {
      ...base,
      type: 'image_matching',
      pairs: [
        { left: 'apple', right: 'apel' },
        { left: 'banana', right: 'pisang' },
        { left: 'cat', right: 'kucing' },
        { left: 'dog', right: 'anjing' },
      ],
    },
    {
      ...base,
      type: 'true_false',
      question: 'Dua ditambah tiga sama dengan lima.',
      answer: 'Benar',
    },
    {
      ...base,
      type: 'word_jumble',
      options: ['makan', 'Saya', 'apel'],
      answer: 'Saya makan apel',
    },
    {
      ...base,
      type: 'sentence_jumble',
      options: ['Ia mengambil buku.', 'Ani pergi ke perpustakaan.'],
      answer: 'Ani pergi ke perpustakaan. Ia mengambil buku.',
    },
    {
      ...base,
      type: 'ordering',
      options: ['3', '1', '2'],
      correct_order: ['1', '2', '3'],
      answer: '1, 2, 3',
    },
    {
      ...base,
      type: 'pattern_completion',
      question: '2, 4, 6, ...',
      answer: '8',
    },
    { ...base, type: 'count_image', asset_id: 'apple', count: 7, answer: '7' },
    {
      ...base,
      type: 'choose_image',
      image_options: ['apple', 'banana', 'cat'],
      answer: 'apple',
    },
    { ...base, type: 'image_label', label_target: 'leaf', answer: 'Daun' },
    {
      ...base,
      type: 'grouping',
      categories: ['Buah', 'Hewan'],
      items: [
        { name: 'Apel', category: 'Buah' },
        { name: 'Pisang', category: 'Buah' },
        { name: 'Kucing', category: 'Hewan' },
        { name: 'Anjing', category: 'Hewan' },
      ],
    },
    {
      ...base,
      type: 'story_qa',
      story:
        'Ani memiliki seekor kucing. Setiap pagi, Ani memberinya makanan dan air bersih. Ani menyayangi kucing itu.',
      question: 'Hewan apa yang dimiliki Ani?',
      answer: 'Kucing',
    },
  ] satisfies GeneratedQuestion[]
).map((q) => finalizeVisual(q));
export function correctInput(q: GeneratedQuestion): string {
  if (q.type === 'matching' || q.type === 'image_matching')
    return JSON.stringify(
      Object.fromEntries(q.pairs.map((p) => [p.left, p.right]))
    );
  if (q.type === 'grouping')
    return JSON.stringify(
      Object.fromEntries(q.items.map((i) => [i.name, i.category]))
    );
  if (q.type === 'ordering') return JSON.stringify(q.correct_order);
  if (q.type === 'word_jumble') return JSON.stringify(q.answer.split(' '));
  if (q.type === 'sentence_jumble')
    return JSON.stringify(['Ani pergi ke perpustakaan.', 'Ia mengambil buku.']);
  return q.answer;
}
