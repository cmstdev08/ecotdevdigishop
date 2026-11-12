import { createClient } from '@supabase/supabase-js'

export function createServerClient(cookieStore?: any) {
  const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://mitrzqnwltcnbghxoolv.supabase.co'

  const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    'sb_publishable_OuteowWTIO2ICYi8RwmPXQ_RNoKh76c'

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}
