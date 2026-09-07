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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          context_type: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          context_type?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          context_type?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          input_tokens: number | null
          latency_ms: number | null
          metadata: Json
          output_tokens: number | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json
          output_tokens?: number | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json
          output_tokens?: number | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      goals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      idea_competitors: {
        Row: {
          category: string | null
          created_at: string
          id: string
          idea_id: string
          name: string
          pricing_model: string | null
          strength: string | null
          updated_at: string
          user_complaints: string | null
          user_id: string
          vulnerability: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          idea_id: string
          name: string
          pricing_model?: string | null
          strength?: string | null
          updated_at?: string
          user_complaints?: string | null
          user_id: string
          vulnerability: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          idea_id?: string
          name?: string
          pricing_model?: string | null
          strength?: string | null
          updated_at?: string
          user_complaints?: string | null
          user_id?: string
          vulnerability?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_competitors_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "active_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_competitors_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_competitors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_experiments: {
        Row: {
          created_at: string
          current_result: string | null
          experiment_type: string
          id: string
          idea_id: string
          status: string
          target_metric: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_result?: string | null
          experiment_type: string
          id?: string
          idea_id: string
          status?: string
          target_metric: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_result?: string | null
          experiment_type?: string
          id?: string
          idea_id?: string
          status?: string
          target_metric?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_experiments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "active_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_experiments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_experiments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_generations: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          idea_id: string | null
          input_tokens: number | null
          latency_ms: number | null
          model: string
          output_tokens: number | null
          prompt_version: string | null
          provider: string
          structured_output: Json
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          idea_id?: string | null
          input_tokens?: number | null
          latency_ms?: number | null
          model: string
          output_tokens?: number | null
          prompt_version?: string | null
          provider: string
          structured_output: Json
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          idea_id?: string | null
          input_tokens?: number | null
          latency_ms?: number | null
          model?: string
          output_tokens?: number | null
          prompt_version?: string | null
          provider?: string
          structured_output?: Json
          user_id?: string
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
            foreignKeyName: "idea_generations_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "active_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_generations_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_generations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_interviews: {
        Row: {
          company_or_channel: string | null
          created_at: string
          id: string
          idea_id: string
          key_quote: string
          name: string
          pain_score: number
          role: string | null
          updated_at: string
          user_id: string
          verdict: string
          willingness_to_pay: string | null
        }
        Insert: {
          company_or_channel?: string | null
          created_at?: string
          id?: string
          idea_id: string
          key_quote: string
          name: string
          pain_score?: number
          role?: string | null
          updated_at?: string
          user_id: string
          verdict?: string
          willingness_to_pay?: string | null
        }
        Update: {
          company_or_channel?: string | null
          created_at?: string
          id?: string
          idea_id?: string
          key_quote?: string
          name?: string
          pain_score?: number
          role?: string | null
          updated_at?: string
          user_id?: string
          verdict?: string
          willingness_to_pay?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idea_interviews_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "active_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_interviews_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_interviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          ai_generated: boolean
          ai_generation_id: string | null
          ai_model: string | null
          category_id: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          difficulty: string
          estimated_cost: string | null
          estimated_time: string | null
          id: string
          monetization: string | null
          mvp_features: Json
          owner_id: string | null
          problem: string | null
          published_at: string | null
          short_description: string
          slug: string
          solution: string | null
          status: string
          target_audience: string | null
          title: string
          updated_at: string
          visibility: string
        }
        Insert: {
          ai_generated?: boolean
          ai_generation_id?: string | null
          ai_model?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          difficulty?: string
          estimated_cost?: string | null
          estimated_time?: string | null
          id?: string
          monetization?: string | null
          mvp_features?: Json
          owner_id?: string | null
          problem?: string | null
          published_at?: string | null
          short_description: string
          slug: string
          solution?: string | null
          status?: string
          target_audience?: string | null
          title: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          ai_generated?: boolean
          ai_generation_id?: string | null
          ai_model?: string | null
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          difficulty?: string
          estimated_cost?: string | null
          estimated_time?: string | null
          id?: string
          monetization?: string | null
          mvp_features?: Json
          owner_id?: string | null
          problem?: string | null
          published_at?: string | null
          short_description?: string
          slug?: string
          solution?: string | null
          status?: string
          target_audience?: string | null
          title?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_trends: {
        Row: {
          category: string
          competition_density: string
          created_at: string
          growth_rate: string
          id: string
          opportunity_score: number
          overview: string
          signal_strength: string
          slug: string
          source: string | null
          starter_prompt: string | null
          target_audience: string | null
          title: string
          unsolved_pains: Json
          updated_at: string
          whitespace_moat: string | null
        }
        Insert: {
          category: string
          competition_density?: string
          created_at?: string
          growth_rate: string
          id?: string
          opportunity_score?: number
          overview: string
          signal_strength?: string
          slug: string
          source?: string | null
          starter_prompt?: string | null
          target_audience?: string | null
          title: string
          unsolved_pains?: Json
          updated_at?: string
          whitespace_moat?: string | null
        }
        Update: {
          category?: string
          competition_density?: string
          created_at?: string
          growth_rate?: string
          id?: string
          opportunity_score?: number
          overview?: string
          signal_strength?: string
          slug?: string
          source?: string | null
          starter_prompt?: string | null
          target_audience?: string | null
          title?: string
          unsolved_pains?: Json
          updated_at?: string
          whitespace_moat?: string | null
        }
        Relationships: []
      }
      markets: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          region: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          region?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          region?: string | null
        }
        Relationships: []
      }
      private_items: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          owner_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          owner_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          owner_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          onboarding_completed: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          onboarding_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      saved_ideas: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_ideas_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "active_ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_ideas_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          goal_id: string
          user_id: string
        }
        Insert: {
          goal_id: string
          user_id: string
        }
        Update: {
          goal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_goals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          category_id: string
          user_id: string
        }
        Insert: {
          category_id: string
          user_id: string
        }
        Update: {
          category_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_markets: {
        Row: {
          market_id: string
          user_id: string
        }
        Insert: {
          market_id: string
          user_id: string
        }
        Update: {
          market_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_markets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_markets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          available_time: AvailableTime | null
          budget_bracket: BudgetBracket | null
          created_at: string
          experience_level: ExperienceLevel | null
          id: string
          target_audience_focus: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_time?: AvailableTime | null
          budget_bracket?: BudgetBracket | null
          created_at?: string
          experience_level?: ExperienceLevel | null
          id?: string
          target_audience_focus?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_time?: AvailableTime | null
          budget_bracket?: BudgetBracket | null
          created_at?: string
          experience_level?: ExperienceLevel | null
          id?: string
          target_audience_focus?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          skill_id: string
          user_id: string
        }
        Insert: {
          skill_id: string
          user_id: string
        }
        Update: {
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_trend_bookmarks: {
        Row: {
          created_at: string
          trend_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          trend_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          trend_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trend_bookmarks_trend_id_fkey"
            columns: ["trend_id"]
            isOneToOne: false
            referencedRelation: "market_trends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_trend_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_ideas: {
        Row: {
          ai_generated: boolean | null
          ai_generation_id: string | null
          ai_model: string | null
          category_id: string | null
          created_at: string | null
          deleted_at: string | null
          description: string | null
          difficulty: string | null
          estimated_cost: string | null
          estimated_time: string | null
          id: string | null
          monetization: string | null
          mvp_features: Json | null
          owner_id: string | null
          problem: string | null
          published_at: string | null
          short_description: string | null
          slug: string | null
          solution: string | null
          status: string | null
          target_audience: string | null
          title: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_generation_id?: string | null
          ai_model?: string | null
          category_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_cost?: string | null
          estimated_time?: string | null
          id?: string | null
          monetization?: string | null
          mvp_features?: Json | null
          owner_id?: string | null
          problem?: string | null
          published_at?: string | null
          short_description?: string | null
          slug?: string | null
          solution?: string | null
          status?: string | null
          target_audience?: string | null
          title?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_generation_id?: string | null
          ai_model?: string | null
          category_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_cost?: string | null
          estimated_time?: string | null
          id?: string | null
          monetization?: string | null
          mvp_features?: Json | null
          owner_id?: string | null
          problem?: string | null
          published_at?: string | null
          short_description?: string | null
          slug?: string | null
          solution?: string | null
          status?: string | null
          target_audience?: string | null
          title?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ideas_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
} as const;

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type AvailableTime = 'LESS_THAN_1_HR' | '1_TO_2_HRS' | '2_TO_4_HRS' | '4_TO_8_HRS' | 'FULL_TIME';
export type BudgetBracket = 'ZERO' | '1_TO_50' | '50_TO_250' | '250_TO_1000' | '1000_PLUS' | 'NOT_SURE';
export type IdeaDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'HARD';
export type IdeaVisibility = 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
export type IdeaStatus = 'DRAFT' | 'SAVED' | 'VALIDATING' | 'BUILDING' | 'LAUNCHED' | 'ARCHIVED';
