/* eslint-disable @typescript-eslint/no-empty-object-type */
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
      admin_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          broker_name: string | null
          click_type: string | null
          clicked_at: string | null
          commission: number | null
          converted: boolean | null
          id: string
          product_name: string | null
          user_id: string | null
        }
        Insert: {
          broker_name?: string | null
          click_type?: string | null
          clicked_at?: string | null
          commission?: number | null
          converted?: boolean | null
          id?: string
          product_name?: string | null
          user_id?: string | null
        }
        Update: {
          broker_name?: string | null
          click_type?: string | null
          clicked_at?: string | null
          commission?: number | null
          converted?: boolean | null
          id?: string
          product_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal: {
        Row: {
          direction: string | null
          emotion: string | null
          entry_price: number | null
          exit_price: number | null
          id: string
          market: string | null
          notes: string | null
          pnl: number | null
          quantity: number | null
          ticker: string | null
          trade_date: string | null
          user_id: string | null
        }
        Insert: {
          direction?: string | null
          emotion?: string | null
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          market?: string | null
          notes?: string | null
          pnl?: number | null
          quantity?: number | null
          ticker?: string | null
          trade_date?: string | null
          user_id?: string | null
        }
        Update: {
          direction?: string | null
          emotion?: string | null
          entry_price?: number | null
          exit_price?: number | null
          id?: string
          market?: string | null
          notes?: string | null
          pnl?: number | null
          quantity?: number | null
          ticker?: string | null
          trade_date?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journal_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_products: {
        Row: {
          cover_emoji: string | null
          description: string | null
          id: string
          is_active: boolean | null
          page_count: number | null
          payhip_url: string | null
          price: number | null
          short_link: string | null
          sort_order: number | null
          title: string | null
        }
        Insert: {
          cover_emoji?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          payhip_url?: string | null
          price?: number | null
          short_link?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Update: {
          cover_emoji?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_count?: number | null
          payhip_url?: string | null
          price?: number | null
          short_link?: string | null
          sort_order?: number | null
          title?: string | null
        }
        Relationships: []
      }
      picks: {
        Row: {
          advice: string | null
          change_pct: number | null
          created_by: string | null
          dividend_yield: string | null
          entry_display: string | null
          expense_ratio: string | null
          goal: string | null
          id: string
          is_active: boolean | null
          is_college_pick: boolean | null
          is_featured: boolean | null
          name: string | null
          price: number | null
          price_up: boolean | null
          published_at: string | null
          ret_100_1yr: string | null
          ret_100_5yr: string | null
          ret_1yr: number | null
          ret_5yr: number | null
          risk_level: string | null
          signal: string | null
          signal_reason: string | null
          stop_display: string | null
          target_display: string | null
          ticker: string
          timeframe: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          advice?: string | null
          change_pct?: number | null
          created_by?: string | null
          dividend_yield?: string | null
          entry_display?: string | null
          expense_ratio?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          is_college_pick?: boolean | null
          is_featured?: boolean | null
          name?: string | null
          price?: number | null
          price_up?: boolean | null
          published_at?: string | null
          ret_100_1yr?: string | null
          ret_100_5yr?: string | null
          ret_1yr?: number | null
          ret_5yr?: number | null
          risk_level?: string | null
          signal?: string | null
          signal_reason?: string | null
          stop_display?: string | null
          target_display?: string | null
          ticker: string
          timeframe?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          advice?: string | null
          change_pct?: number | null
          created_by?: string | null
          dividend_yield?: string | null
          entry_display?: string | null
          expense_ratio?: string | null
          goal?: string | null
          id?: string
          is_active?: boolean | null
          is_college_pick?: boolean | null
          is_featured?: boolean | null
          name?: string | null
          price?: number | null
          price_up?: boolean | null
          published_at?: string | null
          ret_100_1yr?: string | null
          ret_100_5yr?: string | null
          ret_1yr?: number | null
          ret_5yr?: number | null
          risk_level?: string | null
          signal?: string | null
          signal_reason?: string | null
          stop_display?: string | null
          target_display?: string | null
          ticker?: string
          timeframe?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "picks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      price_cache: {
        Row: {
          cached_at: string | null
          change_pct: number | null
          price: number | null
          price_up: boolean | null
          ticker: string
        }
        Insert: {
          cached_at?: string | null
          change_pct?: number | null
          price?: number | null
          price_up?: boolean | null
          ticker: string
        }
        Update: {
          cached_at?: string | null
          change_pct?: number | null
          price?: number | null
          price_up?: boolean | null
          ticker?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          child_age: number | null
          college_goal: number | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          invest_monthly: number | null
          monthly_budget: number | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          paypal_sub_id: string | null
          plan: string | null
          role: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          child_age?: number | null
          college_goal?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          invest_monthly?: number | null
          monthly_budget?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          paypal_sub_id?: string | null
          plan?: string | null
          role?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          child_age?: number | null
          college_goal?: number | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          invest_monthly?: number | null
          monthly_budget?: number | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          paypal_sub_id?: string | null
          plan?: string | null
          role?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          billing_cycle: string | null
          cancelled_at: string | null
          id: string
          next_billing: string | null
          paypal_sub_id: string | null
          plan_id: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          id?: string
          next_billing?: string | null
          paypal_sub_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          billing_cycle?: string | null
          cancelled_at?: string | null
          id?: string
          next_billing?: string | null
          paypal_sub_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_emoji: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          quote: string | null
          result: string | null
          situation: string | null
          sort_order: number | null
          started_with: string | null
        }
        Insert: {
          avatar_emoji?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          quote?: string | null
          result?: string | null
          situation?: string | null
          sort_order?: number | null
          started_with?: string | null
        }
        Update: {
          avatar_emoji?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          quote?: string | null
          result?: string | null
          situation?: string | null
          sort_order?: number | null
          started_with?: string | null
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string | null
          id: string
          name: string | null
          notes: string | null
          ticker: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          ticker: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          name?: string | null
          notes?: string | null
          ticker?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
