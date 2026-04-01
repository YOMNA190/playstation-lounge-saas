import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Customer } from '@/types'
import { Users, Search, Plus, Phone, Star, Trophy, X } from 'lucide-react'
import { toast } from 'sonner'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [showAdd, setShowAdd]     = useState(false)
  const [newName, setNewName]     = useState('')
  const [newPhone, setNewPhone]   = useState('')
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('customers').select('*').order('points', { ascending: false })
    if (search) q = q.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
    const { data } = await q
    setCustomers(data || [])
    setLoading(false)
  }, [search])

  useEffect(() => { load() }, [load])

  const handleAdd = async () => {
    if (!newName.trim()) return
    setSaving(true)
    const { error } = await supabase
      .from('customers')
      .insert({ name: newName.trim(), phone: newPhone.trim() || null })
    if (error) {
      toast.error(error.message.includes('unique') ? 'رقم الموبايل ده موجود بالفعل' : 'فشل إضافة العميل')
    } else {
      toast.success('تم إضافة العميل')
      setNewName(''); setNewPhone(''); setShowAdd(false)
      load()
    }
    setSaving(false)
  }

  const topCustomers = customers.slice(0, 3)
  const trophyColors = ['text-ps-gold', 'text-ps-muted', 'text-amber-600']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">العملاء</h1>
          <p className="text-ps-muted text-sm mt-0.5">{customers.length} عميل مسجل</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          <span className="hidden sm:inline">عميل جديد</span>
        </button>
      </div>

      {/* Top 3 podium */}
      {topCustomers.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ps-muted mb-4 flex items-center gap-2">
            <Trophy size={15} className="text-ps-gold" />
            أكثر العملاء نقاطاً هذا الشهر
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {topCustomers.map((c, i) => (
              <div key={c.id} className="text-center p-3 bg-ps-surface rounded-xl border border-ps-border">
                <Trophy size={20} className={`mx-auto mb-2 ${trophyColors[i]}`} />
                <p className="font-semibold text-sm truncate">{c.name}</p>
                <p className="text-ps-gold font-mono font-bold text-lg">{c.points}</p>
                <p className="text-ps-muted text-xs">نقطة</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ps-muted pointer-events-none" />
        <input
          className="input pr-10"
          placeholder="ابحث بالاسم أو رقم الموبايل..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Customer list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-ps-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-ps-muted">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>{search ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء بعد'}</p>
          </div>
        ) : (
          <div className="divide-y divide-ps-border/50">
            {customers.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-4 py-3.5 hover:bg-ps-surface/50 transition-colors">
                <div className="w-10 h-10 bg-ps-blue/10 border border-ps-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-ps-blue-light">{c.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.name}</p>
                  {c.phone && (
                    <p className="text-ps-muted text-xs flex items-center gap-1 mt-0.5" dir="ltr">
                      <Phone size={11} />{c.phone}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Star size={13} className="text-ps-gold" />
                  <span className="font-mono font-bold text-sm text-ps-gold">{c.points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative w-full max-w-sm bg-ps-card border border-ps-border rounded-2xl shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-ps-border">
              <p className="font-semibold">إضافة عميل جديد</p>
              <button onClick={() => setShowAdd(false)} className="btn-ghost p-1.5"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">الاسم *</label>
                <input className="input" placeholder="اسم العميل" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="label">رقم الموبايل</label>
                <input className="input" placeholder="01xxxxxxxxx" value={newPhone} onChange={e => setNewPhone(e.target.value)} dir="ltr" />
              </div>
            </div>
            <div className="p-5 border-t border-ps-border flex gap-3">
              <button onClick={() => setShowAdd(false)} className="btn-ghost flex-1">إلغاء</button>
              <button onClick={handleAdd} disabled={saving || !newName.trim()} className="btn-primary flex-1">
                {saving ? '...' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
