export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      candidate_groups: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_groups_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_assignments: {
        Row: {
          created_at: string
          end_time: string
          exam_id: string | null
          group_id: string | null
          id: string
          start_time: string
          status: Database["public"]["Enums"]["assignment_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_time: string
          exam_id?: string | null
          group_id?: string | null
          id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string
          exam_id?: string | null
          group_id?: string | null
          id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_assignments_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "candidate_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          assignment_id: string | null
          created_at: string
          current_question: number | null
          exam_id: string | null
          id: string
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          submitted_at: string | null
          time_remaining: number | null
          user_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          current_question?: number | null
          exam_id?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          submitted_at?: string | null
          time_remaining?: number | null
          user_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          current_question?: number | null
          exam_id?: string | null
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          submitted_at?: string | null
          time_remaining?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "exam_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_responses: {
        Row: {
          attempt_id: string | null
          created_at: string
          id: string
          is_flagged: boolean | null
          question_id: string | null
          score: number | null
          selected_option: string | null
          time_taken: number | null
          updated_at: string
        }
        Insert: {
          attempt_id?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          question_id?: string | null
          score?: number | null
          selected_option?: string | null
          time_taken?: number | null
          updated_at?: string
        }
        Update: {
          attempt_id?: string | null
          created_at?: string
          id?: string
          is_flagged?: boolean | null
          question_id?: string | null
          score?: number | null
          selected_option?: string | null
          time_taken?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_responses_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          attempt_id: string | null
          career_fitment: Json | null
          correct_count: number | null
          created_at: string
          exam_id: string | null
          id: string
          incorrect_count: number | null
          intelligences: Json | null
          max_score: number
          percentage: number
          section_scores: Json | null
          skipped_count: number | null
          time_taken: number | null
          total_score: number
          traits: Json | null
          user_id: string | null
        }
        Insert: {
          attempt_id?: string | null
          career_fitment?: Json | null
          correct_count?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          incorrect_count?: number | null
          intelligences?: Json | null
          max_score?: number
          percentage?: number
          section_scores?: Json | null
          skipped_count?: number | null
          time_taken?: number | null
          total_score?: number
          traits?: Json | null
          user_id?: string | null
        }
        Update: {
          attempt_id?: string | null
          career_fitment?: Json | null
          correct_count?: number | null
          created_at?: string
          exam_id?: string | null
          id?: string
          incorrect_count?: number | null
          intelligences?: Json | null
          max_score?: number
          percentage?: number
          section_scores?: Json | null
          skipped_count?: number | null
          time_taken?: number | null
          total_score?: number
          traits?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          allow_skip: boolean
          auto_submit: boolean
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          duration: number
          id: string
          marks_per_question: number | null
          negative_marking: boolean
          negative_marks: number | null
          shuffle_questions: boolean
          status: Database["public"]["Enums"]["exam_status"]
          theme_color: string | null
          title: string
          total_questions: number
          type: Database["public"]["Enums"]["exam_type"]
          updated_at: string
        }
        Insert: {
          allow_skip?: boolean
          auto_submit?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number
          id?: string
          marks_per_question?: number | null
          negative_marking?: boolean
          negative_marks?: number | null
          shuffle_questions?: boolean
          status?: Database["public"]["Enums"]["exam_status"]
          theme_color?: string | null
          title: string
          total_questions?: number
          type: Database["public"]["Enums"]["exam_type"]
          updated_at?: string
        }
        Update: {
          allow_skip?: boolean
          auto_submit?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number
          id?: string
          marks_per_question?: number | null
          negative_marking?: boolean
          negative_marks?: number | null
          shuffle_questions?: boolean
          status?: Database["public"]["Enums"]["exam_status"]
          theme_color?: string | null
          title?: string
          total_questions?: number
          type?: Database["public"]["Enums"]["exam_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "candidate_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_id: string | null
          id: string
          image_url: string | null
          intelligence: string | null
          marks: number
          negative_marks: number | null
          options: Json
          order_index: number
          text: string
          trait: string | null
          type: Database["public"]["Enums"]["question_type"]
          weightage: number | null
        }
        Insert: {
          correct_answer?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          exam_id?: string | null
          id?: string
          image_url?: string | null
          intelligence?: string | null
          marks?: number
          negative_marks?: number | null
          options?: Json
          order_index?: number
          text: string
          trait?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          weightage?: number | null
        }
        Update: {
          correct_answer?: string | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          exam_id?: string | null
          id?: string
          image_url?: string | null
          intelligence?: string | null
          marks?: number
          negative_marks?: number | null
          options?: Json
          order_index?: number
          text?: string
          trait?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          weightage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      assignment_status: "pending" | "in_progress" | "completed" | "expired"
      attempt_status: "in_progress" | "submitted" | "evaluated"
      difficulty_level: "easy" | "medium" | "hard"
      exam_status: "draft" | "published" | "active" | "completed"
      exam_type: "behavioral" | "aptitude" | "knowledge" | "intelligence"
      question_type:
        | "mcq"
        | "mcq_image"
        | "likert"
        | "true_false"
        | "scenario"
        | "image_identification"
      user_role: "admin" | "candidate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assignment_status: ["pending", "in_progress", "completed", "expired"],
      attempt_status: ["in_progress", "submitted", "evaluated"],
      difficulty_level: ["easy", "medium", "hard"],
      exam_status: ["draft", "published", "active", "completed"],
      exam_type: ["behavioral", "aptitude", "knowledge", "intelligence"],
      question_type: [
        "mcq",
        "mcq_image",
        "likert",
        "true_false",
        "scenario",
        "image_identification",
      ],
      user_role: ["admin", "candidate"],
    },
  },
} as const
