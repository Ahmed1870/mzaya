'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      Swal.fire({ title: 'خطأ', text: 'بيانات الدخول غير صحيحة', icon: 'error', background: '#111', color: '#fff' })
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '1.2rem',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#fff',
    outline: 'none',
    direction: 'rtl' as const,
    textAlign: 'right' as const
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ color: '#fff', textAlign: 'center', fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem' }}>تسجيل الدخول</h2>
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.2rem' }}>
        <input required type="email" placeholder="البريد الإلكتروني" style={inputStyle} onChange={e => setEmail(e.target.value)} />
        <div style={{ position: 'relative' }}>
          <input required type={showPassword ? 'text' : 'password'} placeholder="كلمة المرور" style={inputStyle} onChange={e => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666' }}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button disabled={loading} style={{ background: '#D4AF37', color: '#000', padding: '1.2rem', borderRadius: '16px', fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {loading ? <Loader2 className="animate-spin" /> : 'دخول'}
        </button>
      </form>
    </div>
  )
}
