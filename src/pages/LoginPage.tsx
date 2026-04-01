import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Gamepad2, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('البريد الإلكتروني أو كلمة المرور غلط')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-ps-blue/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-ps-blue-light/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#003791 1px, transparent 1px), linear-gradient(90deg, #003791 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-ps-blue/10 border border-ps-blue/30 rounded-2xl mb-4 animate-glow">
            <Gamepad2 size={40} className="text-ps-blue-light" />
          </div>
          <h1 className="font-display text-5xl text-ps-text tracking-wider">PS LOUNGE</h1>
          <p className="text-ps-muted mt-1 text-sm">نظام إدارة قاعة البلايستيشن</p>
        </div>

        {/* Form card */}
        <div className="card p-8 shadow-2xl shadow-black/50">
          <h2 className="text-xl font-semibold mb-6">تسجيل الدخول</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">البريد الإلكتروني</label>
              <input
                type="email"
                className="input"
                placeholder="admin@lounge.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                dir="ltr"
              />
            </div>

            <div>
              <label className="label">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ps-muted hover:text-ps-text transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-ps-red/10 border border-ps-red/20 text-ps-red rounded-xl px-4 py-3 text-sm animate-slide-up">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2 h-12 text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الدخول...
                </span>
              ) : 'دخول'}
            </button>
          </form>
        </div>

        <p className="text-center text-ps-muted text-xs mt-6">
          PlayStation Lounge Manager v2.0 — Powered by Supabase
        </p>
      </div>
    </div>
  )
}
