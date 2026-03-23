'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, AlertCircle, LogIn, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const [focusField, setFocusField] = useState<string|null>(null)
  const supabase = createClient()

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErrorMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMessage(error.message.includes('Invalid') ? 'بيانات الدخول غير صحيحة يا بطل' : error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  const inputStyle = (field: string) => ({
    width:'100%', padding:'.85rem 1.1rem', borderRadius:'1rem',
    background: focusField===field ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.04)',
    border: focusField===field ? '1.5px solid rgba(212,175,55,0.45)' : '1.5px solid rgba(255,255,255,0.08)',
    color:'white', fontSize:'.9rem', outline:'none',
    boxShadow: focusField===field ? '0 0 0 4px rgba(212,175,55,0.08)' : 'none',
    transition:'all .25s ease',
    textAlign: 'left' as any,
    direction: 'ltr' as any,
  })

  if (!mounted) return null;

  return (
    <div style={{minHeight:'100vh',background:'#020202',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Sans Arabic',sans-serif",direction:'rtl',padding:'1rem',position:'relative',overflow:'hidden'}}>
       <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(212,175,55,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.02) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(ellipse at center,black 20%,transparent 70%)'}}/>
       
       <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:440}}>
          <div style={{textAlign:'center',marginBottom:'2rem', animation: 'fadeUp 0.6s ease'}}>
            <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:56,height:56,borderRadius:'1rem',background:'linear-gradient(135deg,#D4AF37,#c9a227)',boxShadow:'0 0 30px rgba(212,175,55,0.3)',marginBottom:'1rem'}}>
               <span style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1.6rem',color:'#020202'}}>م</span>
            </div>
            <h1 style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'2rem',background:'linear-gradient(135deg,#D4AF37,#f5e070,#D4AF37)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>MAZAYA</h1>
          </div>

          <div style={{background:'rgba(10,10,8,0.75)',backdropFilter:'blur(24px)',border:'1px solid rgba(212,175,55,0.15)',borderRadius:'1.75rem',padding:'2rem',boxShadow:'0 24px 60px rgba(0,0,0,0.6)'}}>
            <h2 style={{fontFamily:'Tajawal,sans-serif',fontWeight:800,color:'white',fontSize:'1.2rem',textAlign:'center',marginBottom:'.3rem'}}>تسجيل الدخول</h2>
            <p style={{color:'rgba(255,255,255,0.25)',fontSize:'.8rem',textAlign:'center',marginBottom:'1.75rem'}}>أهلاً بك مرة أخرى في متجرك</p>

            <form onSubmit={handleLogin} style={{display:'grid',gap:'1rem'}}>
              <div>
                <label style={{display:'block',fontSize:'.75rem',color:'rgba(255,255,255,0.4)',marginBottom:'.4rem', textAlign:'right'}}>البريد الإلكتروني</label>
                <input style={inputStyle('email')} type="email" placeholder="example@email.com" onChange={e=>setEmail(e.target.value)} onFocus={()=>setFocusField('email')} onBlur={()=>setFocusField(null)} required/>
              </div>

              <div>
                <label style={{display:'block',fontSize:'.75rem',color:'rgba(255,255,255,0.4)',marginBottom:'.4rem', textAlign:'right'}}>كلمة المرور</label>
                <div style={{position:'relative'}}>
                  <input style={{...inputStyle('pass'),paddingRight:'3rem'}} type={showPassword?'text':'password'} placeholder="••••••••" onChange={e=>setPassword(e.target.value)} onFocus={()=>setFocusField('pass')} onBlur={()=>setFocusField(null)} required/>
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} style={{position:'absolute',right:'1rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer'}}>
                    {showPassword?<EyeOff size={15}/>:<Eye size={15}/>}
                  </button>
                </div>
              </div>

              {errorMessage && <div style={{padding:'.7rem 1rem',borderRadius:'.85rem',background:'rgba(231,76,60,0.1)',border:'1px solid rgba(231,76,60,0.2)',color:'#e74c3c',fontSize:'.8rem', textAlign:'right'}}>⚠️ {errorMessage}</div>}

              <button type="submit" disabled={loading} style={{padding:'1rem',borderRadius:'1rem',border:'none',background:loading?'rgba(212,175,55,0.5)':'linear-gradient(135deg,#D4AF37,#f0d060,#c9a227)',color:'#020202',fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1rem',cursor:loading?'default':'pointer',boxShadow:'0 4px 24px rgba(212,175,55,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:'.5rem', marginTop:'.5rem'}}>
                {loading?<div style={{width:18,height:18,border:'2px solid rgba(0,0,0,0.2)',borderTopColor:'#020202',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>:<><LogIn size={17}/> دخول للمتجر</>}
              </button>
            </form>

            <div style={{textAlign:'center',marginTop:'1.25rem', display:'flex', flexDirection:'column', gap:'10px'}}>
               <Link href="/auth/register" style={{color:'#D4AF37',fontWeight:700,textDecoration:'none', fontSize:'.85rem'}}>إنشاء حساب جديد</Link>
               <button onClick={() => alert('تواصل مع الدعم لاستعادة الحساب')} style={{background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:'.75rem', cursor:'pointer'}}>نسيت كلمة السر؟</button>
            </div>
          </div>
       </div>
    </div>
  )
}
