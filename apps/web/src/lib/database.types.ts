export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          slug: string
          description: string | null
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      skills: {
        Row: {
          id: string
          category: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          category: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: string
          name?: string
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          id: string
          title: string
          description: string | null
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          slug?: string
          created_at?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          id: string
          name: string
          code: string
          region: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          region?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          region?: string | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          experience_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null
          available_time: 'LESS_THAN_1_HR' | '1_TO_2_HRS' | '2_TO_4_HRS' | '4_TO_8_HRS' | 'FULL_TIME' | null
          budget_bracket: 'ZERO' | '1_TO_50' | '50_TO_250' | '250_TO_1000' | '1000_PLUS' | 'NOT_SURE' | null
          target_audience_focus: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          experience_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null
          available_time?: 'LESS_THAN_1_HR' | '1_TO_2_HRS' | '2_TO_4_HRS' | '4_TO_8_HRS' | 'FULL_TIME' | null
          budget_bracket?: 'ZERO' | '1_TO_50' | '50_TO_250' | '250_TO_1000' | '1000_PLUS' | 'NOT_SURE' | null
          target_audience_focus?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          experience_level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | null
          available_time?: 'LESS_THAN_1_HR' | '1_TO_2_HRS' | '2_TO_4_HRS' | '4_TO_8_HRS' | 'FULL_TIME' | null
          budget_bracket?: 'ZERO' | '1_TO_50' | '50_TO_250' | '250_TO_1000' | '1000_PLUS' | 'NOT_SURE' | null
          target_audience_focus?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_skills: {
        Row: {
          user_id: string
          skill_id: string
        }
        Insert: {
          user_id: string
          skill_id: string
        }
        Update: {
          user_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          }
        ]
      }
      user_interests: {
        Row: {
          user_id: string
          category_id: string
        }
        Insert: {
          user_id: string
          category_id: string
        }
        Update: {
          user_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      user_goals: {
        Row: {
          user_id: string
          goal_id: string
        }
        Insert: {
          user_id: string
          goal_id: string
        }
        Update: {
          user_id?: string
          goal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          }
        ]
      }
      user_markets: {
        Row: {
          user_id: string
          market_id: string
        }
        Insert: {
          user_id: string
          market_id: string
        }
        Update: {
          user_id?: string
          market_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_markets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_markets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          }
        ]
      }
      ideas: {
        Row: {
          id: string
          owner_id: string | null
          title: string
          slug: string
          short_description: string
          description: string | null
          problem: string | null
          solution: string | null
          target_audience: string | null
          monetization: string | null
          category_id: string | null
          difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'HARD'
          estimated_cost: string | null
          estimated_time: string | null
          mvp_features: Json
          visibility: 'PRIVATE' | 'PUBLIC' | 'UNLISTED'
          status: 'DRAFT' | 'SAVED' | 'VALIDATING' | 'BUILDING' | 'LAUNCHED' | 'ARCHIVED'
          ai_generated: boolean
          ai_model: string | null
          ai_generation_id: string | null
          deleted_at: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          title: string
          slug: string
          short_description: string
          description?: string | null
          problem?: string | null
          solution?: string | null
          target_audience?: string | null
          monetization?: string | null
          category_id?: string | null
          difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'HARD'
          estimated_cost?: string | null
          estimated_time?: string | null
          mvp_features?: Json
          visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED'
          status?: 'DRAFT' | 'SAVED' | 'VALIDATING' | 'BUILDING' | 'LAUNCHED' | 'ARCHIVED'
          ai_generated?: boolean
          ai_model?: string | null
          ai_generation_id?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string | null
          title?: string
          slug?: string
          short_description?: string
          description?: string | null
          problem?: string | null
          solution?: string | null
          target_audience?: string | null
          monetization?: string | null
          category_id?: string | null
          difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'HARD'
          estimated_cost?: string | null
          estimated_time?: string | null
          mvp_features?: Json
          visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED'
          status?: 'DRAFT' | 'SAVED' | 'VALIDATING' | 'BUILDING' | 'LAUNCHED' | 'ARCHIVED'
          ai_generated?: boolean
          ai_model?: string | null
          ai_generation_id?: string | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      saved_ideas: {
        Row: {
          id: string
          user_id: string
          idea_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          idea_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          idea_id?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_ideas_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          context_type: 'GENERATION' | 'REFINEMENT' | 'VALIDATION'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          context_type?: 'GENERATION' | 'REFINEMENT' | 'VALIDATION'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          context_type?: 'GENERATION' | 'REFINEMENT' | 'VALIDATION'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata: Json
          input_tokens: number
          output_tokens: number
          latency_ms: number
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          metadata?: Json
          input_tokens?: number
          output_tokens?: number
          latency_ms?: number
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          metadata?: Json
          input_tokens?: number
          output_tokens?: number
          latency_ms?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      idea_generations: {
        Row: {
          id: string
          conversation_id: string | null
          user_id: string
          idea_id: string | null
          model: string
          provider: string
          prompt_version: string | null
          structured_output: Json
          input_tokens: number
          output_tokens: number
          latency_ms: number
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          user_id: string
          idea_id?: string | null
          model: string
          provider: string
          prompt_version?: string | null
          structured_output: Json
          input_tokens?: number
          output_tokens?: number
          latency_ms?: number
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          user_id?: string
          idea_id?: string | null
          model?: string
          provider?: string
          prompt_version?: string | null
          structured_output?: Json
          input_tokens?: number
          output_tokens?: number
          latency_ms?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_generations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_generations_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          }
        ]
      }
      audit_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          entity_type: string
          entity_id: string | null
          metadata: Json
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: Json
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      content_blog_post_comments: {
        Row: {
          author_id: string
          blog_post_id: string
          body: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          blog_post_id: string
          body: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          blog_post_id?: string
          body?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_blog_post_comments_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "content_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_blog_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      private_items: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__internals__">

type DefaultSchema = DatabaseWithoutInternals["public"]

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
    Enums: {},
  },
} as const
