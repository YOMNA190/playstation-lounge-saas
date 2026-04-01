import { useState, useEffect } from 'react'
import { Device } from '@/types'
import { endSession } from '@/lib/sessions'
import { Gamepad2, Clock, User, StopCircle, Play, Users } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'
import StartSessionModal from './StartSessionModal'

interface Props {
  device: Device
  onUpdate: () => void
}

function useElapsedTime(startedAt: string | undefined) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (!startedAt) { setElapsed(''); return }

    const update = () => {
      const diff = Date.now() - new Date(startedAt).getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setElapsed(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return elapsed
}

export default function DeviceCard({ device, onUpdate }: Props) {
  const [ending, setEnding]       = useState(false)
  const [showStart, setShowStart] = useState(false)
  const isActive = !!device.active_session
  const session  = device.active_session
  const elapsed  = useElapsedTime(session?.started_at)

  const handleEnd = async () => {
    if (!session) return
    setEnding(true)
    const { data, error } = await endSession(session.id)
    if (error) {
      toast.error('فشل إنهاء الجلسة')
    } else {
      toast.success(`انتهت الجلسة — التكلفة: ${data?.cost} جنيه`)
      onUpdate()
    }
    setEnding(false)
  }

  return (
    <>
      <div className={clsx(
        'card relative overflow-hidden transition-all duration-300',
        isActive
          ? 'border-ps-green/30 shadow-lg shadow-ps-green/5'
          : 'hover:border-ps-blue/20'
      )}>
        {/* Active glow stripe */}
        {isActive && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-ps-green to-transparent" />
        )}

        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                isActive ? 'bg-ps-green/10 border border-ps-green/20' : 'bg-ps-surface border border-ps-border'
              )}>
                <Gamepad2 size={20} className={isActive ? 'text-ps-green' : 'text-ps-muted'} />
              </div>
              <div>
                <p className="font-semibold text-sm">{device.name}</p>
                <span className={clsx(
                  'text-xs font-mono font-bold px-1.5 py-0.5 rounded',
                  device.type === 'PS5'
                    ? 'bg-ps-blue/10 text-ps-blue-light'
                    : 'bg-ps-purple/10 text-ps-purple'
                )}>{device.type}</span>
              </div>
            </div>

            {isActive
              ? <span className="badge-active"><span className="w-1.5 h-1.5 bg-ps-green rounded-full animate-pulse" />نشط</span>
              : <span className="badge-idle">فارغ</span>
            }
          </div>

          {/* Active session info */}
          {isActive && session ? (
            <div className="space-y-2 mb-4">
              {/* Timer */}
              <div className="bg-ps-surface rounded-xl px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-ps-muted text-xs">
                  <Clock size={13} />
                  وقت اللعب
                </div>
                <span className="font-mono text-ps-green font-bold text-sm">{elapsed}</span>
              </div>

              {/* Mode */}
              <div className="flex gap-2">
                <div className="flex-1 bg-ps-surface rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                  <Users size={12} className="text-ps-muted" />
                  <span className="text-xs text-ps-muted">
                    {session.mode === 'single' ? 'Single' : 'Multi'}
                  </span>
                </div>
                {session.customer && (
                  <div className="flex-1 bg-ps-surface rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 overflow-hidden">
                    <User size={12} className="text-ps-muted flex-shrink-0" />
                    <span className="text-xs text-ps-muted truncate">{session.customer.name}</span>
                  </div>
                )}
              </div>

              {session.game_played && (
                <p className="text-xs text-ps-muted bg-ps-surface rounded-lg px-2.5 py-1.5 truncate">
                  🎮 {session.game_played}
                </p>
              )}

              <button
                onClick={handleEnd}
                disabled={ending}
                className="btn-danger w-full flex items-center justify-center gap-2 py-2 text-sm"
              >
                {ending
                  ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  : <StopCircle size={15} />
                }
                إنهاء الجلسة
              </button>
            </div>
          ) : (
            <div className="mb-4 py-4 flex flex-col items-center justify-center text-ps-muted">
              <p className="text-xs mb-1">Single: {device.price_single} جنيه/س</p>
              <p className="text-xs">Multi: {device.price_multi} جنيه/س</p>
            </div>
          )}

          {!isActive && (
            <button
              onClick={() => setShowStart(true)}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm"
            >
              <Play size={15} />
              بدء جلسة
            </button>
          )}
        </div>
      </div>

      {showStart && (
        <StartSessionModal
          device={device}
          onClose={() => setShowStart(false)}
          onSuccess={() => { setShowStart(false); onUpdate() }}
        />
      )}
    </>
  )
}
