'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, LogIn, KeyRound } from 'lucide-react'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      Swal.fire({ icon: 'error', title: 'عفواً', text: 'بيانات الدخول غير صحيحة', background: '#0a0a0a', color: '#fff' })
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  const handleForgot = async () => {
    if (!email) return Swal.fire({ icon: 'info', title: 'تنبيه', text: 'اكتب بريدك الإلكتروني أولاً في الخانة', background: '#0a0a0a', color: '#fff' })
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    
    if (error) {
      Swal.fire({ icon: 'error', title: 'خطأ', text: error.message, background: '#0a0a0a', color: '#fff' })
    } else {
      Swal.fire({ icon: 'success', title: 'تم الإرسال', text: 'تفقد بريدك الإلكتروني (Inbox/Spam) لتغيير كلمة السر', background: '#0a0a0a', color: '#fff' })
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#020202',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Sans Arabic',sans-serif",direction:'rtl',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:420,background:'rgba(15,15,12,0.8)',border:'1px solid rgba(212,175,55,0.1)',borderRadius:'2rem',padding:'2.5rem'}}>
        <h2 style={{color:'#fff',textAlign:'center',fontWeight:900,fontSize:'1.5rem',marginBottom:'2rem'}}>تسجيل الدخول</h2>
        <form onSubmit={handleLogin} style={{display:'grid',gap:'1.2rem'}}>
          <input required type="email" placeholder="البريد الإلكتروني" style={inputStyle} onChange={e=>setEmail(e.target.value)}/>
          <div style={{position:'relative'}}>
            <input required type={showPassword?'text':'password'} placeholder="كلمة المرور" style={inputStyle} onChange={e=>setPassword(e.target.value)}/>
            <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#666'}}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>
          </div>
          <button type="button" onClick={handleForgot} style={{background:'none',border:'none',color:'#D4AF37',fontSize:'.8rem',textAlign:'right',cursor:'pointer',fontWeight:700}}>نسيت كلمة السر؟</button>
          <button disabled={loading} type="submit" style={{padding:'1.1rem',borderRadius:'1.1rem',background:'linear-gradient(45deg,#D4AF37,#FFD700)',color:'#000',fontWeight:900,border:'none',cursor:'pointer'}}>
            {loading ? 'جارٍ التحقق...' : 'دخول للمتجر'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1.5rem',color:'#666',fontSize:'.85rem'}}>جديد في مزايا؟ <Link href="/auth/register" style={{color:'#D4AF37',textDecoration:'none',fontWeight:800}}>ابدأ الآن</Link></p>
      </div>
    </div>
  )
}
const inputStyle = { width:'100%',padding:'1rem',borderRadius:'1.1rem',background:'#080808',border:'1px solid #1a1a1a',color:'#fff',outline:'none', direction:'ltr', textAlign:'left' }
