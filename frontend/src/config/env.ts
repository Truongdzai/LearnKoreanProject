export const env = {
  apiBase: import.meta.env.VITE_API_BASE ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  monitorEndpoint: import.meta.env.VITE_MONITOR_ENDPOINT ?? '',
  agentBase: import.meta.env.VITE_AGENT_BASE ?? '',
} as const

export const cloudAuthEnabled = !!env.supabaseUrl && !!env.supabaseAnonKey
