'use client';
import { CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ShieldCheck, Users, Package, Wallet, Clock, CheckCircle2, Star, Rocket, Gift } from 'lucide-react'
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
        .select('*, profiles:user_id(shop_name, full_name)')
        .order('created_at', { ascending: false })
      setRequests(reqs || [])

      // جلب الإحالات المؤهلة (5 أو 10 إحالات)
      const { data: allProfiles } = await supabase.from('profiles').select('id, shop_name, plan_name')
      const eligible = []
      for (const prof of allProfiles || []) {
        const { count } = await supabase.from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', prof.id)
          .neq('plan_name', 'مجانية') // شرطك: لازم المشتركين يكونوا فعلوا باقات
        
        if (count && count >= 5) {
          eligible.push({ ...prof, referral_count: count })
        }
      }
      setReferralRequests(eligible.filter(p => p.plan_name === 'مجانية' || p.plan_name === 'احترافية'))
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => { loadAllData() }, [])

  const handleActivate = async (req: any, type: 'paid' | 'gift' = 'paid') => {
    const planToSet = req.plan_name;
    const { isConfirmed } = await Swal.fire({
      title: type === 'paid' ? 'تأكيد التفعيل المالي' : 'تأكيد مكافأة الإحالة',
      text: `تفعيل باقة ${planToSet} لمتجر ${req.profiles?.shop_name || req.shop_name}؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'نعم، تفعيل الآن',
      background: '#0a0a0a', color: '#fff', confirmButtonColor: '#d4af37'
    })

    if (isConfirmed) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      // 1. تحديث البروفايل (فتح كل الصلاحيات)
      const { error: profileErr } = await supabase.from('profiles').update({
        plan_name: planToSet,
        is_subscribed: true,
        subscription_status: 'active',
        subscription_activated_at: new Date().toISOString(),
        subscription_end_date: expiryDate.toISOString(),
        max_products: planToSet === 'البيزنس' ? 999999 : 500, // فتح الحدود
        upgrade_requested: false
      }).eq('id', req.user_id || req.id)

      if (profileErr) return Swal.fire('خطأ', 'فشل تحديث البروفايل', 'error');

      // 2. تحديث حالة الطلب لو كان طلب مالي
      if (type === 'paid' && req.id) {
        await supabase.from('subscriptions_requests').update({ status: 'approved' }).eq('id', req.id)
      }

      // 3. إرسال إشعار داخلي للتاجر
      await supabase.from('notifications').insert([{
        user_id: req.user_id || req.id,
        title: 'مبروك! تم تفعيل باقتك 🚀',
        message: `تم تفعيل باقة ${planToSet} بنجاح. يمكنك الآن استخدام كافة المميزات لمدة 30 يوم.`,
        type: 'subscription'
      }])

      Swal.fire({ icon: 'success', title: 'تم التفعيل وفتح المميزات ✅', background: '#0a0a0a', color: '#fff' })
      loadAllData()
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#d4af37] p-8" style={{ direction: 'rtl', fontFamily: 'sans-serif' }}>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black flex items-center gap-3"><ShieldCheck size={40}/> رادار الإدارة العليـا</h1>
        <div className="flex gap-4">
            <div className="bg-[#111] p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
                <p className="text-gray-500 text-xs">إجمالي التجار</p>
                <p className="text-xl font-bold text-white">{stats.traders}</p>
            </div>
            <div className="bg-[#111] p-4 rounded-2xl border border-white/5 text-center min-w-[120px]">
                <p className="text-gray-500 text-xs">إجمالي الأرباح</p>
                <p className="text-xl font-bold text-green-500">{stats.revenue} ج.م</p>
            </div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-[#111] p-1 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('money')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'money' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500'}`}>طلبات الاشتراك ({requests.filter(r=>r.status==='pending').length})</button>
        <button onClick={() => setActiveTab('referral')} className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'referral' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-500'}`}>مكافآت الإحالة ({referralRequests.length})</button>
      </div>

      <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center animate-pulse">جاري فحص قاعدة البيانات...</div>
        ) : (
          <div className="divide-y divide-white/5">
            {activeTab === 'money' ? (
              requests.length > 0 ? requests.map(req => (
                <div key={req.id} className="p-6 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl"><CreditCard size={20}/></div>
                    <div>
                        <p className="text-white font-bold">{req.profiles?.shop_name || 'متجر غير معروف'}</p>
                        <p className="text-xs text-gray-500">الباقة: {req.plan_name} | رقم المحول: {req.sender_number}</p>
                    </div>
                  </div>
                  {req.status === 'pending' ? (
                    <button onClick={() => handleActivate(req, 'paid')} className="bg-[#d4af37] text-black px-6 py-2 rounded-xl font-black hover:scale-105 active:scale-95 transition-all">تفعيل الآن</button>
                  ) : <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle2 size={16}/> تم التفعيل</span>}
                </div>
              )) : <div className="p-20 text-center text-gray-600 font-bold">لا توجد طلبات معلقة</div>
            ) : (
              referralRequests.length > 0 ? referralRequests.map(u => {
                const targetPlan = u.referral_count >= 10 ? 'البيزنس' : 'الاحترافية';
                return (
                  <div key={u.id} className="p-6 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><Gift size={20}/></div>
                      <div>
                          <p className="text-white font-bold">{u.shop_name}</p>
                          <p className="text-xs text-gray-500">لديه {u.referral_count} إحالة نشطة | مستحق لباقة: {targetPlan}</p>
                      </div>
                    </div>
                    <button onClick={() => handleActivate({id: u.id, plan_name: targetPlan, shop_name: u.shop_name}, 'gift')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-black hover:bg-blue-500 transition-all flex items-center gap-2">
                        <Rocket size={16}/> ترقية مجانية
                    </button>
                  </div>
                )
              }) : <div className="p-20 text-center text-gray-600 font-bold">لا يوجد تجار مؤهلين للمكافآت حالياً</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
