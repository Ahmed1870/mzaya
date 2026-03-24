'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Minus, Trash2, MessageCircle, ArrowRight, ShoppingCart, User, Package, CheckCircle2, Percent } from 'lucide-react'

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [discount, setDiscount] = useState(0)
  const [plan, setPlan] = useState('free')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const [{ data: prds }, { data: prof }] = await Promise.all([
          supabase.from('products').select('*').eq('user_id', user.id).eq('is_active', true).gt('stock', 0),
          supabase.from('profiles').select('plan_name').eq('id', user.id).single()
        ])
        setProducts(prds || [])
        setPlan(prof?.plan_name || 'free')
      }
    }
    load()
  }, [])

  const addItem = (product: any) => {
    setItems(prev => {
      const ex = prev.find(i => i.product_id === product.id)
      if (ex) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price } : i)
      return [...prev, { product_id: product.id, product_name: product.name, unit_price: product.price, quantity: 1, total_price: product.price }]
    })
  }

  const subtotal = items.reduce((s, i) => s + i.total_price, 0)
  const finalTotal = subtotal - discount

  const handleSave = async () => {
    if (!customer.name || items.length === 0) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: inv, error: e } = await supabase.from('invoices').insert({
        user_id: user.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        total_amount: finalTotal,
        discount_amount: discount,
        status: 'paid'
      }).select().single()
      
      if (e) throw e
      await supabase.from('invoice_items').insert(items.map(i => ({ ...i, invoice_id: inv.id })))
      
      // التحديث التلقائي للمخزن والمحفظة يتم الآن عبر Triggers الداتابيز لضمان الأمان
      setDone(inv)
    } catch (err) { setSaving(false) }
  }

  if (done) return (
    <div className="animate-fade-up" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ background: '#111', padding: '2.5rem', borderRadius: '2.5rem', border: '1px solid #D4AF37' }}>
        <CheckCircle2 size={60} color="#D4AF37" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'white', fontWeight: 900 }}>فاتورة ذكية مكتملة!</h2>
        <p style={{ color: '#444', fontSize: '0.9rem', marginBottom: '2rem' }}>تم تحديث الرادار المالي بنجاح</p>
        <button onClick={() => router.push('/dashboard/invoices')} style={{ width: '100%', background: '#D4AF37', color: '#000', padding: '1rem', borderRadius: '15px', fontWeight: 900 }}>سجل الفواتير</button>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem', direction: 'rtl' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => router.back()} style={{ background: '#111', border: 'none', color: '#666', padding: '10px', borderRadius: '12px' }}><ArrowRight size={20} /></button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D4AF37' }}>⚡ بيع ذكي ({plan})</h1>
      </header>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.9rem', borderRadius: '12px', color: '#fff', marginBottom: '0.8rem' }} placeholder="اسم العميل" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
          <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.9rem', borderRadius: '12px', color: '#fff' }} placeholder="رقم واتساب" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
        </div>

        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
            {products.map(p => (
              <button key={p.id} onClick={() => addItem(p)} style={{ flex: '0 0 130px', background: '#050505', border: '1px solid #222', padding: '12px', borderRadius: '15px', color: '#fff' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{p.name}</div>
                <div style={{ color: '#D4AF37', fontWeight: 900 }}>{formatPrice(p.price)}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <Percent size={16} color="#444" />
            <input type="number" placeholder="إضافة خصم نقدي..." onChange={e => setDiscount(Number(e.target.value))} style={{ background: 'none', border: 'none', color: '#D4AF37', fontSize: '0.9rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
            <span style={{ fontWeight: 900 }}>الإجمالي النهائي</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D4AF37' }}>{formatPrice(finalTotal)}</span>
          </div>
          <button onClick={handleSave} disabled={saving || items.length === 0} style={{ width: '100%', background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', color: '#000', padding: '1.2rem', borderRadius: '15px', fontWeight: 900, border: 'none', marginTop: '1.5rem' }}>
            {saving ? 'جاري التحصيل...' : 'إتمام العملية 💰'}
          </button>
        </div>
      </div>
    </div>
  )
}
