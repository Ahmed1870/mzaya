'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { Plus, Minus, Trash2, MessageCircle, ArrowRight, ShoppingCart, User, Package, CheckCircle2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function NewInvoicePage() {
  const router = useRouter()
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<any>(null)

  useEffect(() => {
    const loadProducts = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('products').select('*').eq('user_id', user.id).eq('is_active', true).gt('stock', 0)
        setProducts(data || [])
      }
    }
    loadProducts()
  }, [])

  const addItem = (product: any) => {
    setItems(prev => {
      const ex = prev.find(i => i.product_id === product.id)
      if (ex) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1, total_price: (i.quantity + 1) * i.unit_price } : i)
      return [...prev, { product_id: product.id, product_name: product.name, unit_price: product.price, quantity: 1, total_price: product.price }]
    })
  }

  const subtotal = items.reduce((s, i) => s + i.total_price, 0)

  const handleSave = async () => {
    if (!customer.name || items.length === 0) { setError('اسم العميل والمنتجات مطلوبة'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('غير مسجل')

      // 1. إنشاء الفاتورة
      const { data: inv, error: e } = await supabase.from('invoices').insert({
        user_id: user.id,
        customer_name: customer.name,
        customer_phone: customer.phone || null,
        total_amount: subtotal,
        status: 'paid'
      }).select().single()
      if (e) throw e

      // 2. تسجيل الأصناف
      await supabase.from('invoice_items').insert(items.map(i => ({ ...i, invoice_id: inv.id })))

      // 3. تحديث المخزن والمحفظة (تناغم مزايا)
      for (const item of items) {
        const product = products.find(p => p.id === item.product_id)
        if (product) await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.product_id)
      }

      const { data: wallet } = await supabase.from('wallet').select('balance').eq('user_id', user.id).maybeSingle()
      const newBalance = (wallet?.balance || 0) + subtotal
      await supabase.from('wallet').update({ balance: newBalance }).eq('user_id', user.id)

      // 4. تسجيل العملية في سجل المحفظة
      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: subtotal,
        type: 'income',
        category: 'sales',
        description: `بيع فاتورة #${inv.id.slice(0, 8).toUpperCase()}`
      })

      setDone(inv)
    } catch (err: any) { setError(err.message); setSaving(false) }
  }

  const whatsappLink = () => {
    const text = `🧾 *فاتورة من مزايا*\n*رقم: #${done?.id.slice(0, 8).toUpperCase()}*\n👤 العميل: ${customer.name}\n💰 الإجمالي: ${formatPrice(subtotal)}\nشكراً لتعاملك معنا!`
    return `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
  }

  if (done) return (
    <div className="animate-fade-up" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ background: '#111', padding: '2.5rem', borderRadius: '2.5rem', border: '1px solid #D4AF37' }}>
        <CheckCircle2 size={60} color="#D4AF37" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'white', fontWeight: 900 }}>تمت العملية!</h2>
        <p style={{ color: '#444', fontSize: '0.9rem', marginBottom: '2rem' }}>تم تحديث المخزن وإضافة {formatPrice(subtotal)} لمحفظتك</p>
        <div style={{ display: 'grid', gap: '10px' }}>
          {customer.phone && <a href={whatsappLink()} target="_blank" className="btn-primary" style={{ background: '#25D366', border: 'none', textDecoration: 'none', justifyContent: 'center' }}><MessageCircle size={18} /> إرسال عبر واتساب</a>}
          <button onClick={() => router.push('/dashboard/invoices')} style={{ background: '#050505', color: '#fff', border: '1px solid #222', padding: '1rem', borderRadius: '15px' }}>سجل الفواتير</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => router.back()} style={{ background: '#111', border: 'none', color: '#666', padding: '10px', borderRadius: '12px' }}><ArrowRight size={20} /></button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D4AF37' }}>⚡ بيع سريع</h1>
      </header>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {/* Customer Section */}
        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 800 }}><User size={16} /> بيانات العميل</div>
          <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.9rem', borderRadius: '12px', color: '#fff', marginBottom: '0.8rem' }} placeholder="اسم العميل *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
          <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.9rem', borderRadius: '12px', color: '#fff' }} placeholder="رقم واتساب" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
        </div>

        {/* Quick Product Pick */}
        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 800 }}><Package size={16} /> اختر المنتجات</div>
          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {products.map(p => (
              <button key={p.id} onClick={() => addItem(p)} style={{ flex: '0 0 130px', background: '#050505', border: '1px solid #222', padding: '12px', borderRadius: '15px', textAlign: 'right', color: '#fff' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ color: '#D4AF37', fontWeight: 900, marginTop: '5px' }}>{formatPrice(p.price)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Invoice Summary */}
        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 800 }}><ShoppingCart size={16} /> المنتجات المختارة</div>
          {items.map(item => (
            <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: '0.85rem' }}>{item.product_name} <span style={{ color: '#444' }}>× {item.quantity}</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 800 }}>{formatPrice(item.total_price)}</span>
                <button onClick={() => setItems(items.filter(i => i.product_id !== item.product_id))} style={{ color: '#e74c3c', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1rem', fontWeight: 900 }}>الإجمالي</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D4AF37' }}>{formatPrice(subtotal)}</span>
          </div>
          {error && <p style={{ color: '#e74c3c', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
          <button onClick={handleSave} disabled={saving || items.length === 0} style={{ width: '100%', background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', color: '#000', padding: '1.2rem', borderRadius: '15px', fontWeight: 900, border: 'none', marginTop: '1.5rem' }}>
            {saving ? 'جاري الحفظ...' : 'إتمام العملية وتحصيل الكاش 💰'}
          </button>
        </div>
      </div>
    </div>
  )
}
