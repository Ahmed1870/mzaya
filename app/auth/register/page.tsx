'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', shop_name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusField, setFocusField] = useState<string|null>(null)

  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { full_name: form.full_name, shop_name: form.shop_name } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else setSuccess(true)
  }

  const inputStyle = (field: string) => ({
    width:'100%', padding:'.85rem 1.1rem', borderRadius:'1rem',
    background: focusField===field ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.04)',
    border: focusField===field ? '1.5px solid rgba(212,175,55,0.45)' : '1.5px solid rgba(255,255,255,0.08)',
    color:'white', fontSize:'.9rem', outline:'none',
    fontFamily:"'IBM Plex Sans Arabic',sans-serif",
    boxShadow: focusField===field ? '0 0 0 4px rgba(212,175,55,0.08)' : 'none',
    transform: focusField===field ? 'scale(1.01)' : 'scale(1)',
    transition:'all .25s cubic-bezier(0.34,1.56,0.64,1)',
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Tajawal:wght@700;800;900&display=swap');
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div style={{minHeight:'100vh',background:'#020202',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Sans Arabic',sans-serif",direction:'rtl',padding:'1rem',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(212,175,55,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.02) 1px,transparent 1px)',backgroundSize:'60px 60px',maskImage:'radial-gradient(ellipse at center,black 20%,transparent 70%)'}}/>
        <div style={{position:'absolute',top:'20%',left:'10%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,175,55,0.05),transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'20%',right:'10%',width:300,height:300,borderRadius:'50%',background:'radial-gradient(circle,rgba(212,175,55,0.04),transparent 70%)',pointerEvents:'none'}}/>

        <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:440}}>
          {success ? (
            <div style={{background:'rgba(10,10,8,0.75)',backdropFilter:'blur(24px)',border:'1px solid rgba(212,175,55,0.15)',borderRadius:'1.75rem',padding:'2.5rem',textAlign:'center',animation:'fadeUp .5s ease'}}>
              <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>✉️</div>
              <h2 style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,color:'#D4AF37',fontSize:'1.3rem',marginBottom:'.5rem'}}>تم إنشاء حسابك!</h2>
              <p style={{color:'rgba(255,255,255,0.4)',fontSize:'.875rem',marginBottom:'1.5rem'}}>تحقق من بريدك الإلكتروني لتفعيل الحساب</p>
              <Link href="/auth/login" style={{display:'inline-flex',alignItems:'center',gap:'.5rem',padding:'.85rem 2rem',borderRadius:'1rem',background:'linear-gradient(135deg,#D4AF37,#c9a227)',color:'#020202',fontFamily:'Tajawal,sans-serif',fontWeight:900,textDecoration:'none',fontSize:'.9rem'}}>
                تسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <div style={{textAlign:'center',marginBottom:'2rem',opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(-20px)',transition:'all .6s ease'}}>
                <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:56,height:56,borderRadius:'1rem',background:'linear-gradient(135deg,#D4AF37,#c9a227)',boxShadow:'0 0 30px rgba(212,175,55,0.3)',marginBottom:'1rem'}}>
                  <span style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1.6rem',color:'#020202'}}>م</span>
                </div>
                <h1 style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'2rem',background:'linear-gradient(135deg,#D4AF37,#f5e070,#D4AF37)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'3px',margin:0,animation:'shimmer 3s linear infinite'}}>MAZAYA</h1>
                <p style={{color:'rgba(212,175,55,0.4)',fontSize:'.75rem',letterSpacing:'2px',marginTop:'.3rem'}}>✦ انضم للمنصة ✦</p>
              </div>

              <div style={{background:'rgba(10,10,8,0.75)',backdropFilter:'blur(24px)',border:'1px solid rgba(212,175,55,0.15)',borderRadius:'1.75rem',padding:'2rem',boxShadow:'0 24px 60px rgba(0,0,0,0.6),inset 0 1px 0 rgba(212,175,55,0.08)',opacity:mounted?1:0,transform:mounted?'translateY(0)':'translateY(20px)',transition:'all .6s ease .15s',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:0,left:0,right:0,height:'1px',background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.4),transparent)'}}/>
                <h2 style={{fontFamily:'Tajawal,sans-serif',fontWeight:800,color:'white',fontSize:'1.2rem',marginBottom:'.3rem',textAlign:'center'}}>إنشاء حساب جديد</h2>
                <p style={{color:'rgba(255,255,255,0.25)',fontSize:'.8rem',textAlign:'center',marginBottom:'1.75rem'}}>ابدأ رحلتك مع مزايا مجاناً</p>

                <form onSubmit={handleRegister} style={{display:'grid',gap:'1rem'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                    <div>
                      <label style={{display:'block',fontSize:'.75rem',fontWeight:600,color:'rgba(255,255,255,0.4)',marginBottom:'.4rem'}}>اسمك *</label>
                      <input style={inputStyle('name')} placeholder="أحمد محمد" value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} onFocus={()=>setFocusField('name')} onBlur={()=>setFocusField(null)} required/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:'.75rem',fontWeight:600,color:'rgba(255,255,255,0.4)',marginBottom:'.4rem'}}>اسم المتجر *</label>
                      <input style={inputStyle('shop')} placeholder="متجر أحمد" value={form.shop_name} onChange={e=>setForm({...form,shop_name:e.target.value})} onFocus={()=>setFocusField('shop')} onBlur={()=>setFocusField(null)} required/>
                    </div>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'.75rem',fontWeight:600,color:'rgba(255,255,255,0.4)',marginBottom:'.4rem'}}>البريد الإلكتروني *</label>
                    <input style={inputStyle('email')} type="email" placeholder="example@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onFocus={()=>setFocusField('email')} onBlur={()=>setFocusField(null)} required/>
                  </div>
                  <div>
                    <label style={{display:'block',fontSize:'.75rem',fontWeight:600,color:'rgba(255,255,255,0.4)',marginBottom:'.4rem'}}>كلمة المرور *</label>
                    <div style={{position:'relative'}}>
                      <input style={{...inputStyle('pass'),paddingLeft:'3rem'}} type={showPass?'text':'password'} placeholder="٦ أحرف على الأقل" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onFocus={()=>setFocusField('pass')} onBlur={()=>setFocusField(null)} required/>
                      <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'rgba(255,255,255,0.3)',cursor:'pointer',padding:0}}>
                        {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                      </button>
                    </div>
                  </div>
                  {error && <div style={{padding:'.7rem 1rem',borderRadius:'.85rem',background:'rgba(231,76,60,0.08)',border:'1px solid rgba(231,76,60,0.2)',color:'#e74c3c',fontSize:'.8rem'}}>⚠️ {error}</div>}
                  <button type="submit" disabled={loading} style={{padding:'1rem',borderRadius:'1rem',border:'none',background:loading?'rgba(212,175,55,0.5)':'linear-gradient(135deg,#D4AF37,#f0d060,#c9a227)',backgroundSize:'200% auto',color:'#020202',fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'1rem',cursor:loading?'default':'pointer',boxShadow:loading?'none':'0 4px 24px rgba(212,175,55,0.3)',display:'flex',alignItems:'center',justifyContent:'center',gap:'.5rem',animation:loading?'none':'shimmer 2s linear infinite',marginTop:'.25rem'}}>
                    {loading?<><div style={{width:18,height:18,border:'2px solid rgba(0,0,0,0.2)',borderTopColor:'#020202',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>جاري الإنشاء...</>:<><UserPlus size={17}/> إنشاء الحساب مجاناً</>}
                  </button>
                </form>
                <p style={{textAlign:'center',marginTop:'1.25rem',color:'rgba(255,255,255,0.2)',fontSize:'.78rem'}}>
                  لديك حساب؟{' '}<Link href="/auth/login" style={{color:'#D4AF37',fontWeight:700,textDecoration:'none'}}>تسجيل الدخول</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
