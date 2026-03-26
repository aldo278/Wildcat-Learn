import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qyjqfwfayoirfqduzkmm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF5anFmd2ZheW9pcmZxZHV6a21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0ODg1NTIsImV4cCI6MjA5MDA2NDU1Mn0.kisGZUaaHIixGaHLphDc3JKWB9lvS1ZEc7YEgMg606U'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get the current session token for API calls
export const getSessionToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}
