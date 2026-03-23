'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Wallet, Clock, CheckCircle, TrendingUp, ArrowDownCircle, RefreshCw, Landmark } from 'lucide-react'
import Swal from 'sweetalert2'

export default function WalletPage() {
  const supabase = createClient()
  const [wallet, setWallet] = useState<any>(null)
  const [pending, setPending] = useState(0)
  const [recentTx, setRecentTx] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: w }, { data: pendingInv }, { data: paidInv }] = await Promise.all([
      supabase.from('wallet').select('*').eq('user_id', user.id).single(),
      supabase.from('invoices').select('total_amount').eq('order_status', 'out_for_delivery'),
      supabase.from('invoices').select('*').eq('status', 'paid').order('delivered_at', { ascending: false }).limit(8),
    ])

    setWallet(w)
    setPending((pendingInv || []).reduce((s, i) => s + Number(i.total_amount), 0))
    setRecentTx(paidInv || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleWithdrawRequest = () => {
    Swal.fire({
      title: 'طلب سحب رصيد',
      text: `رصيدك المتاح: ${formatPrice(wallet?.balance || 0)}`,
      input: 'number',
      inputPlaceholder: 'أدخل المبلغ...',
      showCancelButton: true,
      confirmButtonText: 'إرسال الطلب',
      cancelButtonText: 'إلغاء',
      background: '#111',
      color: '#fff',
      confirmButtonColor: '#D4AF37'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        if (result.value > (wallet?.balance || 0)) {
          Swal.fire('خطأ', 'المبلغ أكبر من رصيدك الحالي', 'error')
        } else {
          Swal.fire('تم!', 'سيتم مراجعة طلبك وتحويل المبلغ خلال 24 ساعة.', 'success')
        }
      }
    })
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>🏦 المحفظة المالية</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>تتبع أرباحك وعمولات المناديب</p>
        </div>
        <button onClick={handleWithdrawRequest} style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Landmark size={18}/> سحب الأرباح
        </button>
      </header>

      {/* الرصيد الأساسي */}
      <div style={{ background: 'linear-gradient(135deg, #111, #050505)', padding: '2.5rem', borderRadius: '2rem', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>صافي الرصيد المتاح</p>
        <h2 style={{ fontSize: '3.5rem', fontWeight: 900, color: '#D4AF37', margin: 0 }}>{formatPrice(wallet?.balance || 0)}</h2>
      </div>

      {/* كروت الإحصائيات */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'إجمالي المبيعات', value: wallet?.total_revenue, color: '#2ecc71', icon: <TrendingUp size={16}/> },
          { label: 'رصيد معلق', value: pending, color: '#f59e0b', icon: <Clock size={16}/> },
          { label: 'عمولات مدفوعة', value: wallet?.total_commissions, color: '#e74c3c', icon: <ArrowDownCircle size={16}/> }
        ].map((item, i) => (
          <div key={i} style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #222' }}>
            <div style={{ color: item.color, marginBottom: '0.5rem' }}>{item.icon}</div>
            <p style={{ color: '#444', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{item.label}</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatPrice(item.value || 0)}</p>
          </div>
        ))}
      </div>

      {/* المعاملات الأخيرة */}
      <div style={{ background: '#111', borderRadius: '1.5rem', padding: '1.5rem', border: '1px solid rgba(212,175,55,0.05)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#D4AF37' }}>آخر التحصيلات المكتملة</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {recentTx.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#444', padding: '2rem' }}>لا توجد تحصيلات بعد</p>
          ) : (
            recentTx.map(tx => (
              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #222' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{tx.customer_name}</p>
                  <p style={{ fontSize: '0.7rem', color: '#444' }}>#{tx.id.slice(0,5)} • {new Date(tx.delivered_at).toLocaleDateString('ar-EG')}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ color: '#2ecc71', fontWeight: 700 }}>+{formatPrice(tx.total_amount - (tx.commission_amount || 0))}</p>
                  <p style={{ fontSize: '0.65rem', color: '#e74c3c' }}>عمولة: {formatPrice(tx.commission_amount || 0)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
