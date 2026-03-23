'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Search, User, Phone, Star, Crown, ShieldAlert, RefreshCw, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CRMPage() {
  const supabase = createClient()
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [plan, setPlan] = useState('مجانية')
  
  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profile }, { data: inv }] = await Promise.all([
      supabase.from('profiles').select('plan_name').eq('id', user.id).single(),
      supabase.from('invoices').select('*').eq('user_id', user.id)
    ])

    const currentPlan = profile?.plan_name || 'مجانية'
    setPlan(currentPlan)

    const map: Record<string, any> = {}
    inv?.forEach((i: any) => {
      const key = i.customer_phone || i.customer_name
      if (!map[key]) {
        map[key] = { name: i.customer_name, phone: i.customer_phone, orders: 0, spent: 0, returns: 0, tier: 'bronze' }
      }
      map[key].orders++
      if (i.status === 'paid') map[key].spent += Number(i.total_amount)
      if (i.order_status === 'returned') map[key].returns++
    })

    const list = Object.values(map).map((c: any) => ({
      ...c,
      tier: c.returns > 0 ? 'risk' : c.orders >= 5 ? 'gold' : c.orders >= 2 ? 'silver' : 'bronze'
    })).sort((a, b) => b.spent - a.spent)

    setCustomers(list)
    setFiltered(list)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let res = customers.filter(c => 
      (c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)) &&
      (tierFilter === 'all' || c.tier === tierFilter)
    )
    setFiltered(res)
  }, [search, tierFilter, customers])

  const TIERS: any = {
    gold: { label: 'ذهبي', color: '#D4AF37', icon: <Star size={12} fill="#D4AF37"/>, bg: 'rgba(212,175,55,0.1)' },
    silver: { label: 'فضي', color: '#9ca3af', icon: <Crown size={12}/>, bg: 'rgba(156,163,175,0.1)' },
    bronze: { label: 'جديد', color: '#cd7f32', icon: <User size={12}/>, bg: 'rgba(205,127,50,0.1)' },
    risk: { label: 'مخاطرة', color: '#e74c3c', icon: <ShieldAlert size={12}/>, bg: 'rgba(231,76,60,0.1)' }
  }

  const isPremium = plan === 'البيزنس' || plan === 'الاحترافية'

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', direction: 'rtl' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>👥 رادار العملاء الذكي</h1>
          <p style={{ color: '#444', fontSize: '0.85rem' }}>تحليل وتحركات {customers.length} عميل مرصود</p>
        </div>
        {!isPremium && (
          <Link href="/dashboard/subscription" style={{ background: 'linear-gradient(45deg, #D4AF37, #f0d060)', color: '#000', padding: '0.7rem 1.5rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', fontSize: '0.85rem', display:'flex', alignItems:'center', gap:'8px' }}>
            <Lock size={16} /> ترقية الرادار
          </Link>
        )}
      </header>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
          <input placeholder="ابحث عن عميل..." style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '0.8rem 2.8rem 0.8rem 1rem', borderRadius: '12px', color: '#fff', outline:'none' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{ background: '#111', color: '#fff', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', outline:'none' }}>
          <option value="all">كل الفئات</option>
          <option value="gold">الذهبيين ✨</option>
          <option value="risk">المخاطرة ⚠️</option>
        </select>
      </div>

      {/* List with Plan Check */}
      <div style={{ display: 'grid', gap: '1rem', position: 'relative' }}>
        {!isPremium && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', border: '1px solid rgba(212,175,55,0.2)' }}>
            <Lock size={40} color="#D4AF37" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontWeight: 900, fontSize: '1.2rem' }}>ميزة الرادار مقفولة</h3>
            <p style={{ color: '#888', maxWidth: '300px', margin: '10px 0 20px' }}>اشترك في باقة البيزنس لتحليل سلوك عملائك ومعرفة العميل الذهبي من المخاطر.</p>
            <button onClick={() => router.push('/dashboard/subscription')} style={{ background: '#D4AF37', color: '#000', padding: '10px 25px', borderRadius: '10px', fontWeight: 900, border: 'none', cursor: 'pointer' }}>رقي حسابك الآن</button>
          </div>
        )}

        {filtered.map((c, i) => (
          <Link href={isPremium ? `/dashboard/crm/${encodeURIComponent(c.phone || c.name)}` : '#'} key={i} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#0A0A0A', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s', cursor: isPremium ? 'pointer' : 'default', opacity: isPremium ? 1 : 0.4 }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '15px', background: TIERS[c.tier].bg, color: TIERS[c.tier].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                  {c.name?.[0] || 'U'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{c.name}</h3>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '20px', background: TIERS[c.tier].bg, color: TIERS[c.tier].color, border: `1px solid ${TIERS[c.tier].color}40`, display:'flex', alignItems:'center', gap:'4px' }}>
                      {TIERS[c.tier].icon} {TIERS[c.tier].label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#444', margin: '4px 0 0' }}>{c.phone}</p>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 900, color: '#2ecc71', margin: 0 }}>{formatPrice(c.spent)}</p>
                <p style={{ fontSize: '0.7rem', color: '#444', margin: 0 }}>{c.orders} طلبات</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
