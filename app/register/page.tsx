'use client'
import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react'
import Swal from 'sweetalert2'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [form, setForm] = useState({ full_name: '', shop_name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const ref = searchParams.get('ref')
    if (ref) localStorage.setItem('mazaya_referrer', ref)
  }, [searchParams])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 6) {
      return Swal.fire({ icon: 'error', title: 'كلمة السر ضعيفة', text: 'يجب أن تكون 6 أحرف على الأقل', background: '#0a0a0a', color: '#fff' })
    }

    setLoading(true)
    
    // فحص أمان: هل البريد موجود مسبقاً؟
    const { data: existing } = await supabase.from('profiles').select('id').eq('email', form.email).maybeSingle()
    
    if (existing) {
      setLoading(false)
      return Swal.fire({ icon: 'warning', title: 'عفواً يا بطل', text: 'هذا البريد مسجل بالفعل، جرب تسجيل الدخول', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#D4AF37' })
    }

    const referrerId = localStorage.getItem('mazaya_referrer')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { 
        data: { full_name: form.full_name, shop_name: form.shop_name, referrer_id: referrerId },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      Swal.fire({ icon: 'error', title: 'فشل التسجيل', text: error.message, background: '#0a0a0a', color: '#fff' })
      setLoading(false)
    } else {
      localStorage.removeItem('mazaya_referrer')
      Swal.fire({
        icon: 'success',
        title: 'أهلاً بك في عائلة مزايا',
        text: 'تم إرسال رابط التفعيل لبريدك الإلكتروني، افحصه الآن',
        background: '#0a0a0a',
        color: '#fff',
        confirmButtonColor: '#D4AF37'
      }).then(() => router.push('/auth/login'))
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#020202',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'IBM Plex Sans Arabic',sans-serif",direction:'rtl',padding:'1rem',position:'relative'}}>
        <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(212,175,55,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>
        <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:420, opacity: mounted ? 1 : 0, transition: '0.8s'}}>
          <div style={{textAlign:'center',marginBottom:'2rem'}}>
            <div style={{width:60,height:60,borderRadius:'1.2rem',background:'linear-gradient(135deg,#D4AF37,#997a1d)',margin:'0 auto 1rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(212,175,55,0.2)'}}>
              <ShieldCheck size={30} color="#020202" />
            </div>
            <h1 style={{fontSize:'2.2rem',fontWeight:900,color:'#D4AF37',letterSpacing:'1px'}}>MAZAYA</h1>
          </div>
          
          <div style={{background:'rgba(15,15,12,0.8)',backdropFilter:'blur(20px)',border:'1px solid rgba(212,175,55,0.1)',borderRadius:'2rem',padding:'2rem'}}>
            <form onSubmit={handleRegister} style={{display:'grid',gap:'1.2rem'}}>
               <input required placeholder="الاسم الكامل" style={inputStyle} onChange={e=>setForm({...form,full_name:e.target.value})}/>
               <input required placeholder="اسم المتجر" style={inputStyle} onChange={e=>setForm({...form,shop_name:e.target.value})}/>
               <input required type="email" placeholder="البريد الإلكتروني" style={{...inputStyle, direction:'ltr', textAlign:'left'}} onChange={e=>setForm({...form,email:e.target.value})}/>
               <div style={{position:'relative'}}>
                 <input required type={showPass?'text':'password'} placeholder="كلمة المرور (6+ أحرف)" style={{...inputStyle, direction:'ltr', textAlign:'left'}} onChange={e=>setForm({...form,password:e.target.value})}/>
                 <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#666'}}>{showPass?<EyeOff size={18}/>:<Eye size={18}/>}</button>
               </div>
               <button disabled={loading} type="submit" style={{padding:'1.1rem',borderRadius:'1.1rem',background:'linear-gradient(45deg,#D4AF37,#FFD700)',color:'#000',fontWeight:900,fontSize:'1rem',border:'none',cursor:'pointer',boxShadow:'0 10px 20px rgba(212,175,55,0.2)'}}>
                 {loading ? 'جارٍ التأمين...' : 'إنشاء حساب احترافي'}
               </button>
            </form>
            <p style={{textAlign:'center',marginTop:'1.5rem',color:'#666',fontSize:'.85rem'}}>لديك حساب؟ <Link href="/auth/login" style={{color:'#D4AF37',textDecoration:'none',fontWeight:800}}>دخول</Link></p>
          </div>
        </div>
    </div>
  )
}
const inputStyle = { width:'100%',padding:'1rem',borderRadius:'1.1rem',background:'#080808',border:'1px solid #1a1a1a',color:'#fff',outline:'none' }
export default function RegisterPage() { return <Suspense fallback={null}><RegisterContent/></Suspense> }
