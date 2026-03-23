'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Search, User, Phone, MapPin, Crown, ShieldAlert, Star, Filter, RefreshCw, Lock } from 'lucide-react'
import Link from 'next/link'
import Swal from 'sweetalert2'

export default function CRMPage() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [plan, setPlan] = useState('free')
  
  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profile }, { data: inv }] = await Promise.all([
      supabase.from('profiles').select('plan_name').eq('id', user.id).single(),
      supabase.from('invoices').select('*').eq('user_id', user.id)
    ])

    setPlan(profile?.plan_name || 'free')

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
      tier: c.returns > 1 ? 'risk' : c.orders >= 5 ? 'gold' : c.orders >= 2 ? 'silver' : 'bronze'
    })).sort((a, b) => b.spent - a.spent)

    setCustomers(list)
    setFiltered(list)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    let res = customers.filter(c => 
      (c.name?.includes(search) || c.phone?.includes(search)) &&
      (tierFilter === 'all' || c.tier === tierFilter)
    )
    setFiltered(res)
  }, [search, tierFilter, customers])

  const TIERS: any = {
    gold: { label: 'ذهبي', color: '#D4AF37', icon: <Star size={14} fill="#D4AF37"/>, bg: 'rgba(212,175,55,0.1)' },
    silver: { label: 'فضي', color: '#9ca3af', icon: <Crown size={14}/>, bg: 'rgba(156,163,175,0.1)' },
    bronze: { label: 'برونزي', color: '#cd7f32', icon: <User size={14}/>, bg: 'rgba(205,127,50,0.1)' },
    risk: { label: 'مخاطرة', color: '#e74c3c', icon: <ShieldAlert size={14}/>, bg: 'rgba(231,76,60,0.1)' }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>👥 رادار العملاء</h1>
          <p style={{ color: '#444', fontSize: '0.85rem' }}>تحليل سلوك {customers.length} عميل مرصود</p>
        </div>
        {plan === 'free' && (
          <Link href="/dashboard/subscription" style={{ background: 'linear-gradient(45deg, #D4AF37, #f0d060)', color: '#000', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 800, textDecoration: 'none', fontSize: '0.8rem' }}>
            ترقية الرادار 🚀
          </Link>
        )}
      </header>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
          <input placeholder="ابحث بالاسم أو الرقم..." style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '0.8rem 2.5rem 0.8rem 1rem', borderRadius: '12px', color: '#fff' }} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{ background: '#111', color: '#fff', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px' }}>
          <option value="all">كل الفئات</option>
          <option value="gold">الذهبيين</option>
          <option value="risk">المخاطرة</option>
        </select>
      </div>

      {/* List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.map((c, i) => (
          <div key={i} style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: `1px solid ${TIERS[c.tier].bg}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: TIERS[c.tier].bg, color: TIERS[c.tier].color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                {c.name?.[0] || 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{c.name}</h3>
                  <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '20px', background: TIERS[c.tier].bg, color: TIERS[c.tier].color, border: `1px solid ${TIERS[c.tier].color}40` }}>
                    {TIERS[c.tier].icon} {TIERS[c.tier].label}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#444' }}><Phone size={10}/> {c.phone}</p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 900, color: '#2ecc71' }}>{formatPrice(c.spent)}</p>
              <p style={{ fontSize: '0.65rem', color: '#444' }}>{c.orders} طلبات</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
