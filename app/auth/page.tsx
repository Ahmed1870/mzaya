'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [refCode, setRefCode] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setRefCode(params.get('ref'))
  }, [])

  const handleForgot = async () => {
    if (!email) return alert('اكتب بريدك الإلكتروني أولاً')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) alert(error.message)
    else alert('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك!')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: fullName, referred_by: refCode } }
      })
      if (error) alert(error.message)
      else alert('تم التسجيل بنجاح!')
    }
  }

  return (
    <div style={{ background: '#020202', minHeight: '100vh', color: 'white', padding: '40px' }}>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto', background: '#0A0A0A', padding: '30px', borderRadius: '20px', border: '1px solid #D4AF37' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{isLogin ? 'تسجيل الدخول' : 'انضم لمزايا'}</h2>
        
        {!isLogin && <input type="text" placeholder="الاسم الكامل" onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', background: '#111', color: 'white', border: '1px solid #333' }} />}
        
        <input type="email" placeholder="البريد الإلكتروني" onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', background: '#111', color: 'white', border: '1px solid #333' }} required />
        
        {isLogin && (
          <div style={{ textAlign: 'left', marginBottom: '5px' }}>
            <button type="button" onClick={handleForgot} style={{ background: 'none', border: 'none', color: '#D4AF37', cursor: 'pointer', fontSize: '0.8rem' }}>هل نسيت كلمة السر؟</button>
          </div>
        )}

        <input type="password" placeholder="كلمة المرور" onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '10px', background: '#111', color: 'white', border: '1px solid #333' }} required />
        
        <button type="submit" style={{ width: '100%', padding: '14px', background: '#D4AF37', border: 'none', borderRadius: '12px', color: 'black', fontWeight: 900 }}>
          {isLogin ? 'دخول' : 'إنشاء حساب'}
        </button>

        <p onClick={() => setIsLogin(!isLogin)} style={{ textAlign: 'center', marginTop: '20px', cursor: 'pointer', color: '#888' }}>
          {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ دخول'}
        </p>
      </form>
    </div>
  )
}
