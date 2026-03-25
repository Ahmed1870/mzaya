'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { 
  ShieldCheck, Users, Package, TrendingUp, CreditCard, 
  Award, ArrowRight, Clock, Store, Activity, Zap
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ 
    traders: 0, products: 0, revenue: 0, pendingRequests: 0 
  })
  const [recentTraders, setRecentTraders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMirrorData() {
      setLoading(true)
      // 1. جلب الأرقام الأساسية
      const { count: t } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: p } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { data: rev } = await supabase.from('subscriptions_requests').select('amount').eq('status', 'approved');
      const { count: pending } = await supabase.from('subscriptions_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      const totalRev = rev?.reduce((acc, curr) => {
        const val = parseFloat(curr.amount.replace(/[^0-9.]/g, '')) || 0;
        return acc + val;
      }, 0) || 0;

      // 2. جلب آخر 5 تجار انضموا للموقع (مرايا النشاط)
      const { data: recent } = await supabase
        .from('profiles')
        .select('shop_name, created_at, plan_name')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({ 
        traders: t || 0, 
        products: p || 0, 
        revenue: totalRev, 
        pendingRequests: pending || 0 
      });
      setRecentTraders(recent || []);
      setLoading(false);
    }
    fetchMirrorData()
  }, [])

  return (
    <div style={{ background: '#020202', color: '#d4af37', minHeight: '100vh', padding: '30px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: 'rgba(212, 175, 55, 0.05)', padding: '10px 25px', borderRadius: '50px', border: '1px solid #d4af3733' }}>
          <ShieldCheck size={30} />
          <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>رادار عمليات مـزايـا</h1>
          <div style={{ width: '8px', height: '8px', background: '#1ed760', borderRadius: '50%', boxShadow: '0 0 10px #1ed760' }}></div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto 40px auto' }}>
        <div style={statCard}><Users color="#3b82f6" /> <small>إجمالي التجار</small> <h3>{stats.traders}</h3></div>
        <div style={statCard}><Package color="#2ecc71" /> <small>قطع البضاعة</small> <h3>{stats.products}</h3></div>
        <div style={statCard}><TrendingUp color="#f1c40f" /> <small>أرباح التفعيل</small> <h3>{stats.revenue} <span style={{fontSize:'12px'}}>EGP</span></h3></div>
        <div style={{...statCard, border:'1px solid #ff444433'}}><Clock color="#ff4444" /> <small>طلبات معلقة</small> <h3 style={{color:'#ff4444'}}>{stats.pendingRequests}</h3></div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        
        {/* Left Column: Recent Activity & Actions */}
        <div>
          <h2 style={sectionTitle}><Zap size={20}/> إجراءات سريعة</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
            <Link href="/admin/subscriptions" style={{ textDecoration: 'none' }}>
              <div style={actionCard}><CreditCard /> <span>تفعيل الاشتراكات</span> <ArrowRight size={16}/></div>
            </Link>
            <Link href="/admin/subscriptions" style={{ textDecoration: 'none' }}>
              <div style={actionCard}><Award /> <span>توزيع المكافآت</span> <ArrowRight size={16}/></div>
            </Link>
          </div>

          <h2 style={sectionTitle}><Activity size={20}/> رادار الانضمام الحديث</h2>
          <div style={listContainer}>
            {recentTraders.map((trader, i) => (
              <div key={i} style={listItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={avatarStyle}>{trader.shop_name[0]}</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 'bold' }}>{trader.shop_name}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>باقة: {trader.plan_name}</div>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#444' }}>{new Date(trader.created_at).toLocaleDateString('ar-EG')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: System Status */}
        <div style={sidePanel}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Store size={18}/> حالة النظام</h3>
          <div style={statusItem}><span>قاعدة البيانات</span> <span style={{color:'#1ed760'}}>متصلة</span></div>
          <div style={statusItem}><span>سيرفر الصور</span> <span style={{color:'#1ed760'}}>يعمل</span></div>
          <div style={statusItem}><span>بوابة الدفع</span> <span style={{color:'#f1c40f'}}>يدوي</span></div>
          <div style={{ marginTop: '30px', padding: '15px', background: '#d4af3711', borderRadius: '15px', border: '1px solid #d4af3722' }}>
            <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>نصيحة الإدارة:</p>
            <p style={{ fontSize: '12px', color: '#d4af37', margin: '5px 0 0 0' }}>راجع طلبات التحويل البنكي يومياً لضمان رضا التجار.</p>
          </div>
        </div>

      </div>
    </div>
  )
}

const statCard = { background: '#111', padding: '20px', borderRadius: '20px', border: '1px solid #222', textAlign: 'center' as any };
const sectionTitle = { fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' };
const actionCard = { background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px', color: '#d4af37', transition: '0.3s' };
const listContainer = { background: '#0a0a0a', borderRadius: '20px', border: '1px solid #222', overflow: 'hidden' };
const listItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #111' };
const avatarStyle = { width: '35px', height: '35px', background: '#d4af37', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' };
const sidePanel = { background: '#0a0a0a', padding: '20px', borderRadius: '25px', border: '1px solid #222', height: 'fit-content' };
const statusItem = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #111', fontSize: '13px' };
