import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface TierList {
  id: string
  name: string
  description: string
  thumbnail_url: string
  maker_name: string
  created_at: string
}

export interface Character {
  id: string
  tier_list_id: string
  name: string
  image_url: string
  elo_rating: number
  total_comparisons: number
  created_at: string
}

export interface Comparison {
  id: string
  tier_list_id: string
  character1_id: string
  character2_id: string
  winner_id: string
  created_at: string
}