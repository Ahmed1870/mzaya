'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Package, Truck, Sparkles, FileText, Bike, Users, 
  BarChart2, Wallet, Calculator, Megaphone, Store, Shield, Trophy, 
  Gift, Headphones, LogOut, Menu, X, ShieldCheck 
} from 'lucide-react'
import { createClient } from '@/lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'المنتجات', icon: Package },
  { href: '/dashboard/orders', label: 'الأوردرات', icon: Truck },
  { href: '/dashboard/subscription', label: 'باقات الاشتراك 💎', icon: Sparkles },
  { href: '/dashboard/invoices', label: 'الفواتير', icon: FileText },
  { href: '/dashboard/couriers', label: 'المناديب', icon: Bike },
  { href: '/dashboard/crm', label: 'رادار العملاء', icon: Users },
  { href: '/dashboard/analytics', label: 'التقارير', icon: BarChart2 },
  { href: '/dashboard/wallet', label: 'المحفظة', icon: Wallet },
  { href: '/dashboard/calculator', label: 'حاسبة الأرباح', icon: Calculator },
  { href: '/dashboard/ads', label: 'مولد الإعلانات', icon: Megaphone },
  { href: '/dashboard/store', label: 'متجري', icon: Store },
  { href: '/dashboard/logs', label: 'سجل النشاط', icon: Shield },
  { href: '/dashboard/achievements', label: 'الإنجازات', icon: Trophy },
  { href: '/dashboard/referral', label: 'الإحالة 🎁', icon: Gift },
  { href: '/dashboard/support', label: 'الدعم', icon: Headphones },
]

export default function DashboardShell({ children, user, profile, isAdmin }: any) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(212,175,55,0.1)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '.75rem', background: 'linear-gradient(135deg,#D4AF37,#c9a227)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '.85rem', color: '#050505', flexShrink: 0 }}>م</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 900, fontSize: '.95rem', color: '#D4AF37', margin: 0 }}>MAZAYA</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{profile?.shop_name || 'لوحة التحكم'}</p>
          </div>
        </div>
      </div>
      {isAdmin && (
        <Link href="/admin" style={{ margin: '10px', padding: '10px', background: 'linear-gradient(45deg, #D4AF37, #FBF5B7)', borderRadius: '8px', color: '#000', textAlign: 'center', fontWeight: 'bold', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' }}>
          <ShieldCheck size={14} /> رادار السوبر أدمن
        </Link>
      )}
      <nav style={{ flex: 1, padding: '.6rem', display: 'grid', gap: '.1rem', alignContent: 'start', overflowY: 'auto' }}>
        {navItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} style={{ padding: '.55rem .75rem', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: isActive ? '#D4AF37' : 'rgba(255,255,255,0.6)', background: isActive ? 'rgba(212,175,55,0.05)' : 'transparent', borderRadius: '8px' }}>
              <item.icon size={13}/>
              <span style={{ fontSize: '.78rem' }}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div style={{ padding: '.6rem', borderTop: '1px solid rgba(212,175,55,0.08)', flexShrink: 0 }}>
        <button onClick={handleSignOut} style={{ color: 'rgba(192,57,43,0.7)', padding: '.55rem .75rem', width: '100%', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <LogOut size={13}/> <span style={{ fontSize: '.78rem' }}>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside style={{ width: '195px', flexShrink: 0, background: '#050505', borderLeft: '1px solid rgba(212,175,55,0.08)', position: 'sticky', top: 0, height: '100vh', display: 'none' }} className="lg:flex flex-col">
        <SidebarContent/>
      </aside>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: '#050505', borderBottom: '1px solid rgba(212,175,55,0.08)', padding: '.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }} className="lg:hidden">
            <Menu size={20}/>
          </button>
          <div style={{ fontWeight: 900, fontSize: '1rem', color: '#D4AF37' }}>MAZAYA</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             {isAdmin && <Link href="/admin" style={{ color: '#D4AF37', fontSize: '0.8rem', border: '1px solid #D4AF37', padding: '4px 12px', borderRadius: '20px', textDecoration: 'none' }}>ADMIN 📡</Link>}
             <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1A1A1A', border: '1px solid rgba(212,175,55,0.2)' }} />
          </div>
        </header>
        <main style={{ flex: 1, padding: '1.5rem', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.85)' }} onClick={() => setSidebarOpen(false)}/>
          <aside style={{ width: '210px', background: '#050505', position: 'relative', height: '100%', borderLeft: '1px solid rgba(212,175,55,0.1)' }}>
            <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', color: 'white' }}>
              <X size={20}/>
            </button>
            <SidebarContent/>
          </aside>
        </div>
      )}
    </>
  )
}
