'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { MessageCircle, Package, Truck, CheckCircle, AlertTriangle, Clock, RefreshCw, User, MapPin, DollarSign, ExternalLink } from 'lucide-react'
import Swal from 'sweetalert2'

const ORDER_STATUSES = [
  { value: 'pending', label: 'طلب جديد', icon: '📩', color: '#D4AF37' },
  { value: 'processing', label: 'قيد التجهيز', icon: '🛠️', color: '#f59e0b' },
  { value: 'out_for_delivery', label: 'مع المندوب', icon: '🛵', color: '#4361ee' },
  { value: 'delivered', label: 'تم التسليم', icon: '✅', color: '#2ecc71' },
  { value: 'returned', label: 'مرتجع', icon: '⚠️', color: '#e74c3c' },
]

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [businessName, setBusinessName] = useState('')

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: profile }, { data: dbOrders }] = await Promise.all([
      supabase.from('profiles').select('business_name').eq('id', user.id).maybeSingle(),
      supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    ])

    setBusinessName(profile?.business_name || 'متجري')
    setOrders(dbOrders || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (orderId: string, newStatus: string, order: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
      if (error) throw error

      // إذا تم التسليم: سجل العملية في المحفظة والمعاملات
      if (newStatus === 'delivered') {
        // 1. تحديث المحفظة
        const { data: wallet } = await supabase.from('wallet').select('balance').eq('user_id', user?.id).maybeSingle()
        await supabase.from('wallet').update({ balance: (wallet?.balance || 0) + order.total_amount }).eq('user_id', user?.id)
        
        // 2. تسجيل معاملة مالية
        await supabase.from('transactions').insert([{
          user_id: user?.id,
          amount: order.total_amount,
          type: 'income',
          category: 'sales',
          description: `بيع أوردر خارجي #${orderId.slice(0,5)}`
        }])
      }

      await load()
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'تم التحديث والمزامنة الممالية', showConfirmButton: false, timer: 2000, background: '#111', color: '#fff' })
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'خطأ في التحديث', background: '#111', color: '#fff' })
    }
  }

  const sendStatusUpdate = (order: any) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === order.status)
    const msg = `🛍️ أهلاً ${order.customer_name}، تحديث بخصوص طلبك #${order.id.slice(0,5)} من *${businessName}*:\nحالة الطلب الآن هي: *${statusObj?.label}* ${statusObj?.icon}\n\nشكراً لثقتك بنا! 🙏`
    window.open(`https://wa.me/${order.customer_phone.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><RefreshCw className="animate-spin" color="#D4AF37"/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>📦 رادار الطلبات الخارجية</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>إدارة طلبات المتجر العام لـ {businessName}</p>
      </header>

      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
        {['all', ...ORDER_STATUSES.map(s => s.value)].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.6rem 1.2rem', borderRadius: '15px', border: '1px solid #222',
            background: filter === f ? '#D4AF37' : '#111', color: filter === f ? '#000' : '#666',
            fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', transition: '0.3s'
          }}>
            {f === 'all' ? 'الكل' : ORDER_STATUSES.find(s => s.value === f)?.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#444', background: '#111', borderRadius: '2rem', border: '1px dashed #222' }}>لا يوجد طلبات بهذا التصنيف حالياً</div>
        ) : (
          filtered.map(order => (
            <div key={order.id} style={{ background: '#111', borderRadius: '1.8rem', padding: '1.5rem', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                <span style={{ color: '#D4AF37', fontWeight: 900, background: 'rgba(212,175,55,0.1)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>#{order.id.slice(0,5)}</span>
                <span style={{ fontSize: '0.75rem', color: '#444' }}>{new Date(order.created_at).toLocaleTimeString('ar-EG')} - {new Date(order.created_at).toLocaleDateString('ar-EG')}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#888', fontSize: '0.7rem', marginBottom: '4px' }}><User size={12}/> العميل</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{order.customer_name}</div>
                  <div style={{ color: '#444', fontSize: '0.8rem', marginTop: '4px' }}><MapPin size={10} style={{display:'inline'}}/> {order.customer_address || 'استلام من الفرع'}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#888', fontSize: '0.7rem', marginBottom: '4px' }}>الإجمالي</div>
                  <div style={{ fontWeight: 900, color: '#D4AF37', fontSize: '1.1rem' }}>{formatPrice(order.total_amount)}</div>
                </div>
              </div>

              <div style={{ background: '#080808', padding: '1rem', borderRadius: '1rem', marginBottom: '1.2rem', border: '1px solid #1a1a1a' }}>
                <div style={{ fontSize: '0.7rem', color: '#444', marginBottom: '8px' }}>محتويات الطلب:</div>
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{item.name} <small style={{color:'#444'}}>x{item.quantity}</small></span>
                    <span style={{color:'#666'}}>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => sendStatusUpdate(order)} style={{ background: '#25d36620', color: '#25d366', border: '1px solid #25d36630', padding: '0.8rem', borderRadius: '12px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 800 }}>
                  <MessageCircle size={16}/> تحديث العميل
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <select 
                    value={order.status} 
                    onChange={(e) => updateStatus(order.id, e.target.value, order)}
                    style={{ width: '100%', background: '#050505', color: '#fff', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', outline: 'none', fontSize: '0.8rem', fontWeight: 700, appearance: 'none' }}
                  >
                    {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
