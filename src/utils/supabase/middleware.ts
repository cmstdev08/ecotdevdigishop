import { supabase } from './client'

export async function updateSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}
