import { useState, useEffect } from 'react'
import { getDeviceRevenue, getTopCustomers, getTopGames } from '@/lib/analytics'
import { DailyDeviceRevenue, TopCustomer, TopGame } from '@/types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts'
import { BarChart3, Trophy, Gamepad2, TrendingUp } from 'lucide-react'

const DEVICE_COLORS = [
  '#0070d1','#003791','#8b5cf6','#00c896','#ffd700',
  '#ff4757','#ff6b81','#2ed573','#1e90ff','#a29bfe',
]

export default function AnalyticsPage() {
  const [devRevenue, setDevRevenue]   = useState<DailyDeviceRevenue[]>([])
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([])
  const [topGames, setTopGames]       = useState<TopGame[]>([])
  const [days, setDays]               = useState(7)
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getDeviceRevenue(days),
      getTopCustomers(3),
      getTopGames(5),
    ]).then(([dr, tc, tg]) => {
      setDevRevenue(dr)
      setTopCustomers(tc)
      setTopGames(tg)
    }).finally(() => setLoading(false))
  }, [days])

  // Aggregate revenue per device for bar chart
  const deviceSummary = devRevenue.reduce<Record<string, { name: string; revenue: number; sessions: number }>>((acc, row) => {
    if (!acc[row.device_name]) acc[row.device_name] = { name: row.device_name, revenue: 0, sessions: 0 }
    acc[row.device_name].revenue  += Number(row.total_revenue)
    acc[row.device_name].sessions += Number(row.session_count)
    return acc
  }, {})

  const barData = Object.values(deviceSummary).sort((a, b) => b.revenue - a.revenue)

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-ps-card border border-ps-border rounded-xl px-4 py-3 shadow-xl text-sm">
          <p className="font-semibold mb-1">{label}</p>
          <p className="text-ps-gold font-mono">{payload[0].value.toLocaleString()} جنيه</p>
        </div>
      )
    }
    return null
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-ps-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">التحليلات</h1>
          <p className="text-ps-muted text-sm mt-0.5">تقارير الأداء التفصيلية</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                days === d
                  ? 'bg-ps-blue/15 border-ps-blue/30 text-ps-blue-light'
                  : 'border-ps-border text-ps-muted hover:border-ps-blue/20 bg-ps-surface'
              }`}
            >
              {d} يوم
            </button>
          ))}
        </div>
      </div>

      {/* Revenue per device bar chart */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={18} className="text-ps-blue-light" />
          <h2 className="font-semibold">الإيرادات لكل جهاز</h2>
        </div>
        {barData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-ps-muted text-sm">
            لا توجد بيانات في هذه الفترة
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
              <XAxis dataKey="name" tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Device sessions pie + table */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-ps-purple" />
            <h2 className="font-semibold text-sm">توزيع الجلسات</h2>
          </div>
          {barData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-ps-muted text-sm">لا توجد بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={barData}
                  dataKey="sessions"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {barData.map((_, i) => (
                    <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: '#6b6b8a', fontSize: 11 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue table */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4">جدول الأجهزة</h2>
          <div className="space-y-2">
            {barData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: DEVICE_COLORS[i % DEVICE_COLORS.length] }}
                />
                <span className="text-sm flex-1">{d.name}</span>
                <span className="font-mono text-xs text-ps-muted">{d.sessions} جلسة</span>
                <span className="font-mono font-bold text-ps-gold text-sm">
                  {d.revenue.toLocaleString()} جنيه
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly highlights */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top 3 customers */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={16} className="text-ps-gold" />
            <h2 className="font-semibold text-sm">أكثر 3 عملاء لعباً (هذا الشهر)</h2>
          </div>
          {topCustomers.length === 0 ? (
            <p className="text-ps-muted text-sm text-center py-6">لا توجد بيانات</p>
          ) : (
            <div className="space-y-3">
              {topCustomers.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-ps-surface rounded-xl border border-ps-border">
                  <span className="font-display text-2xl" style={{ color: DEVICE_COLORS[i] }}>
                    {['١', '٢', '٣'][i]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{c.name}</p>
                    <p className="text-xs text-ps-muted">{c.total_hours} ساعة • {c.session_count} جلسة</p>
                  </div>
                  <p className="font-mono font-bold text-ps-gold text-sm">{c.total_spent} جنيه</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top games */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Gamepad2 size={16} className="text-ps-green" />
            <h2 className="font-semibold text-sm">أكثر الألعاب لعباً (هذا الشهر)</h2>
          </div>
          {topGames.length === 0 ? (
            <p className="text-ps-muted text-sm text-center py-6">لا توجد بيانات</p>
          ) : (
            <div className="space-y-2.5">
              {topGames.map((g, i) => (
                <div key={g.game_played} className="flex items-center gap-3">
                  <span className="text-ps-muted font-mono text-xs w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{g.game_played}</span>
                      <span className="text-xs text-ps-muted">{g.play_count} مرة</span>
                    </div>
                    <div className="h-1.5 bg-ps-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(g.play_count / (topGames[0]?.play_count || 1)) * 100}%`,
                          background: DEVICE_COLORS[i % DEVICE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
