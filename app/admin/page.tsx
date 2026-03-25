'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, Users, Package, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ traders: 0, products: 0, revenue: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function getStats() {
      const { count: t } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: p } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { data: rev } = await supabase.from('subscriptions_requests').select('amount').eq('status', 'approved');
      const total = rev?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      setStats({ traders: t || 0, products: p || 0, revenue: total });
    }
    getStats()
  }, [])

  return (
    <div style={{ background: '#020202', color: '#d4af37', minHeight: '100vh', padding: '30px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '32px', fontWeight: 900 }}>
          <ShieldCheck size={45} color="#d4af37" /> مركز عمليات مزايا
        </h1>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{background:'#111', padding:'25px', borderRadius:'20px', border:'1px solid #333', textAlign:'center'}}>
          <Users size={30} color="#3b82f6" />
          <p>التجار المسجلين</p>
          <div style={{fontSize:'32px', fontWeight:900}}>{stats.traders}</div>
        </div>
        <div style={{background:'#111', padding:'25px', borderRadius:'20px', border:'1px solid #333', textAlign:'center'}}>
          <Package size={30} color="#2ecc71" />
          <p>إجمالي المنتجات</p>
          <div style={{fontSize:'32px', fontWeight:900}}>{stats.products}</div>
        </div>
        <div style={{background:'#111', padding:'25px', borderRadius:'20px', border:'1px solid #333', textAlign:'center'}}>
          <TrendingUp size={30} color="#f1c40f" />
          <p>إجمالي الأرباح</p>
          <div style={{fontSize:'32px', fontWeight:900}}>{stats.revenue} EGP</div>
        </div>
      </div>
    </div>
  )
}
