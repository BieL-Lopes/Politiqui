import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isSupabaseConfigured = !!supabaseUrl && !!supabasePublishableKey;

/**
 * Cliente Supabase. Será null quando as variáveis de ambiente não estiverem definidas
 * (modo demo/mock — o app funciona localmente sem backend).
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;
