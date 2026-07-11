import type { Database, QuestionType } from './database';

// ============================================================
// Table Row Types (shortcuts)
// ============================================================
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Child = Database['public']['Tables']['children']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Worksheet = Database['public']['Tables']['worksheets']['Row'];
export type Question = Database['public']['Tables']['questions']['Row'];
export type Attempt = Database['public']['Tables']['attempts']['Row'];
export type Answer = Database['public']['Tables']['answers']['Row'];

// ============================================================
// Insert Types
// ============================================================
export type ChildInsert = Database['public']['Tables']['children']['Insert'];
export type WorksheetInsert = Database['public']['Tables']['worksheets']['Insert'];
export type AttemptInsert = Database['public']['Tables']['attempts']['Insert'];
export type AnswerInsert = Database['public']['Tables']['answers']['Insert'];

// ============================================================
// Education Levels
// ============================================================
export const EDUCATION_LEVELS = ['PAUD', 'TK A', 'TK B', 'SD', 'SMP', 'SMA'] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const GRADES_BY_LEVEL: Record<EducationLevel, string[]> = {
  PAUD: ['Kelompok Bermain'],
  'TK A': ['TK A'],
  'TK B': ['TK B'],
  SD: ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'],
  SMP: ['Kelas 7', 'Kelas 8', 'Kelas 9'],
  SMA: ['Kelas 10', 'Kelas 11', 'Kelas 12'],
};

// ============================================================
// Question Types
// ============================================================
export const QUESTION_TYPES: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'multiple_choice', label: 'Pilihan Ganda', icon: '📋' },
  { value: 'essay', label: 'Uraian', icon: '✍️' },
  { value: 'short_answer', label: 'Isian Singkat', icon: '📝' },
  { value: 'matching', label: 'Menghubungkan', icon: '🔗' },
  { value: 'guess_image', label: 'Tebak Gambar', icon: '🖼️' },
  { value: 'image_matching', label: 'Cocokkan Gambar', icon: '🧩' },
];

// ============================================================
// Difficulty
// ============================================================
export const DIFFICULTIES = [
  { value: 'mudah', label: 'Mudah', color: '#22C55E' },
  { value: 'sedang', label: 'Sedang', color: '#F59E0B' },
  { value: 'sulit', label: 'Sulit', color: '#EF4444' },
] as const;

export type Difficulty = 'mudah' | 'sedang' | 'sulit';

// ============================================================
// AI Generation Types
// ============================================================
export interface AIGenerateParams {
  childName: string;
  age: number;
  level: EducationLevel;
  grade: string;
  subject: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  questionCount: number;
  topic?: string;
}

export interface AIGeneratedQuestion {
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  emoji?: string;
  pairs?: { left: string; right: string }[];
}

export interface AIGeneratedWorksheet {
  title: string;
  questions: AIGeneratedQuestion[];
}

// ============================================================
// Dashboard Stats
// ============================================================
export interface DashboardStats {
  totalWorksheets: number;
  totalAttempts: number;
  averageScore: number;
  totalQuestions: number;
}

export interface RecentActivity {
  id: string;
  type: 'worksheet_created' | 'attempt_completed';
  title: string;
  subject: string;
  score?: number;
  createdAt: string;
}

// Re-export
export type { Database, QuestionType } from './database';
