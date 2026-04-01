import { useDevices } from '@/hooks/useDevices'
import { useAuth } from '@/lib/auth-context'
import DeviceCard from '@/components/devices/DeviceCard'
import { useDashboard } from '@/hooks/useDashboard'
import { TrendingUp, Wallet, Activity, Coins } from 'lucide-react'

export default function DevicesPage() {
  const { devices, loading, refetch } = useDevices()
  const { isAdmin }  = useAuth()
  const { summary }  = useDashboard()

  const activeCount = devices.filter(d => d.active_session).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-ps-muted text-sm mt-0.5">
            {activeCount} جهاز نشط من أصل {devices.length}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-ps-green/10 border border-ps-green/20 rounded-xl px-3 py-2">
          <span className="w-2 h-2 bg-ps-green rounded-full animate-pulse" />
          <span className="text-ps-green text-sm font-medium">Realtime</span>
        </div>
      </div>

      {/* Admin stats */}
      {isAdmin && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="إيرادات اليوم"
            value={`${summary.revenue_today.toLocaleString()} جنيه`}
            icon={<Coins size={18} />}
            color="text-ps-gold"
            bg="bg-ps-gold/10"
          />
          <StatCard
            label="الإيرادات الشهرية"
            value={`${summary.gross_revenue.toLocaleString()} جنيه`}
            icon={<TrendingUp size={18} />}
            color="text-ps-blue-light"
            bg="bg-ps-blue/10"
          />
          <StatCard
            label="صافي الربح"
            value={`${summary.net_profit.toLocaleString()} جنيه`}
            icon={<Wallet size={18} />}
            color={summary.net_profit >= 0 ? 'text-ps-green' : 'text-ps-red'}
            bg={summary.net_profit >= 0 ? 'bg-ps-green/10' : 'bg-ps-red/10'}
          />
          <StatCard
            label="جلسات اليوم"
            value={`${summary.total_sessions_today} جلسة`}
            icon={<Activity size={18} />}
            color="text-ps-purple"
            bg="bg-ps-purple/10"
          />
        </div>
      )}

      {/* Devices grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="card h-52 animate-pulse bg-ps-surface" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {devices.map(device => (
            <DeviceCard key={device.id} device={device} onUpdate={refetch} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color, bg }: {
  label: string; value: string; icon: React.ReactNode; color: string; bg: string
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <p className="text-ps-muted text-xs">{label}</p>
      </div>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
    </div>
  )
}
