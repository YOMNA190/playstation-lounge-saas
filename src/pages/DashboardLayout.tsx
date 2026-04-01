import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import {
  Gamepad2, LayoutGrid, BarChart3, Users, Receipt,
  ClipboardList, LogOut, Menu, X, ShieldCheck, User
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/',          label: 'الأجهزة',    icon: LayoutGrid,    end: true   },
  { to: '/sessions',  label: 'الجلسات',    icon: ClipboardList              },
  { to: '/customers', label: 'العملاء',    icon: Users                      },
  { to: '/analytics', label: 'التحليلات',  icon: BarChart3,   adminOnly: true },
  { to: '/expenses',  label: 'المصاريف',   icon: Receipt,     adminOnly: true },
]

export default function DashboardLayout() {
  const { profile, isAdmin, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const visibleNav = navItems.filter(item => !item.adminOnly || isAdmin)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-ps-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ps-blue/10 border border-ps-blue/30 rounded-xl flex items-center justify-center">
            <Gamepad2 size={22} className="text-ps-blue-light" />
          </div>
          <div>
            <p className="font-display text-xl tracking-wider text-ps-text">PS LOUNGE</p>
            <p className="text-xs text-ps-muted">Management System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-ps-blue/15 text-ps-blue-light border border-ps-blue/20'
                : 'text-ps-muted hover:text-ps-text hover:bg-ps-border'
            )}
          >
            <item.icon size={18} />
            {item.label}
            {item.adminOnly && (
              <span className="mr-auto">
                <ShieldCheck size={13} className="text-ps-gold opacity-60" />
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-4 border-t border-ps-border">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-ps-surface mb-2">
          <div className="w-8 h-8 rounded-full bg-ps-blue/20 border border-ps-blue/30 flex items-center justify-center flex-shrink-0">
            <User size={14} className="text-ps-blue-light" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ps-text truncate">{profile?.name || 'مستخدم'}</p>
            <p className="text-xs text-ps-muted">{isAdmin ? '👑 أدمن' : '🎮 موظف'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2.5 text-ps-muted hover:text-ps-red text-sm rounded-xl hover:bg-ps-red/5 transition-all duration-200"
        >
          <LogOut size={16} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-ps-card border-l border-ps-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-ps-card border-l border-ps-border flex flex-col mr-auto shadow-2xl animate-slide-up">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 left-4 btn-ghost p-2"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-ps-card border-b border-ps-border">
          <div className="flex items-center gap-2">
            <Gamepad2 size={22} className="text-ps-blue-light" />
            <span className="font-display text-xl tracking-wider">PS LOUNGE</span>
          </div>
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2">
            <Menu size={22} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
