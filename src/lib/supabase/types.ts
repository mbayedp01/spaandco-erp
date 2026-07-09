export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      establishments: {
        Row: {
          id: string
          name: string
          city: string
          address: string | null
          phone: string | null
          status: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['establishments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['establishments']['Insert']>
      }
      clients: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          loyalty_points: number
          is_vip: boolean
          last_visit: string | null
          total_spent: number
          visits_count: number
          join_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      staff: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          role: string
          specialty: string | null
          salary: number | null
          status: string
          rating: number | null
          spa_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['staff']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['staff']['Insert']>
      }
      services: {
        Row: {
          id: string
          name: string
          category: string | null
          description: string | null
          duration: number | null
          price: number | null
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      appointments: {
        Row: {
          id: string
          client_id: string | null
          staff_id: string | null
          service_id: string | null
          client_name: string | null
          staff_name: string | null
          service_name: string | null
          date: string
          time: string | null
          duration: number | null
          price: number | null
          status: string
          notes: string | null
          day: number | null
          spa_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>
      }
      inventory: {
        Row: {
          id: string
          name: string
          category: string | null
          quantity: number
          unit: string | null
          min_quantity: number
          supplier: string | null
          unit_price: number | null
          spa_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>
      }
      suppliers: {
        Row: {
          id: string
          name: string
          category: string | null
          contact: string | null
          phone: string | null
          email: string | null
          monthly_spend: number
          last_order: string | null
          status: string
          pending_orders: number
          spa_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['suppliers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['suppliers']['Insert']>
      }
      cash_transactions: {
        Row: {
          id: string
          date: string
          label: string | null
          category: string | null
          amount: number
          type: string
          payment_method: string | null
          created_by: string | null
          spa_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cash_transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cash_transactions']['Insert']>
      }
      audit_log: {
        Row: {
          id: string
          actor_email: string | null
          actor_role: string | null
          action: string
          entity_type: string
          entity_name: string | null
          details: Record<string, unknown> | null
          spa_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_log']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_log']['Insert']>
      }
      membership_plans: {
        Row: {
          id: string
          name: string
          price: number
          remise: number
          color: string | null
          avantages: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['membership_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['membership_plans']['Insert']>
      }
      memberships: {
        Row: {
          id: string
          client_id: string | null
          plan_id: string | null
          client_name: string | null
          plan_name: string | null
          since: string | null
          next_billing: string | null
          status: string
          soins_restants: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>
      }
      campaigns: {
        Row: {
          id: string
          name: string
          type: string
          target: string | null
          status: string
          sent: number
          opened: number
          date: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['campaigns']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['campaigns']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
