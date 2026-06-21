export const env = {
  apiBase: import.meta.env.VITE_API_BASE ?? '',
  /** Optional Supabase cloud auth — set these to enable real Google/Facebook/cloud accounts. */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
} as const

export const cloudAuthEnabled = !!env.supabaseUrl && !!env.supabaseAnonKey
