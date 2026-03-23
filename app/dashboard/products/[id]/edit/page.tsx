'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowRight, Save, TrendingUp, AlertTriangle, Package, DollarSign, CheckCircle2, ShieldAlert } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ name:'', description:'', price:'', cost:'', stock:'', category:'', is_active:true })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function getProduct() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase.from('products').select('*').eq('id', params.id).eq('user_id', user.id).single()
      if (error) { router.push('/dashboard/products'); return }
      if (data) setForm({
        name: data.name || '',
        description: data.description || '',
        price: data.price?.toString() || '',
        cost: data.cost?.toString() || '0',
        stock: data.stock?.toString() || '0',
        category: data.category || '',
        is_active: data.is_active,
      })
      setLoading(false)
    }
    getProduct()
  }, [params.id])

  const price = parseFloat(form.price) || 0
  const cost = parseFloat(form.cost) || 0
  const profit = price - cost
  const margin = price > 0 ? ((profit / price) * 100) : 0

  const handleSave = async () => {
    if (!form.name || !form.price) { setError('الاسم والسعر مطلوبان'); return }
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error: e } = await supabase.from('products').update({
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      cost: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      category: form.category || null,
      is_active: form.is_active,
      updated_at: new Date().toISOString()
    }).eq('id', params.id).eq('user_id', user?.id)

    if (e) { setError(e.message); setSaving(false) }
    else { router.push('/dashboard/products'); router.refresh() }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => router.back()} style={{ background: '#111', border: 'none', color: '#666', padding: '10px', borderRadius: '12px' }}><ArrowRight size={20} /></button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#D4AF37' }}>تحديث بيانات المنتج</h1>
      </header>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {/* Profit Insight Card */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222', display: 'flex', justifyContent: 'space-around', alignItems: 'center', textAlign: 'center' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#444', marginBottom: '5px' }}>ربح القطعة</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: profit > 0 ? '#2ecc71' : '#e74c3c' }}>{formatPrice(profit)}</p>
          </div>
          <div style={{ width: '1px', height: '30px', background: '#222' }} />
          <div>
            <p style={{ fontSize: '0.7rem', color: '#444', marginBottom: '5px' }}>هامش الربح</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: margin > 15 ? '#D4AF37' : '#e74c3c' }}>%{margin.toFixed(1)}</p>
          </div>
        </div>

        {/* Form Card */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222', display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#444' }}>اسم المنتج</label>
            <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '12px', color: '#fff' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#444' }}>سعر البيع</label>
              <input type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '12px', color: '#fff' }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#444' }}>سعر التكلفة</label>
              <input type="number" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '12px', color: '#fff' }} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#444' }}>المخزون الحالي</label>
              <div style={{ position: 'relative' }}>
                <input type="number" style={{ width: '100%', background: '#050505', border: `1px solid ${parseInt(form.stock) < 5 ? '#e74c3c' : '#222'}`, padding: '1rem', borderRadius: '12px', color: '#fff' }} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                {parseInt(form.stock) < 5 && <ShieldAlert size={16} color="#e74c3c" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#444' }}>التصنيف</label>
              <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '12px', color: '#fff' }} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: '#050505', borderRadius: '15px', border: '1px solid #222' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} style={{ width: '20px', height: '20px', accentColor: '#D4AF37' }} />
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>تفعيل المنتج</p>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#444' }}>المنتج النشط يظهر في الفواتير والمتجر</p>
            </div>
          </div>

          {error && <p style={{ color: '#e74c3c', fontSize: '0.8rem', textAlign: 'center' }}>{error}</p>}

          <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', color: '#000', padding: '1.2rem', borderRadius: '15px', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {saving ? 'جاري الحفظ...' : <><CheckCircle2 size={18} /> حفظ التعديلات</>}
          </button>
        </div>
      </div>
    </div>
  )
}
