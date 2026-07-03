export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          full_name?: string;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          parent_id: string;
          name: string;
          birth_date: string;
          level: 'PAUD' | 'TK A' | 'TK B' | 'SD' | 'SMP' | 'SMA';
          grade: string | null;
          interests: string[];
          favorite_subjects: string[];
          photo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          name: string;
          birth_date: string;
          level: 'PAUD' | 'TK A' | 'TK B' | 'SD' | 'SMP' | 'SMA';
          grade?: string | null;
          interests?: string[];
          favorite_subjects?: string[];
          photo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          name?: string;
          birth_date?: string;
          level?: 'PAUD' | 'TK A' | 'TK B' | 'SD' | 'SMP' | 'SMA';
          grade?: string | null;
          interests?: string[];
          favorite_subjects?: string[];
          photo_url?: string | null;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          name: string;
          level: 'PAUD' | 'TK A' | 'TK B' | 'SD' | 'SMP' | 'SMA';
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level: 'PAUD' | 'TK A' | 'TK B' | 'SD' | 'SMP' | 'SMA';
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          level?: 'PAUD' | 'TK A' | 'TK B' | 'SD' | 'SMP' | 'SMA';
          icon?: string | null;
          color?: string | null;
        };
      };
      worksheets: {
        Row: {
          id: string;
          child_id: string;
          subject_id: string;
          title: string;
          difficulty: 'mudah' | 'sedang' | 'sulit';
          question_type: QuestionType;
          question_count: number;
          topic: string | null;
          ai_prompt: string | null;
          ai_response: Json | null;
          status: 'generating' | 'generated' | 'error';
          created_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          subject_id: string;
          title: string;
          difficulty: 'mudah' | 'sedang' | 'sulit';
          question_type: QuestionType;
          question_count?: number;
          topic?: string | null;
          ai_prompt?: string | null;
          ai_response?: Json | null;
          status?: 'generating' | 'generated' | 'error';
          created_at?: string;
        };
        Update: {
          id?: string;
          child_id?: string;
          subject_id?: string;
          title?: string;
          difficulty?: 'mudah' | 'sedang' | 'sulit';
          question_type?: QuestionType;
          question_count?: number;
          topic?: string | null;
          ai_prompt?: string | null;
          ai_response?: Json | null;
          status?: 'generating' | 'generated' | 'error';
        };
      };
      questions: {
        Row: {
          id: string;
          worksheet_id: string;
          type: QuestionType;
          question: string;
          options: Json;
          answer: string | null;
          explanation: string | null;
          image_url: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          worksheet_id: string;
          type: QuestionType;
          question: string;
          options?: Json;
          answer?: string | null;
          explanation?: string | null;
          image_url?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          worksheet_id?: string;
          type?: QuestionType;
          question?: string;
          options?: Json;
          answer?: string | null;
          explanation?: string | null;
          image_url?: string | null;
          order_index?: number;
        };
      };
      attempts: {
        Row: {
          id: string;
          worksheet_id: string;
          child_id: string;
          score: number | null;
          total_questions: number;
          correct_answers: number;
          duration: number | null;
          status: 'in_progress' | 'completed';
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          worksheet_id: string;
          child_id: string;
          score?: number | null;
          total_questions?: number;
          correct_answers?: number;
          duration?: number | null;
          status?: 'in_progress' | 'completed';
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          worksheet_id?: string;
          child_id?: string;
          score?: number | null;
          total_questions?: number;
          correct_answers?: number;
          duration?: number | null;
          status?: 'in_progress' | 'completed';
          completed_at?: string | null;
        };
      };
      answers: {
        Row: {
          id: string;
          attempt_id: string;
          question_id: string;
          user_answer: string | null;
          is_correct: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          attempt_id: string;
          question_id: string;
          user_answer?: string | null;
          is_correct?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          attempt_id?: string;
          question_id?: string;
          user_answer?: string | null;
          is_correct?: boolean | null;
        };
      };
    };
  };
};

export type QuestionType =
  | 'multiple_choice'
  | 'essay'
  | 'short_answer'
  | 'drag_and_drop'
  | 'guess_image'
  | 'coloring'
  | 'matching'
  | 'image_matching';
