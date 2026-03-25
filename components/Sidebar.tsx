'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Package, Users, ShieldCheck, LogOut, Truck, FileText, BarChart3,
  Wallet, Calculator, Megaphone, History, Trophy, Gift, Headset,
  Sparkles, Crown, Lock, Store
} from 'lucide-react'
import Swal from 'sweetalert2'

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [plan, setPlan] = useState('تحميل...')
  const [permissions, setPermissions] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getSidebarData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. جلب البروفايل لمعرفة اسم الباقة
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        setProfile(prof)
        setPlan(prof?.plan_name || 'مجانية')
        
        // 2. جلب مميزات الباقة تلقائياً من جدول الـ plans
        const { data: planDetails } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('plan_id', prof?.plan_name) 
          .single()
        
        setPermissions(planDetails)

        if (prof?.role === 'admin' || user.email === 'xcm3108@gmail.com') {
          setIsAdmin(true)
        }
      }
    }
    getSidebarData()
  }, [])

  const menuItems = [
    { name: 'المنتجات', href: '/dashboard/products', icon: <Package size={20} /> },
    { name: 'الأوردرات', href: '/dashboard/orders', icon: <Truck size={20} /> },
    { name: 'الفواتير', href: '/dashboard/invoices', icon: <FileText size={20} /> },
    { name: 'باقات الاشتراك 💎', href: '/dashboard/subscription', icon: <Sparkles size={20} /> },
    { name: 'المناديب', href: '/dashboard/couriers', icon: <Users size={20} />, locked: (plan === 'مجانية') && !isAdmin },
    { name: 'رادار العملاء', href: '/dashboard/customers', icon: <Users size={20} />, locked: !permissions?.has_radar && !isAdmin },
    { name: 'التقارير', href: '/dashboard/reports', icon: <BarChart3 size={20} />, locked: !permissions?.has_advanced_reports && !isAdmin },
    { name: 'المحفظة', href: '/dashboard/wallet', icon: <Wallet size={20} /> },
    { name: 'حاسبة الأرباح', href: '/dashboard/calculator', icon: <Calculator size={20} /> },
    { name: 'مولد الإعلانات', href: '/dashboard/ads', icon: <Megaphone size={20} />, locked: !permissions?.has_ai_ads && !isAdmin },
    { name: 'متجري', href: '/dashboard/store', icon: <Store size={20} /> },
    { name: 'سجل النشاط', href: '/dashboard/activity', icon: <History size={20} /> },
    { name: 'الإنجازات', href: '/dashboard/achievements', icon: <Trophy size={20} /> },
    { name: 'الإحالة 🎁', href: '/dashboard/referral', icon: <Gift size={20} /> },
    { name: 'الدعم', href: '/dashboard/support', icon: <Headset size={20} /> },
  ]

  const handleLinkClick = (e: any, item: any) => {
    if (item.locked) {
      e.preventDefault()
      Swal.fire({
        title: 'ميزة مقفولة 🔒',
        text: `هذه الخدمة غير متاحة في باقتك الحالية (${plan}). يرجى الترقية للوصول إليها.`,
        icon: 'warning',
        background: '#000',
        color: '#fff',
        confirmButtonColor: '#D4AF37'
      })
    }
  }

  return (
    <div style={{ width: '280px', height: '100vh', background: '#000', borderLeft: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', padding: '20px', position: 'fixed', right: 0, top: 0, overflowY: 'auto', zIndex: 1000 }}>
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h1 style={{ color: '#D4AF37', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px' }}>MAZAYA</h1>
        <p style={{ color: '#444', fontSize: '11px' }}>نظام الإدارة الذكي ✨</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #111)', border: '1px solid #D4AF3733', padding: '15px', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Crown size={20} color="#D4AF37" />
        <div>
          <p style={{ color: '#888', fontSize: '10px', margin: 0 }}>الباقة الحالية</p>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>{plan}</p>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={(e) => handleLinkClick(e, item)}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '11px 15px', borderRadius: '12px',
              color: item.locked ? '#333' : (pathname === item.href ? '#D4AF37' : '#888'),
              background: pathname === item.href ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
              cursor: item.locked ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}>
              <span style={{ fontSize: '0.92rem' }}>{item.name}</span>
              {item.icon}
              {item.locked && <Lock size={12} style={{ position: 'absolute', left: '10px', color: '#444' }} />}
            </div>
          </Link>
        ))}
      </nav>

      <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/auth/login')}
        style={{ marginTop: '20px', padding: '12px', background: 'transparent', border: '1px solid #222', color: '#ff4444', borderRadius: '12px', cursor: 'pointer' }}>
        خروج آمن
      </button>
    </div>
  )
}
