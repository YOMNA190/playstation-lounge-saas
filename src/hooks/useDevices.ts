import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { subscribeToSessions } from '@/lib/sessions'
import { Device, Session } from '@/types'

export function useDevices() {
  const [devices, setDevices]   = useState<Device[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      const [devRes, sessRes] = await Promise.all([
        supabase.from('devices').select('*').order('id'),
        supabase.from('sessions')
          .select('*, customer:customers(*)')
          .is('ended_at', null),
      ])

      if (devRes.error) throw devRes.error
      if (sessRes.error) throw sessRes.error

      const sessionMap = new Map<number, Session>()
      ;(sessRes.data || []).forEach(s => sessionMap.set(s.device_id, s))

      const enriched = (devRes.data || []).map(d => ({
        ...d,
        active_session: sessionMap.get(d.id) || null,
      }))

      setDevices(enriched)
      setSessions(sessRes.data || [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'خطأ في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()

    // 🔴 REALTIME — updates across all connected browsers instantly
    const channel = subscribeToSessions(fetchAll)
    return () => { supabase.removeChannel(channel) }
  }, [fetchAll])

  return { devices, sessions, loading, error, refetch: fetchAll }
}
