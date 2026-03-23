'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Lock, ChevronLeft, Crown, Home } from 'lucide-react'
import Link from 'next/link'

export default function ForbiddenPage() {
  const supabase = createClient()
  const [userPlan, setUserPlan] = useState('جارِ التحقق...')

  useEffect(() => {
    async function getPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan_name').eq('id', user.id).single()
        setUserPlan(profile?.plan_name || 'مجانية')
      }
    }
    getPlan()
  }, [])

  return (
    <div style={{
      minHeight:'100vh',
      background:'radial-gradient(circle at center, #0a0a0a 0%, #020202 100%)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      fontFamily:"'IBM Plex Sans Arabic',sans-serif",
      direction:'rtl',
      padding: '20px'
    }}>
      <div style={{
        textAlign:'center',
        background: 'rgba(255,255,255,0.02)',
        padding: '3rem',
        borderRadius: '2rem',
        border: '1px solid rgba(212,175,55,0.1)',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'rgba(212,175,55,0.1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          border: '1px solid rgba(212,175,55,0.2)'
        }}>
          <Lock size={40} color="#D4AF37" />
        </div>

        <h1 style={{fontFamily:'Tajawal,sans-serif',fontWeight:900,fontSize:'2.5rem',color:'#fff',marginBottom:'.5rem'}}>
          ميزة <span style={{color: '#D4AF37'}}>محدودة</span>
        </h1>
        
        <p style={{color:'rgba(255,255,255,0.5)', marginBottom:'2rem', lineHeight: '1.6'}}>
          عذراً، باقتك الحالية <b style={{color: '#D4AF37'}}>({userPlan})</b> لا تسمح بالوصول لهذه الأدوات المتقدمة. قم بترقية حسابك لفتح كامل إمكانيات السيستم.
        </p>

        <div style={{display:'grid', gap:'1rem'}}>
          <Link href="/dashboard/subscription" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding:'1rem 2rem',
            borderRadius:'1.25rem',
            background:'linear-gradient(135deg,#D4AF37,#c9a227)',
            color:'#020202',
            fontFamily:'Tajawal,sans-serif',
            fontWeight:900,
            textDecoration:'none',
            transition: 'transform 0.2s',
            boxShadow: '0 10px 20px rgba(212,175,55,0.2)'
          }}>
            <Crown size={20} /> ترقية الاشتراك الآن
          </Link>

          <Link href="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding:'1rem 2rem',
            borderRadius:'1.25rem',
            background:'rgba(255,255,255,0.05)',
            color:'rgba(255,255,255,0.7)',
            fontFamily:'Tajawal,sans-serif',
            fontWeight:700,
            textDecoration:'none',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Home size={18} /> العودة للرئيسية
          </Link>
        </div>

        <div style={{marginTop: '2rem', fontSize: '.8rem', color: 'rgba(212,175,55,0.4)'}}>
          كود الخطأ: 403 Forbidden Access
        </div>
      </div>
    </div>
  )
}
