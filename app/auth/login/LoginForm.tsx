'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrorMessage('بيانات الدخول غير صحيحة، راجع الإيميل أو الباسورد يا بطل')
      } else if (error.message.includes('Email not confirmed')) {
        setErrorMessage('حسابك محتاج تأكيد من الإيميل الأول')
      } else {
        setErrorMessage('عذراً، حدث خطأ ما.. حاول تاني كمان شوية')
      }
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) return setErrorMessage('اكتب إيميلك الأول عشان نبعتلك لينك التغيير')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) setErrorMessage('فشل إرسال الرابط، تأكد من الإيميل')
    else alert('✅ شيك على إيميلك، بعتنالك لينك استعادة الباسورد')
  }

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {errorMessage && (
        <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444', padding: '12px', borderRadius: '12px', color: '#ff4444', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          {errorMessage}
        </div>
      )}

      <input 
        type="email" 
        placeholder="البريد الإلكتروني" 
        onChange={(e) => setEmail(e.target.value)} 
        required 
        style={{ width: '100%', padding: '16px', background: '#0D0D0D', border: '1px solid #1A1A1A', color: 'white', borderRadius: '12px', textAlign: 'left', direction: 'ltr' }} 
      />
      
      <div style={{ position: 'relative' }}>
        <input 
          type={showPassword ? 'text' : 'password'} 
          placeholder="كلمة المرور" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ width: '100%', padding: '16px 50px 16px 16px', background: '#0D0D0D', border: '1px solid #1A1A1A', color: 'white', borderRadius: '12px', textAlign: 'left', direction: 'ltr' }} 
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(!showPassword)} 
          style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <button 
        type="button" 
        onClick={handleForgot} 
        style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', textAlign: 'right', fontSize: '0.85rem' }}
      >
        نسيت كلمة السر؟
      </button>
      
      <button 
        type="submit" 
        disabled={loading} 
        style={{ width: '100%', padding: '16px', background: loading ? '#8A6E2F' : '#D4AF37', border: 'none', borderRadius: '12px', color: 'black', fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }}
      >
        {loading ? 'جاري التحقق...' : 'دخول للمتجر 🚀'}
      </button>
    </form>
  )
}
