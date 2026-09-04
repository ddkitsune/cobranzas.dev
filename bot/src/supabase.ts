import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Env } from './index'

export function makeSupabase(env: Env): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY)
}