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
      "CÁC NHÓM HOLLAND TEST": {
        Row: {
          "Đặc điểm ưu tiên": string
          "Năng lực thu được": string | null
          Nhóm: string
          "Thâm hụt/Không thiện cảm": string | null
        }
        Insert: {
          "Đặc điểm ưu tiên": string
          "Năng lực thu được"?: string | null
          Nhóm: string
          "Thâm hụt/Không thiện cảm"?: string | null
        }
        Update: {
          "Đặc điểm ưu tiên"?: string
          "Năng lực thu được"?: string | null
          Nhóm?: string
          "Thâm hụt/Không thiện cảm"?: string | null
        }
        Relationships: []
      }
      "CÁC TRƯỜNG ĐẠI HỌC": {
        Row: {
          "điểm chuẩn 2025": number | null
          "Ghi chú": string | null
          ID: number
          "Phương thức xét tuyển": string | null
          "Tên ngành": string | null
          "Tên trường": string
          "Tổ hợp": string | null
        }
        Insert: {
          "điểm chuẩn 2025"?: number | null
          "Ghi chú"?: string | null
          ID?: number
          "Phương thức xét tuyển"?: string | null
          "Tên ngành"?: string | null
          "Tên trường": string
          "Tổ hợp"?: string | null
        }
        Update: {
          "điểm chuẩn 2025"?: number | null
          "Ghi chú"?: string | null
          ID?: number
          "Phương thức xét tuyển"?: string | null
          "Tên ngành"?: string | null
          "Tên trường"?: string
          "Tổ hợp"?: string | null
        }
        Relationships: []
      }
      "CÂU HỎI BIG FIVE": {
        Row: {
          'Nội dung nhận xét: "Tôi thấy mình là người..."': string
          STT: number
        }
        Insert: {
          'Nội dung nhận xét: "Tôi thấy mình là người..."': string
          STT?: number
        }
        Update: {
          'Nội dung nhận xét: "Tôi thấy mình là người..."'?: string
          STT?: number
        }
        Relationships: []
      }
      "CÂU HỎI HOLLAND TEST": {
        Row: {
          "Nhóm A (Kỹ thuật)": string
          "Nhóm B (Nghiên cứu)": string | null
          "Nhóm C (Nghệ thuật)": string | null
          "Nhóm D (Xã hội)": string | null
          "Nhóm E (Quản lý)": string | null
          "Nhóm F (Nghiệp vụ)": string | null
          STT: number
        }
        Insert: {
          "Nhóm A (Kỹ thuật)": string
          "Nhóm B (Nghiên cứu)"?: string | null
          "Nhóm C (Nghệ thuật)"?: string | null
          "Nhóm D (Xã hội)"?: string | null
          "Nhóm E (Quản lý)"?: string | null
          "Nhóm F (Nghiệp vụ)"?: string | null
          STT?: number
        }
        Update: {
          "Nhóm A (Kỹ thuật)"?: string
          "Nhóm B (Nghiên cứu)"?: string | null
          "Nhóm C (Nghệ thuật)"?: string | null
          "Nhóm D (Xã hội)"?: string | null
          "Nhóm E (Quản lý)"?: string | null
          "Nhóm F (Nghiệp vụ)"?: string | null
          STT?: number
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          chat_type: string
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_type?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_type?: string
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      "HƯỚNG DẪN HOLLAND TEST": {
        Row: {
          "Chi tiết hướng dẫn": string
          "Danh mục": string
        }
        Insert: {
          "Chi tiết hướng dẫn": string
          "Danh mục": string
        }
        Update: {
          "Chi tiết hướng dẫn"?: string
          "Danh mục"?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          id: string
          phases: Json
          title: string
          updated_at: string
          user_id: string
          user_info: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          phases?: Json
          title: string
          updated_at?: string
          user_id: string
          user_info?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          phases?: Json
          title?: string
          updated_at?: string
          user_id?: string
          user_info?: Json | null
        }
        Relationships: []
      }
      test_metadata: {
        Row: {
          file_url: string
          instruction: string | null
          test_name: string
        }
        Insert: {
          file_url: string
          instruction?: string | null
          test_name: string
        }
        Update: {
          file_url?: string
          instruction?: string | null
          test_name?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          created_at: string
          id: string
          results: Json
          test_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          results: Json
          test_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          results?: Json
          test_type?: string
          user_id?: string
        }
        Relationships: []
      }
      todo_lists: {
        Row: {
          created_at: string
          id: string
          roadmap_id: string | null
          tasks: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          roadmap_id?: string | null
          tasks?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          roadmap_id?: string | null
          tasks?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "todo_lists_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
