'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, Users, Package, Wallet, ArrowLeftRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ traders: 0, products: 0, revenue: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function getStats() {
      // جلب عدد التجار
      const { count: t } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      // جلب عدد المنتجات
      const { count: p } = await supabase.from('products').select('*', { count: 'exact', head: true })
      // جلب إجمالي الأرباح من الطلبات المقبولة فقط
      const { data: rev } = await supabase.from('subscriptions_requests').select('amount').eq('status', 'approved')
      
      const total = rev?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
      setStats({ traders: t || 0, products: p || 0, revenue: total })
    }
    getStats()
  }, [])

  return (
    <div style={{ background: '#020202', color: '#d4af37', minHeight: '100vh', padding: '30px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      
      {/* العنوان الرئيسي */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '32px', fontWeight: 900 }}>
          <ShieldCheck size={45} color="#d4af37" /> مركز عمليات مزايا
        </h1>
        <p style={{ color: '#666', marginTop: '10px' }}>الإحصائيات الحية لشبكة التجار والمنتجات</p>
      </div>

      {/* كروت الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={cardStyle}>
          <Users size={30} color="#3b82f6" />
          <h3 style={labelStyle}>التجار المسجلين</h3>
          <div style={valueStyle}>{stats.traders}</div>
          <div style={trendStyle}><TrendingUp size={14} /> +5% النشاط</div>
        </div>

        <div style={cardStyle}>
          <Package size={30} color="#a855f7" />
          <h3 style={labelStyle}>إجمالي المنتجات</h3>
          <div style={valueStyle}>{stats.products}</div>
          <div style={trendStyle}><TrendingUp size={14} /> نمو مستمر</div>
        </div>

        <div style={cardStyle}>
          <Wallet size={30} color="#1ed760" />
          <h3 style={labelStyle}>خزينة الأرباح</h3>
          <div style={valueStyle}>{stats.revenue} <span style={{fontSize: '14px'}}>ج.م</span></div>
          <div style={{...trendStyle, color: '#1ed760'}}>مكتمل الدفع</div>
        </div>

        {/* زر الدخول للرادار */}
        <Link href="/admin/subscriptions" style={{ textDecoration: 'none', gridColumn: '1 / -1' }}>
          <div style={radarLinkStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={iconCircle}><ArrowLeftRight size={28} color="#000" /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>دخول رادار التفعيل</h3>
                <p style={{ margin: '5px 0 0', fontSize: '13px', opacity: 0.8 }}>مراجعة طلبات التحويل وتفعيل باقات التجار يدوياً</p>
              </div>
            </div>
            <div style={statusTag}>طلبات حية</div>
          </div>
        </Link>

      </div>
    </div>
  )
}

// الستايلات
const cardStyle = {
  background: '#0a0a0a',
  padding: '30px',
  borderRadius: '25px',
  border: '1px solid #1a1a1a',
  textAlign: 'right' as const,
  position: 'relative' as const,
  transition: '0.3s'
}

const labelStyle = { color: '#666', fontSize: '14px', margin: '15px 0 5px' }
const valueStyle = { color: '#fff', fontSize: '32px', fontWeight: 900 }
const trendStyle = { color: '#3b82f6', fontSize: '12px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }

const radarLinkStyle = {
  background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
  color: '#000',
  padding: '30px',
  borderRadius: '30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
  marginTop: '20px',
  boxShadow: '0 10px 30px rgba(212,175,55,0.2)'
}

const iconCircle = {
  background: 'rgba(255,255,255,0.2)',
  padding: '12px',
  borderRadius: '18px'
}

const statusTag = {
  background: '#000',
  color: '#d4af37',
  padding: '8px 15px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 'bold' as const
}
