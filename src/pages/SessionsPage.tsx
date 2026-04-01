import { useState, useEffect, useCallback } from 'react'
import { getTodaySessions } from '@/lib/sessions'
import { subscribeToSessions } from '@/lib/sessions'
import { supabase } from '@/lib/supabase'
import { Session } from '@/types'
import { ClipboardList, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import clsx from 'clsx'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getTodaySessions()
    setSessions(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const ch = subscribeToSessions(load)
    return () => { supabase.removeChannel(ch) }
  }, [load])

  const totalRevenue = sessions.reduce((s, r) => s + (r.cost || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">جلسات اليوم</h1>
          <p className="text-ps-muted text-sm mt-0.5">{sessions.length} جلسة مكتملة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="card px-4 py-2 text-sm">
            <span className="text-ps-muted">الإجمالي: </span>
            <span className="text-ps-gold font-bold font-mono">{totalRevenue.toLocaleString()} جنيه</span>
          </div>
          <button onClick={load} className="btn-ghost p-2.5">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ps-muted">
            <div className="w-8 h-8 border-2 border-ps-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center text-ps-muted">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p>لا توجد جلسات مكتملة اليوم</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ps-border text-ps-muted text-xs">
                  <th className="text-right px-4 py-3 font-medium">الجهاز</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">العميل</th>
                  <th className="text-right px-4 py-3 font-medium hidden md:table-cell">اللعبة</th>
                  <th className="text-right px-4 py-3 font-medium">النوع</th>
                  <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">المدة</th>
                  <th className="text-right px-4 py-3 font-medium">التكلفة</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => {
                  const duration = s.ended_at && s.started_at
                    ? ((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000).toFixed(0)
                    : '--'
                  return (
                    <tr key={s.id} className="border-b border-ps-border/50 hover:bg-ps-surface/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{s.device?.name || `#${s.device_id}`}</td>
                      <td className="px-4 py-3 text-ps-muted hidden sm:table-cell">
                        {s.customer?.name || <span className="text-ps-border">—</span>}
                      </td>
                      <td className="px-4 py-3 text-ps-muted hidden md:table-cell">
                        {s.game_played || <span className="text-ps-border">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-xs font-semibold px-2 py-1 rounded-lg',
                          s.mode === 'single'
                            ? 'bg-ps-blue/10 text-ps-blue-light'
                            : 'bg-ps-purple/10 text-ps-purple'
                        )}>
                          {s.mode === 'single' ? 'Single' : 'Multi'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-ps-muted hidden lg:table-cell">{duration} د</td>
                      <td className="px-4 py-3 font-mono font-bold text-ps-gold">{s.cost} جنيه</td>
                      <td className="px-4 py-3 text-ps-muted text-xs hidden sm:table-cell">
                        {s.ended_at ? formatDistanceToNow(new Date(s.ended_at), { locale: ar, addSuffix: true }) : ''}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
