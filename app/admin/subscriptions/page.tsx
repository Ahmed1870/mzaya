'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, Users, Package, Wallet, Clock, Check, Calendar, CreditCard } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SuperAdminRadar() {
  const [requests, setRequests] = useState<any[]>([])
  const [stats, setStats] = useState({ traders: 0, products: 0, revenue: 0 })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const loadAllData = async () => {
    setLoading(true)
    const { count: t } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: p } = await supabase.from('products').select('*', { count: 'exact', head: true })
    const { data: rev } = await supabase.from('subscriptions_requests').select('amount').eq('status', 'approved')
    const totalRev = rev?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    setStats({ traders: t || 0, products: p || 0, revenue: totalRev })

    const { data: reqs, error } = await supabase
      .from('subscriptions_requests')
      .select('*, profiles:user_id(shop_name)')
      .order('created_at', { ascending: false })
    
    if (error) console.error("Fetch error:", error)
    setRequests(reqs || [])
    setLoading(false)
  }

  useEffect(() => { loadAllData() }, [])

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

      // 1. تحديث حالة الطلب للأدمن
      const { error: err1 } = await supabase.from('subscriptions_requests').update({ status: 'approved' }).eq('id', req.id)
      
      // 2. التفعيل الفوري في بروفايل التاجر
      const { error: err2 } = await supabase.from('profiles').update({
        is_subscribed: true,
        plan_name: req.plan_name,
        subscription_expiry: expiry.toISOString()
      }).eq('id', req.user_id)

      // 3. الميزة الجديدة: إرسال تنبيه لحظي (Realtime Broadcast) للتاجر
      // بنبعت "قنبلة" داتا التاجر هيفجرها عنده ويطلع الآلارم
      await supabase.channel(`user-updates-${req.user_id}`).send({
        type: 'broadcast',
        event: 'plan-activated',
        payload: { plan: req.plan_name, message: 'مبروك! تم تفعيل باقتك بنجاح 🚀' }
      })

      if (!err1 && !err2) {
        Swal.fire({
          title: 'تم التفعيل بنجاح! ✅',
          text: `التاجر ${shopName} أصبح بريميوم الآن`,
          icon: 'success',
          background: '#050505',
          color: '#fff',
          showConfirmButton: false,
          timer: 2000
        })
        loadAllData()
      } else {
        Swal.fire('خطأ', 'حدثت مشكلة أثناء التفعيل في الداتا بيز', 'error')
      }
    }
  }

  return (
    <div style={{ background: '#050505', color: '#d4af37', minHeight: '100vh', padding: '25px', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}><ShieldCheck size={30}/> رادار التفعيل الحية</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={sCard}><Users size={20}/> <p>تجار: {stats.traders}</p></div>
        <div style={sCard}><Package size={20}/> <p>بضاعة: {stats.products}</p></div>
        <div style={sCard}><Wallet size={20} color="#1ed760"/> <p>أرباح: {stats.revenue}</p></div>
      </div>

      <div style={listContainer}>
        <h3 style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px'}}><Clock size={20}/> طلبات بانتظار المراجعة</h3>
        
        {requests.length === 0 && <p style={{textAlign:'center', color:'#666', padding:'20px'}}>الرادار هادئ حالياً..</p>}
        
        {requests.map(req => (
          <div key={req.id} style={reqItem}>
            <div style={{flex: 1}}>
              <div style={{color:'#fff', fontWeight:'bold', fontSize:'16px'}}>{req.profiles?.shop_name || 'تاجر جديد'}</div>
              <div style={{display:'flex', gap:'15px', marginTop:'5px', fontSize:'12px'}}>
                <span style={{display:'flex', alignItems:'center', gap:'4px', color:'#d4af37'}}><CreditCard size={14}/> {req.sender_number}</span>
                <span style={{display:'flex', alignItems:'center', gap:'4px', color:'#888'}}><Calendar size={14}/> {new Date(req.created_at).toLocaleString('ar-EG')}</span>
              </div>
            </div>

            <div style={{textAlign:'left' as const}}>
               <div style={{fontSize:'12px', color:'#fff', marginBottom:'5px'}}>{req.plan_name}</div>
              {req.status === 'pending' ? (
                <button onClick={() => handleActivate(req)} style={actBtn}>تفعيل الآن</button>
              ) : (
                <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#1ed760', fontWeight:'bold'}}>
                  <Check size={20}/> تم التفعيل
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const sCard = { background: '#111', padding: '15px', borderRadius: '15px', border: '1px solid #222', textAlign: 'center' as const }
const listContainer = { background: '#111', borderRadius: '25px', padding: '20px', border: '1px solid #d4af3733' }
const reqItem = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #222' }
const actBtn = { background: '#d4af37', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' as const, cursor: 'pointer' }
