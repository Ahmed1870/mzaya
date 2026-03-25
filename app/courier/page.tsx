'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Phone, MapPin, Package, CheckCircle2, Search, LogOut, Navigation, MessageSquare, Wallet, Bike } from 'lucide-react'

export default function CourierPortal() {
  const supabase = createClient()
  const [courier, setCourier] = useState<any>(null)
  const [invoices, setInvoices] = useState<any[]>([])
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)

  const loadOrders = async (id: string) => {
    const { data } = await supabase.from('invoices')
      .select('*')
      .eq('courier_id', id)
      .neq('order_status', 'delivered')
      .order('created_at', { ascending: false })
    setInvoices(data || [])
  }

  const login = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('couriers').select('*').eq('phone', phone).eq('is_active', true).single()
    if (data) {
      setCourier(data)
      await loadOrders(data.id)
    } else {
      alert('⚠️ الرقم ده مش متسجل في "رادار المناديب"!')
    }
    setLoading(false)
  }

  const handleDelivery = async (inv: any) => {
    if (!confirm('هل استلمت المبلغ وتم التسليم للعميل فعلاً؟')) return
    setUpdating(inv.id)
    
    const { error } = await supabase.from('invoices').update({ 
      status: 'paid', 
      order_status: 'delivered' 
    }).eq('id', inv.id)

    if (!error) {
      setInvoices(prev => prev.filter(i => i.id !== inv.id))
      // هنا الـ Trigger في الداتابيز هيقوم بتحديث محفظة التاجر تلقائياً
    }
    setUpdating(null)
  }

  if (!courier) return (
    <div className="animate-fade-up" style={{ minHeight: '100vh', background: '#000', padding: '3rem 1.5rem', textAlign: 'center', color: 'white', direction: 'rtl' }}>
      <div style={{ width: '80px', height: '80px', background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 10px 20px rgba(212,175,55,0.2)' }}>
        <Bike size={40} color="#000" />
      </div>
      <h1 style={{ fontWeight: 900, fontSize: '1.8rem', marginBottom: '0.5rem' }}>بوابة الميدان 📦</h1>
      <p style={{ color: '#444', marginBottom: '2.5rem' }}>سجل دخولك لبدء توصيل الطلبات</p>
      
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Phone size={18} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
        <input placeholder="رقم الموبايل المسجل..." value={phone} onChange={e => setPhone(e.target.value)} 
               style={{ width: '100%', padding: '1.2rem 3.5rem 1.2rem 1rem', background: '#0A0A0A', border: '1px solid #1a1a1a', borderRadius: '18px', color: '#fff', fontSize: '1rem', outline: 'none' }} />
      </div>

      <button onClick={login} disabled={loading} style={{ width: '100%', background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', color: '#000', padding: '1.2rem', borderRadius: '18px', fontWeight: 900, border: 'none', fontSize: '1.1rem', cursor: 'pointer', transition: '0.3s' }}>
        {loading ? 'جاري الفحص...' : 'دخول للميدان 🚀'}
      </button>
    </div>
  )

  return (
    <div className="animate-fade-up" style={{ minHeight: '100vh', background: '#050505', color: 'white', direction: 'rtl', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', background: '#0A0A0A', borderRadius: '20px', border: '1px solid #111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <User size={24} color="#D4AF37" />
          </div>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>{courier.name}</h2>
            <p style={{ fontSize: '0.7rem', color: '#2ecc71', margin: 0 }}>نشط الآن بالميدان</p>
          </div>
        </div>
        <button onClick={() => setCourier(null)} style={{ background: '#111', border: 'none', color: '#666', padding: '12px', borderRadius: '15px' }}><LogOut size={20}/></button>
      </header>

      <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1rem', paddingRight: '0.5rem' }}>📦 طلبات قيد التوصيل ({invoices.length})</h3>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {invoices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#444' }}>
            <Package size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>مفيش أوردرات حالياً.. استريح يا بطل!</p>
          </div>
        ) : invoices.map(inv => (
          <div key={inv.id} style={{ background: '#0A0A0A', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #1a1a1a', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
               <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: '0 0 5px 0' }}>{inv.customer_name}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={12}/> {inv.customer_phone}</p>
               </div>
               <div style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', color: '#D4AF37', fontWeight: 900, fontSize: '1.2rem' }}>{formatPrice(inv.total_amount)}</span>
                  <span style={{ fontSize: '0.6rem', color: '#444' }}>#{inv.id.slice(0,8).toUpperCase()}</span>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a href={`https://wa.me/${inv.customer_phone}`} style={{ flex: 1, background: '#111', color: '#25D366', padding: '1rem', borderRadius: '15px', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 800, border: '1px solid #222' }}>
                <MessageSquare size={18} /> واتساب
              </a>
              <button 
                onClick={() => handleDelivery(inv)}
                disabled={updating === inv.id}
                style={{ flex: 1.5, background: 'linear-gradient(45deg, #2ecc71, #27ae60)', color: '#fff', padding: '1rem', borderRadius: '15px', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 5px 15px rgba(46,204,113,0.2)' }}
              >
                {updating === inv.id ? 'جاري الحفظ...' : <><CheckCircle2 size={18} /> تم التسليم</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
