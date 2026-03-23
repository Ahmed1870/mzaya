'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Store, Package, Users, Settings, 
  ShieldCheck, LogOut, Truck, FileText, BarChart3, 
  Wallet, Calculator, Megaphone, History, Trophy, Gift, Headset,
  Sparkles, Crown, Zap, Activity
} from 'lucide-react'

export default function Sidebar() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [plan, setPlan] = useState('تحميل...')
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function getSidebarData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase
          .from('profiles')
          .select('role, plan_name')
          .eq('id', user.id)
          .single()

        setPlan(data?.plan_name || 'مجانية')
        if (data?.role === 'admin' || user.email === 'xcm3108@gmail.com') {
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
    { name: 'المناديب', href: '/dashboard/couriers', icon: <Users size={20} /> },
    { name: 'رادار العملاء', href: '/dashboard/customers', icon: <Users size={20} /> },
    { name: 'التقارير', href: '/dashboard/reports', icon: <BarChart3 size={20} /> },
    { name: 'المحفظة', href: '/dashboard/wallet', icon: <Wallet size={20} /> },
    { name: 'حاسبة الأرباح', href: '/dashboard/calculator', icon: <Calculator size={20} /> },
    { name: 'مولد الإعلانات', href: '/dashboard/ads', icon: <Megaphone size={20} /> },
    { name: 'متجري', href: '/dashboard/store', icon: <Store size={20} /> },
    { name: 'سجل النشاط', href: '/dashboard/activity', icon: <History size={20} /> },
    { name: 'الإنجازات', href: '/dashboard/achievements', icon: <Trophy size={20} /> },
    { name: 'الإحالة 🎁', href: '/dashboard/referral', icon: <Gift size={20} /> },
    { name: 'الدعم', href: '/dashboard/support', icon: <Headset size={20} /> },
  ]

  return (
    <div style={{ width: '280px', height: '100vh', background: '#000', borderLeft: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', padding: '20px', position: 'fixed', right: 0, top: 0, overflowY: 'auto', zIndex: 1000 }}>
      
      <div style={{ marginBottom: '25px', textAlign: 'center' }}>
        <h1 style={{ color: '#D4AF37', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '4px', textShadow: '0 0 15px rgba(212, 175, 55, 0.4)' }}>MAZAYA</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '5px' }}>
          <div style={{ width: '8px', height: '8px', background: '#1ed760', borderRadius: '50%', boxShadow: '0 0 8px #1ed760' }}></div>
          <span style={{ color: '#444', fontSize: '11px', fontWeight: 'bold' }}>الرادار يعمل الآن</span>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #0a0a0a, #111)', border: '1px solid #D4AF3733', padding: '15px', borderRadius: '15px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: '#D4AF371A', padding: '8px', borderRadius: '10px' }}>
          <Crown size={20} color="#D4AF37" />
        </div>
        <div>
          <p style={{ color: '#888', fontSize: '10px', margin: 0 }}>الباقة الحالية</p>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', margin: 0 }}>{plan}</p>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', padding: '11px 15px', borderRadius: '12px', 
              color: pathname === item.href ? '#D4AF37' : '#888', 
              background: pathname === item.href ? 'linear-gradient(to left, rgba(212, 175, 55, 0.1), transparent)' : 'transparent', 
              borderRight: pathname === item.href ? '3px solid #D4AF37' : '3px solid transparent',
              cursor: 'pointer', transition: '0.3s ease'
            }}>
              <span style={{ fontSize: '0.92rem', fontWeight: pathname === item.href ? '700' : '400' }}>{item.name}</span>
              {item.icon}
            </div>
          </Link>
        ))}

        {isAdmin && (
          <Link href="/admin">
            <div style={{ 
              marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '14px', 
              borderRadius: '15px', color: 'black', background: 'linear-gradient(45deg, #D4AF37, #FBF5B7)', 
              fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)' 
            }}>
              <ShieldCheck size={18} />
              <span>رادار السوبر أدمن 📡</span>
            </div>
          </Link>
        )}
      </nav>

      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #1A1A1A' }}>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.href = '/auth/login')} 
          style={{ width: '100%', padding: '12px', background: 'rgba(255, 68, 68, 0.05)', border: '1px solid rgba(255, 68, 68, 0.1)', color: '#ff4444', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
          <LogOut size={16} /> خروج آمن
        </button>
      </div>
    </div>
  )
}
