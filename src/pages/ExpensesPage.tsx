import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Expense, FIXED_EXPENSES, TOTAL_FIXED_EXPENSES } from '@/types'
import { getDashboardSummary } from '@/lib/analytics'
import { DashboardSummary } from '@/types'
import { Receipt, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

export default function ExpensesPage() {
  const [expenses, setExpenses]   = useState<Expense[]>([])
  const [summary, setSummary]     = useState<DashboardSummary | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('expenses').select('*').order('id'),
      getDashboardSummary(),
    ]).then(([expRes, sum]) => {
      setExpenses(expRes.data || [])
      setSummary(sum)
    }).finally(() => setLoading(false))
  }, [])

  const syncExpenses = async () => {
    setLoading(true)
    // Re-insert if empty
    const { data } = await supabase.from('expenses').select('id')
    if (!data?.length) {
      await supabase.from('expenses').insert(
        FIXED_EXPENSES.map(e => ({ name: e.name, amount: e.amount }))
      )
    }
    const { data: refreshed } = await supabase.from('expenses').select('*').order('id')
    setExpenses(refreshed || [])
    setLoading(false)
  }

  const netProfit      = summary?.net_profit ?? 0
  const grossRevenue   = summary?.gross_revenue ?? 0
  const profitPercent  = grossRevenue > 0
    ? Math.round((netProfit / grossRevenue) * 100)
    : 0

  const NetIcon = netProfit > 0 ? TrendingUp : netProfit < 0 ? TrendingDown : Minus
  const netColor = netProfit > 0 ? 'text-ps-green' : netProfit < 0 ? 'text-ps-red' : 'text-ps-muted'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المصاريف الشهرية</h1>
          <p className="text-ps-muted text-sm mt-0.5">المصاريف الثابتة وصافي الربح</p>
        </div>
        <button onClick={syncExpenses} className="btn-ghost p-2.5">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="stat-card border-ps-blue/20">
          <p className="text-ps-muted text-xs mb-1">إجمالي الإيرادات (الشهر)</p>
          <p className="text-2xl font-bold font-mono text-ps-blue-light">
            {(grossRevenue).toLocaleString()}
          </p>
          <p className="text-ps-muted text-xs">جنيه</p>
        </div>

        <div className="stat-card border-ps-red/20">
          <p className="text-ps-muted text-xs mb-1">إجمالي المصاريف</p>
          <p className="text-2xl font-bold font-mono text-ps-red">
            {TOTAL_FIXED_EXPENSES.toLocaleString()}
          </p>
          <p className="text-ps-muted text-xs">جنيه</p>
        </div>

        <div className={clsx('stat-card', netProfit >= 0 ? 'border-ps-green/20' : 'border-ps-red/20')}>
          <p className="text-ps-muted text-xs mb-1">صافي الربح</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold font-mono ${netColor}`}>
              {Math.abs(netProfit).toLocaleString()}
            </p>
            <NetIcon size={20} className={netColor} />
          </div>
          <p className="text-ps-muted text-xs">
            {netProfit >= 0 ? `+${profitPercent}%` : `${profitPercent}%`} من الإيرادات
          </p>
        </div>
      </div>

      {/* Visual profit bar */}
      {grossRevenue > 0 && (
        <div className="card p-5">
          <div className="flex justify-between text-xs text-ps-muted mb-2">
            <span>توزيع الإيرادات</span>
            <span>{grossRevenue.toLocaleString()} جنيه</span>
          </div>
          <div className="h-4 bg-ps-surface rounded-full overflow-hidden flex">
            <div
              className="h-full bg-ps-red/70 transition-all duration-700"
              style={{ width: `${Math.min((TOTAL_FIXED_EXPENSES / grossRevenue) * 100, 100)}%` }}
            />
            {netProfit > 0 && (
              <div
                className="h-full bg-ps-green transition-all duration-700"
                style={{ width: `${(netProfit / grossRevenue) * 100}%` }}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-ps-red/70 rounded-sm" />مصاريف</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-ps-green rounded-sm" />ربح صافي</span>
          </div>
        </div>
      )}

      {/* Expenses table */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-ps-border">
          <Receipt size={16} className="text-ps-muted" />
          <h2 className="font-semibold text-sm">تفاصيل المصاريف الثابتة</h2>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-2 border-ps-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-ps-border/50">
              {(expenses.length > 0 ? expenses : FIXED_EXPENSES).map((e, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-ps-surface/50 transition-colors">
                  <span className="text-sm">{e.name}</span>
                  <span className="font-mono font-semibold text-sm text-ps-text">
                    {Number(e.amount).toLocaleString()} جنيه
                  </span>
                </div>
              ))}
            </div>

            {/* Total row */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-ps-border bg-ps-surface/50">
              <span className="font-bold">الإجمالي الشهري</span>
              <span className="font-mono font-bold text-ps-red text-lg">
                {TOTAL_FIXED_EXPENSES.toLocaleString()} جنيه
              </span>
            </div>
          </>
        )}
      </div>

      <p className="text-ps-muted text-xs text-center">
        * المصاريف الثابتة يتم خصمها تلقائياً من الإيرادات الشهرية لحساب صافي الربح
      </p>
    </div>
  )
}
