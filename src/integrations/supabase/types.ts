// Hand-maintained to match supabase/migrations. Regenerate with `supabase gen types` when the CLI is linked.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      audit_requests: {
        Row: {
          notes: string | null;
          status: string;
          status_updated_at: string | null;
          app_status: string | null;
          budget: string;
          company: string;
          created_at: string;
          email: string;
          heard_from: string | null;
          id: string;
          landing_page: string | null;
          launch: string | null;
          link: string;
          listen_to: string;
          locale: string;
          name: string;
          pain: string | null;
          qualified: boolean;
          referrer: string | null;
          role: string;
          team_size: string;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_medium: string | null;
          utm_source: string | null;
        };
        Insert: {
          notes?: string | null;
          status?: string;
          status_updated_at?: string | null;
          app_status?: string | null;
          budget: string;
          company: string;
          created_at?: string;
          email: string;
          heard_from?: string | null;
          id?: string;
          landing_page?: string | null;
          launch?: string | null;
          link: string;
          listen_to: string;
          locale?: string;
          name: string;
          pain?: string | null;
          qualified?: boolean;
          referrer?: string | null;
          role: string;
          team_size: string;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Update: {
          notes?: string | null;
          status?: string;
          status_updated_at?: string | null;
          app_status?: string | null;
          budget?: string;
          company?: string;
          created_at?: string;
          email?: string;
          heard_from?: string | null;
          id?: string;
          landing_page?: string | null;
          launch?: string | null;
          link?: string;
          listen_to?: string;
          locale?: string;
          name?: string;
          pain?: string | null;
          qualified?: boolean;
          referrer?: string | null;
          role?: string;
          team_size?: string;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          company: string;
          created_at: string;
          email: string;
          id: string;
          locale: string;
          message: string;
          name: string;
        };
        Insert: {
          company?: string;
          created_at?: string;
          email: string;
          id?: string;
          locale: string;
          message: string;
          name: string;
        };
        Update: {
          company?: string;
          created_at?: string;
          email?: string;
          id?: string;
          locale?: string;
          message?: string;
          name?: string;
        };
        Relationships: [];
      };
      pack_signups: {
        Row: {
          notes: string | null;
          status: string;
          status_updated_at: string | null;
          created_at: string;
          email: string;
          id: string;
          landing_page: string | null;
          locale: string;
          making: string;
          name: string;
          referrer: string | null;
          utm_campaign: string | null;
          utm_content: string | null;
          utm_medium: string | null;
          utm_source: string | null;
        };
        Insert: {
          notes?: string | null;
          status?: string;
          status_updated_at?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          landing_page?: string | null;
          locale?: string;
          making: string;
          name: string;
          referrer?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Update: {
          notes?: string | null;
          status?: string;
          status_updated_at?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          landing_page?: string | null;
          locale?: string;
          making?: string;
          name?: string;
          referrer?: string | null;
          utm_campaign?: string | null;
          utm_content?: string | null;
          utm_medium?: string | null;
          utm_source?: string | null;
        };
        Relationships: [];
      };
      founding_slots: {
        Row: {
          id: boolean;
          remaining: number;
          total: number;
          updated_at: string;
        };
        Insert: {
          id?: boolean;
          remaining?: number;
          total?: number;
          updated_at?: string;
        };
        Update: {
          id?: boolean;
          remaining?: number;
          total?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      pack_downloads: {
        Row: {
          country: string | null;
          created_at: string;
          id: string;
          ip_hash: string | null;
          object_key: string;
          signup_id: string | null;
          user_agent: string | null;
        };
        Insert: {
          country?: string | null;
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          object_key: string;
          signup_id?: string | null;
          user_agent?: string | null;
        };
        Update: {
          country?: string | null;
          created_at?: string;
          id?: string;
          ip_hash?: string | null;
          object_key?: string;
          signup_id?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: {
          bucket: string;
          hits: number;
          key_hash: string;
          window_start: string;
        };
        Insert: {
          bucket: string;
          hits?: number;
          key_hash: string;
          window_start: string;
        };
        Update: {
          bucket?: string;
          hits?: number;
          key_hash?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      submission_errors: {
        Row: {
          created_at: string;
          form: string;
          id: string;
          locale: string | null;
          message: string;
          stage: string;
        };
        Insert: {
          created_at?: string;
          form: string;
          id?: string;
          locale?: string | null;
          message: string;
          stage: string;
        };
        Update: {
          created_at?: string;
          form?: string;
          id?: string;
          locale?: string | null;
          message?: string;
          stage?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      rate_limit_hit: {
        Args: {
          _bucket: string;
          _key_hash: string;
          _max: number;
          _window_seconds: number;
        };
        Returns: boolean;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const;
