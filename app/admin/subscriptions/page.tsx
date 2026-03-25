'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, Users, Package, Wallet, Clock, CreditCard, Award, Star } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SuperAdminRadar() {
  const [requests, setRequests] = useState<any[]>([])
  const [referralRequests, setReferralRequests] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'money' | 'referral'>('money')
  const [stats, setStats] = useState({ traders: 0, products: 0, revenue: 0 })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const loadAllData = async () => {
    setLoading(true)
    try {
      const { count: t } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: p } = await supabase.from('products').select('*', { count: 'exact', head: true })
      const { data: rev } = await supabase.from('subscriptions_requests').select('amount').eq('status', 'approved')
      const totalRev = rev?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
      setStats({ traders: t || 0, products: p || 0, revenue: totalRev })

      const { data: reqs } = await supabase
        .from('subscriptions_requests')
        .select('*, profiles:user_id(shop_name)')
        .order('created_at', { ascending: false })
      setRequests(reqs || [])

      // جلب الإحالات (تأكد من وجود عمود referrer_id في الـ profiles)
      const { data: allProfiles } = await supabase.from('profiles').select('id, shop_name, plan_name')
      
      // حسبة بسيطة لو مفيش View جاهز
      const eligible = []
      for (const prof of allProfiles || []) {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referrer_id', prof.id)
        if (count && count >= 5) {
          eligible.push({ ...prof, referral_count: count })
        }
      }
      setReferralRequests(eligible.filter(p => p.plan_name === 'مجانية' || p.plan_name === 'free'))
    } catch (err) {
      console.error("Error loading admin data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAllData() }, [])

  const handleActivate = async (req: any) => {
    const { isConfirmed } = await Swal.fire({
      title: 'تأكيد التفعيل المالي',
      text: `تفعيل باقة ${req.plan_name} لمتجر ${req.profiles?.shop_name}؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، فعل الحساب',
      background: '#050505', color: '#fff'
    })

    if (isConfirmed) {
      // 1. نجيب تفاصيل الباقة (المخزن والحدود)
      const { data: planInfo } = await supabase.from('subscription_plans').select('max_products').eq('plan_id', req.plan_name).single()
      
      // 2. تحديث الطلب
      await supabase.from('subscriptions_requests').update({ status: 'approved' }).eq('id', req.id)
      
      // 3. تحديث البروفايل (الباقة + الليميت)
      await supabase.from('profiles').update({ 
        plan_name: req.plan_name, 
        max_products: planInfo?.max_products || 50,
        subscription_status: 'active',
        upgrade_requested: false,
        updated_at: new Date().toISOString() 
      }).eq('id', req.user_id)

      Swal.fire({ icon: 'success', title: 'تم التفعيل وترقية الحدود ✅', background: '#050505', color: '#fff' })
      loadAllData()
    }
  }

  return (
    <div style={{ background: '#050505', color: '#d4af37', minHeight: '100vh', padding: '25px', direction: 'rtl' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={30}/> رادار التحكم الفائق</h1>
      {loading ? <p>جاري فحص الشبكة...</p> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', margin: '20px 0' }}>
            <div style={sCard}><Users/> {stats.traders} تاجر</div>
            <div style={sCard}><Package/> {stats.products} منتج</div>
            <div style={sCard}><Wallet/> {stats.revenue} ج.م</div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('money')} style={{...tabBtn, background: activeTab === 'money' ? '#d4af37' : '#111'}}>طلبات مالية</button>
            <button onClick={() => setActiveTab('referral')} style={{...tabBtn, background: activeTab === 'referral' ? '#d4af37' : '#111'}}>مكافآت ({referralRequests.length})</button>
          </div>

          <div style={listContainer}>
            {activeTab === 'money' ? requests.map(req => (
              <div key={req.id} style={reqItem}>
                <span>{req.profiles?.shop_name} ({req.plan_name})</span>
                {req.status === 'pending' ? <button onClick={() => handleActivate(req)} style={actBtn}>تفعيل</button> : <span>✅</span>}
              </div>
            )) : referralRequests.map(u => (
              <div key={u.id} style={reqItem}>
                <span>{u.shop_name} - {u.referral_count} إحالة</span>
                <button onClick={() => handleActivate({user_id: u.id, plan_name: 'احترافية', profiles: u})} style={actBtn}>ترقية مجانية</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const sCard: React.CSSProperties = { background: '#111', padding: '15px', borderRadius: '15px', border: '1px solid #222', display:'flex', flexDirection:'column', alignItems:'center' }
const listContainer = { background: '#111', borderRadius: '20px', padding: '10px' }
const reqItem = { display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #222' }
const actBtn = { background: '#d4af37', color: '#000', border: 'none', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer' }
const tabBtn = { flex: 1, padding: '10px', borderRadius: '10px', color: '#fff', cursor: 'pointer' }
