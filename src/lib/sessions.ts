import { supabase } from '@/lib/supabase'
import { Session, StartSessionPayload } from '@/types'

// ─────────────────────────────────────────────────────────────
// START SESSION — server sets started_at via DEFAULT NOW()
// We NEVER send a timestamp from the client
// ─────────────────────────────────────────────────────────────
export async function startSession(payload: StartSessionPayload, staffId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      device_id:   payload.device_id,
      mode:        payload.mode,
      game_played: payload.game_played || null,
      customer_id: payload.customer_id || null,
      notes:       payload.notes || null,
      staff_id:    staffId,
      // started_at is set by server DEFAULT NOW() — no client clock
    })
    .select(`
      *,
      device:devices(*),
      customer:customers(*),
      staff:profiles(*)
    `)
    .single()

  return { data, error }
}

// ─────────────────────────────────────────────────────────────
// END SESSION — calls server-side PostgreSQL function
// Duration & cost calculated by Supabase, NOT the browser
// ─────────────────────────────────────────────────────────────
export async function endSession(sessionId: string) {
  const { data, error } = await supabase
    .rpc('end_session', { session_id: sessionId })

  return { data, error }
}

// ─────────────────────────────────────────────────────────────
// GET ACTIVE SESSIONS (for device grid)
// ─────────────────────────────────────────────────────────────
export async function getActiveSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      device:devices(*),
      customer:customers(*)
    `)
    .is('ended_at', null)
    .order('started_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─────────────────────────────────────────────────────────────
// GET TODAY'S SESSIONS (admin)
// ─────────────────────────────────────────────────────────────
export async function getTodaySessions(): Promise<Session[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      device:devices(*),
      customer:customers(*)
    `)
    .gte('started_at', today.toISOString())
    .not('ended_at', 'is', null)
    .order('ended_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─────────────────────────────────────────────────────────────
// SUBSCRIBE TO REALTIME CHANGES
// ─────────────────────────────────────────────────────────────
export function subscribeToSessions(callback: () => void) {
  return supabase
    .channel('sessions_realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'sessions',
    }, callback)
    .subscribe()
}
