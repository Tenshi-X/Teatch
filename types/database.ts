export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
export type EducationLevel = 'PAUD' | 'TK A' | 'TK B' | 'SD' | 'SMP' | 'SMA';
export type QuestionType =
  | 'multiple_choice'
  | 'essay'
  | 'short_answer'
  | 'matching'
  | 'guess_image'
  | 'image_matching'
  | 'true_false'
  | 'word_jumble'
  | 'sentence_jumble'
  | 'ordering'
  | 'pattern_completion'
  | 'count_image'
  | 'choose_image'
  | 'image_label'
  | 'grouping'
  | 'story_qa'
  | 'drag_and_drop'
  | 'coloring';
type Relation<
  Name extends string,
  Column extends string,
  Target extends string,
> = {
  foreignKeyName: Name;
  columns: [Column];
  isOneToOne: false;
  referencedRelation: Target;
  referencedColumns: ['id'];
};
type Table<
  Row,
  Required extends keyof Row,
  Relationships extends {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[] = [],
> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: Relationships;
};
type ProfileRow = {
  id: string;
  auth_user_id: string;
  full_name: string;
  email: string | null;
  role: 'admin' | 'user';
  avatar_url: string | null;
  phone_number: string | null;
  is_onboarded: boolean;
  subscription_tier: string;
  subscription_status: string;
  subscription_period_start: string | null;
  subscription_period_end: string | null;
  worksheet_quota: number;
  created_at: string;
  updated_at: string;
};
type ChildRow = {
  id: string;
  parent_id: string;
  name: string;
  birth_date: string;
  level: EducationLevel;
  grade: string | null;
  interests: string[];
  favorite_subjects: string[];
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};
type SubjectRow = {
  id: string;
  name: string;
  level: EducationLevel;
  icon: string | null;
  color: string | null;
  created_at: string;
};
type WorksheetRow = {
  id: string;
  child_id: string;
  subject_id: string;
  title: string;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  question_type: QuestionType;
  question_count: number;
  topic: string | null;
  objective_id: string | null;
  ai_prompt: string | null;
  ai_response: Json | null;
  status: 'generating' | 'draft' | 'generated' | 'error';
  schema_version: number;
  created_at: string;
};
type QuestionRow = {
  id: string;
  worksheet_id: string;
  type: QuestionType;
  question: string;
  options: Json;
  answer: string | null;
  explanation: string | null;
  image_url: string | null;
  content: Json;
  schema_version: number;
  order_index: number;
  created_at: string;
};
type AttemptRow = {
  id: string;
  worksheet_id: string;
  child_id: string;
  score: number | null;
  total_questions: number;
  correct_answers: number;
  duration: number | null;
  status: 'in_progress' | 'pending_review' | 'completed';
  scoring_version: number;
  submission_key: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
};
type AnswerRow = {
  id: string;
  attempt_id: string;
  question_id: string;
  user_answer: string | null;
  is_correct: boolean | null;
  review_status: 'graded' | 'pending';
  created_at: string;
};
export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, 'auth_user_id' | 'full_name'>;
      children: Table<
        ChildRow,
        'parent_id' | 'name' | 'birth_date' | 'level',
        [Relation<'children_parent_id_fkey', 'parent_id', 'profiles'>]
      >;
      subjects: Table<SubjectRow, 'name' | 'level'>;
      worksheets: Table<
        WorksheetRow,
        'child_id' | 'subject_id' | 'title' | 'difficulty' | 'question_type',
        [
          Relation<'worksheets_child_id_fkey', 'child_id', 'children'>,
          Relation<'worksheets_subject_id_fkey', 'subject_id', 'subjects'>,
        ]
      >;
      questions: Table<
        QuestionRow,
        'worksheet_id' | 'type' | 'question',
        [Relation<'questions_worksheet_id_fkey', 'worksheet_id', 'worksheets'>]
      >;
      attempts: Table<
        AttemptRow,
        'worksheet_id' | 'child_id',
        [
          Relation<'attempts_worksheet_id_fkey', 'worksheet_id', 'worksheets'>,
          Relation<'attempts_child_id_fkey', 'child_id', 'children'>,
        ]
      >;
      answers: Table<
        AnswerRow,
        'attempt_id' | 'question_id',
        [
          Relation<'answers_attempt_id_fkey', 'attempt_id', 'attempts'>,
          Relation<'answers_question_id_fkey', 'question_id', 'questions'>,
        ]
      >;
      generation_requests: Table<
        {
          id: string;
          parent_id: string;
          request_key: string;
          request_hash: string;
          question_count: number;
          status: 'reserved' | 'succeeded' | 'failed';
          worksheet_id: string | null;
          usage: Json;
          error_code: string | null;
          created_at: string;
        },
        'parent_id' | 'request_key' | 'request_hash' | 'question_count'
      >;
      question_reports: Table<
        {
          id: string;
          parent_id: string;
          question_id: string;
          reason: string;
          status: 'open' | 'resolved';
          created_at: string;
        },
        'parent_id' | 'question_id' | 'reason',
        [
          Relation<
            'question_reports_question_id_fkey',
            'question_id',
            'questions'
          >,
        ]
      >;
      product_feedback: Table<
        {
          id: string;
          parent_id: string;
          worksheet_id: string | null;
          category: 'helpful' | 'problem' | 'idea';
          comment: string;
          status: 'open' | 'resolved';
          created_at: string;
        },
        'parent_id' | 'category'
      >;
      product_events: Table<
        {
          id: string;
          parent_id: string;
          event_key: string;
          kind: 'visit' | 'attempt_started' | 'plan_clicked';
          worksheet_id: string | null;
          created_at: string;
        },
        'parent_id' | 'event_key' | 'kind'
      >;
    };
    Views: Record<string, never>;
    Functions: {
      learning_summary: { Args: { p_since?: string }; Returns: Json };
      dashboard_overview: { Args: Record<string, never>; Returns: Json };
      maintain_runtime: { Args: Record<string, never>; Returns: Json };
      admin_runtime_summary: {
        Args: { p_offset?: number; p_search?: string };
        Returns: Json;
      };
      submit_product_feedback: {
        Args: {
          p_parent: string;
          p_worksheet: string | null;
          p_category: string;
          p_comment: string;
        };
        Returns: string;
      };
      record_product_event: {
        Args: {
          p_parent: string;
          p_key: string;
          p_kind: string;
          p_worksheet: string | null;
        };
        Returns: undefined;
      };
      reconcile_generation_reservations: {
        Args: Record<string, never>;
        Returns: number;
      };
      quota_audit: { Args: Record<string, never>; Returns: Json };
      admin_update_profile: {
        Args: { p_profile: string; p_changes: Json; p_quota: number | null };
        Returns: undefined;
      };
      reserve_generation: {
        Args: {
          p_parent: string;
          p_key: string;
          p_hash: string;
          p_count: number;
        };
        Returns: Json;
      };
      fail_generation: {
        Args: { p_request: string; p_code: string; p_usage?: Json };
        Returns: Json;
      };
      finalize_generation: {
        Args: {
          p_request: string;
          p_child: string;
          p_subject: string;
          p_params: Json;
          p_result: Json;
          p_usage: Json;
        };
        Returns: string;
      };
      update_worksheet_content: {
        Args: { p_parent: string; p_worksheet: string; p_result: Json };
        Returns: undefined;
      };
      save_scored_attempt: {
        Args: {
          p_parent: string;
          p_worksheet: string;
          p_key: string;
          p_duration: number;
          p_answers: Json;
        };
        Returns: Json;
      };
      review_attempt_answer: {
        Args: { p_parent: string; p_answer: string; p_correct: boolean };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
