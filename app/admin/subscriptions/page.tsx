'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, Users, Package, Wallet, Clock, Check, Calendar, CreditCard, Award, Star, Crown } from 'lucide-react'
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
    // إحصائيات عامة
    const { count: t } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: p } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { data: rev } = await supabase.from('subscriptions_requests').select('amount').eq('status', 'approved')
    const totalRev = rev?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    setStats({ traders: t || 0, products: p || 0, revenue: totalRev })

    // 1. طلبات الاشتراك المالي
    const { data: reqs } = await supabase
      .from('subscriptions_requests')
      .select('*, profiles:user_id(shop_name)')
      .order('created_at', { ascending: false })
    setRequests(reqs || [])

    // 2. رادار الإحالات (التجار اللي جابوا 5 أو أكثر ولم يتم ترقيتهم بعد)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, shop_name, full_name, plan_type, created_at')
    
    // حسبة برمجية ذكية لجلب المستحقين فقط
    const eligible = await Promise.all((profiles || []).map(async (prof) => {
        const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referrer_id', prof.id)
        return { ...prof, referral_count: count || 0 }
    }))

    setReferralRequests(eligible.filter(p => 
        (p.referral_count >= 5 && p.plan_type === 'free') || 
        (p.referral_count >= 10 && p.plan_type === 'business')
    ))
    
    setLoading(false)
  }

  useEffect(() => { loadAllData() }, [])

  // دالة التفعيل المالي (كودك الأصلي بدون تغيير)
  const handleActivate = async (req: any) => {
    const shopName = req.profiles?.shop_name || 'تاجر جديد'
    const { isConfirmed } = await Swal.fire({
      title: 'تأكيد التفعيل المالي',
      html: `هل استلمت التحويل لتفعيل باقة <b style="color:#d4af37">${req.plan_name}</b><br>لمتجر: <b>${shopName}</b>؟`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1ed760',
      cancelButtonColor: '#d33',
      confirmButtonText: 'نعم، فعل الحساب',
      cancelButtonText: 'إلغاء',
      background: '#050505',
      color: '#fff'
    })

    if (isConfirmed) {
      const expiry = new Date(); expiry.setDate(expiry.getDate() + 30)
      await supabase.from('subscriptions_requests').update({ status: 'approved' }).eq('id', req.id)
      await supabase.from('profiles').update({ plan_type: req.plan_name }).eq('id', req.user_id)
      
      await supabase.channel(`user-updates-${req.user_id}`).send({
        type: 'broadcast',
        event: 'plan-activated',
        payload: { plan: req.plan_name, message: 'مبروك! تم تفعيل باقتك بنجاح 🚀' }
      })
      Swal.fire({ icon: 'success', title: 'تم التفعيل المالي ✅', background: '#050505', color: '#fff' })
      loadAllData()
    }
  }

  // دالة تفعيل الإحالات (الميزة الجديدة)
  const handleReferralActivate = async (user: any) => {
    const nextPlan = user.referral_count >= 10 ? 'pro' : 'business'
    const { isConfirmed } = await Swal.fire({
      title: 'تفعيل مكافأة الإحالة',
      html: `التاجر <b>${user.shop_name}</b> جاب <b>${user.referral_count}</b> إحالة.<br>ترقية إلى باقة: <b style="color:#d4af37">${nextPlan}</b>؟`,
      icon: 'star',
      showCancelButton: true,
      confirmButtonText: 'تفعيل المكافأة الآن',
      background: '#050505',
      color: '#fff'
    })

    if (isConfirmed) {
      const { error } = await supabase.from('profiles').update({ plan_type: nextPlan }).eq('id', user.id)
      if (!error) {
        await supabase.channel(`user-updates-${user.id}`).send({
          type: 'broadcast',
          event: 'plan-activated',
          payload: { plan: nextPlan, message: `مبروك! حصلت على باقة ${nextPlan} مجاناً بفضل إحالاتك 🎁` }
        })
        Swal.fire({ icon: 'success', title: 'تمت الترقية المجانية! 🎉', background: '#050505', color: '#fff' })
        loadAllData()
      }
    }
  }

  return (
    <div style={{ background: '#050505', color: '#d4af37', minHeight: '100vh', padding: '25px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}><ShieldCheck size={30}/> مركز إدارة التفعيل</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={sCard}><Users size={20}/> <p>تجار: {stats.traders}</p></div>
        <div style={sCard}><Package size={20}/> <p>بضاعة: {stats.products}</p></div>
        <div style={sCard}><Wallet size={20} color="#1ed760"/> <p>أرباح: {stats.revenue}</p></div>
      </div>

      {/* تبديل الرادار */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('money')} style={{ ...tabBtn, background: activeTab === 'money' ? '#d4af37' : '#111', color: activeTab === 'money' ? '#000' : '#fff' }}>
          <CreditCard size={18}/> اشتراكات مالية
        </button>
        <button onClick={() => setActiveTab('referral')} style={{ ...tabBtn, background: activeTab === 'referral' ? '#d4af37' : '#111', color: activeTab === 'referral' ? '#000' : '#fff' }}>
          <Award size={18}/> مكافآت الإحالات ({referralRequests.length})
        </button>
      </div>

      <div style={listContainer}>
        {activeTab === 'money' ? (
          <>
            <h3 style={sectionTitle}><Clock size={20}/> طلبات التحويل المالي</h3>
            {requests.length === 0 && <p style={emptyText}>لا يوجد طلبات مالية..</p>}
            {requests.map(req => (
              <div key={req.id} style={reqItem}>
                <div style={{flex: 1}}>
                  <div style={{color:'#fff', fontWeight:'bold'}}>{req.profiles?.shop_name}</div>
                  <div style={{fontSize:'12px', color:'#888'}}>{req.sender_number} | {req.plan_name}</div>
                </div>
                {req.status === 'pending' ? <button onClick={() => handleActivate(req)} style={actBtn}>تفعيل مالي</button> : <span style={{color:'#1ed760'}}>تم ✅</span>}
              </div>
            ))}
          </>
        ) : (
          <>
            <h3 style={sectionTitle}><Star size={20}/> تجار استحقوا الترقية المجانية</h3>
            {referralRequests.length === 0 && <p style={emptyText}>لا يوجد مستحقين حالياً..</p>}
            {referralRequests.map(user => (
              <div key={user.id} style={reqItem}>
                <div style={{flex: 1}}>
                  <div style={{color:'#fff', fontWeight:'bold'}}>{user.shop_name}</div>
                  <div style={{fontSize:'12px', color:'#d4af37'}}>عدد الإحالات الحالية: {user.referral_count} إحالة</div>
                </div>
                <button onClick={() => handleReferralActivate(user)} style={{...actBtn, background:'#fff', color:'#000'}}>
                   تفعيل {user.referral_count >= 10 ? 'احترافية' : 'بيزنس'}
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

const sCard = { background: '#111', padding: '15px', borderRadius: '15px', border: '1px solid #222', textAlign: 'center' as any }
const listContainer = { background: '#111', borderRadius: '25px', padding: '20px', border: '1px solid #d4af3733' }
const reqItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #222' }
const actBtn = { background: '#d4af37', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 'bold' as any, cursor: 'pointer' }
const tabBtn = { flex: 1, padding: '12px', borderRadius: '15px', border: '1px solid #222', cursor: 'pointer', fontWeight: 'bold' as any, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.3s' }
const sectionTitle = { display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px', fontSize:'16px' }
const emptyText = { textAlign:'center' as any, color:'#666', padding:'20px' }
