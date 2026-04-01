import { useState, useEffect } from 'react'
import { Device, Customer, POPULAR_GAMES } from '@/types'
import { startSession } from '@/lib/sessions'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { X, Search, UserPlus, Gamepad2 } from 'lucide-react'
import { toast } from 'sonner'
import clsx from 'clsx'

interface Props {
  device: Device
  onClose: () => void
  onSuccess: () => void
}

export default function StartSessionModal({ device, onClose, onSuccess }: Props) {
  const { user } = useAuth()
  const [mode, setMode]               = useState<'single' | 'multi'>('single')
  const [game, setGame]               = useState('')
  const [customGame, setCustomGame]   = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers]     = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [loading, setLoading]         = useState(false)
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newName, setNewName]         = useState('')
  const [newPhone, setNewPhone]       = useState('')

  useEffect(() => {
    if (customerSearch.length < 2) { setCustomers([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${customerSearch}%,phone.ilike.%${customerSearch}%`)
        .limit(5)
      setCustomers(data || [])
    }, 300)
    return () => clearTimeout(timer)
  }, [customerSearch])

  const createCustomer = async () => {
    if (!newName.trim()) return null
    const { data, error } = await supabase
      .from('customers')
      .insert({ name: newName.trim(), phone: newPhone.trim() || null })
      .select()
      .single()
    if (error) { toast.error('فشل إنشاء العميل'); return null }
    return data as Customer
  }

  const handleStart = async () => {
    if (!user) return
    setLoading(true)

    let customerId = selectedCustomer?.id

    if (showNewCustomer && newName.trim()) {
      const c = await createCustomer()
      if (c) customerId = c.id
    }

    const finalGame = game === 'أخرى' ? customGame : game

    const { error } = await startSession({
      device_id:   device.id,
      mode,
      game_played: finalGame || undefined,
      customer_id: customerId,
    }, user.id)

    if (error) {
      toast.error('فشل بدء الجلسة')
    } else {
      toast.success(`بدأت الجلسة على ${device.name}`)
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-ps-card border border-ps-border rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ps-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-ps-blue/10 border border-ps-blue/20 rounded-xl flex items-center justify-center">
              <Gamepad2 size={18} className="text-ps-blue-light" />
            </div>
            <div>
              <p className="font-semibold">بدء جلسة جديدة</p>
              <p className="text-xs text-ps-muted">{device.name} • {device.type}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Mode */}
          <div>
            <label className="label">نوع اللعب</label>
            <div className="grid grid-cols-2 gap-2">
              {(['single', 'multi'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={clsx(
                    'py-3 rounded-xl border text-sm font-semibold transition-all duration-200',
                    mode === m
                      ? 'bg-ps-blue/15 border-ps-blue/40 text-ps-blue-light'
                      : 'bg-ps-surface border-ps-border text-ps-muted hover:border-ps-blue/20'
                  )}
                >
                  {m === 'single' ? '👤 Single' : '👥 Multi'}
                  <span className="block text-xs font-normal opacity-70 mt-0.5">
                    {m === 'single' ? `${device.price_single} جنيه/س` : `${device.price_multi} جنيه/س`}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Game */}
          <div>
            <label className="label">اللعبة (اختياري)</label>
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              {POPULAR_GAMES.slice(0, 8).map(g => (
                <button
                  key={g}
                  onClick={() => setGame(g === game ? '' : g)}
                  className={clsx(
                    'text-xs px-2.5 py-2 rounded-lg border transition-all duration-150 text-right',
                    game === g
                      ? 'bg-ps-blue/15 border-ps-blue/30 text-ps-blue-light'
                      : 'bg-ps-surface border-ps-border text-ps-muted hover:border-ps-blue/20'
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            {game === 'أخرى' && (
              <input
                className="input text-sm"
                placeholder="اكتب اسم اللعبة..."
                value={customGame}
                onChange={e => setCustomGame(e.target.value)}
              />
            )}
          </div>

          {/* Customer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">العميل (اختياري)</label>
              <button
                onClick={() => { setShowNewCustomer(!showNewCustomer); setSelectedCustomer(null) }}
                className="text-xs text-ps-blue-light hover:underline flex items-center gap-1"
              >
                <UserPlus size={12} />
                {showNewCustomer ? 'بحث عن عميل' : 'عميل جديد'}
              </button>
            </div>

            {!showNewCustomer ? (
              <div className="relative">
                <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ps-muted pointer-events-none" />
                <input
                  className="input pr-9 text-sm"
                  placeholder="ابحث بالاسم أو الموبايل..."
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={e => { setCustomerSearch(e.target.value); setSelectedCustomer(null) }}
                />
                {customers.length > 0 && !selectedCustomer && (
                  <div className="absolute top-full mt-1 w-full bg-ps-card border border-ps-border rounded-xl shadow-xl z-10 overflow-hidden">
                    {customers.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSelectedCustomer(c); setCustomers([]); setCustomerSearch('') }}
                        className="w-full text-right px-4 py-2.5 hover:bg-ps-surface flex items-center justify-between text-sm"
                      >
                        <span>{c.name}</span>
                        <span className="text-ps-muted text-xs">{c.phone} • {c.points} نقطة</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedCustomer && (
                  <div className="mt-2 flex items-center justify-between bg-ps-green/10 border border-ps-green/20 rounded-xl px-3 py-2">
                    <span className="text-sm text-ps-green">{selectedCustomer.name}</span>
                    <button onClick={() => setSelectedCustomer(null)} className="text-ps-muted hover:text-ps-red">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input className="input text-sm" placeholder="الاسم *" value={newName} onChange={e => setNewName(e.target.value)} />
                <input className="input text-sm" placeholder="رقم الموبايل (اختياري)" value={newPhone} onChange={e => setNewPhone(e.target.value)} dir="ltr" />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-ps-border flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">إلغاء</button>
          <button onClick={handleStart} disabled={loading} className="btn-primary flex-1">
            {loading
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />جاري البدء...</span>
              : '🎮 ابدأ الجلسة'
            }
          </button>
        </div>
      </div>
    </div>
  )
}
