'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getSubscriptionStatus } from '@/lib/subscription'
import { ArrowRight, Upload, Sparkles, Lock } from 'lucide-react'
import Swal from 'sweetalert2'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ name: '', price: '', stock: '0', description: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ plan: '...', count: 0, max: 5, unlimited: false, canAI: false })

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [status, { count }] = await Promise.all([
        getSubscriptionStatus(),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])
      if (status) setStats({ plan: status.label, count: count || 0, max: status.maxLimit, unlimited: status.isUnlimited, canAI: status.canAI })
    }
    check()
  }, [])

  const handleSave = async () => {
    if (!form.name || !form.price) return Swal.fire('تنبيه', 'الاسم والسعر مطلوبان', 'warning')
    if (!stats.unlimited && stats.count >= stats.max) return Swal.fire('عفواً', `باقتك لا تسمح بأكثر من ${stats.max} منتجات`, 'error')
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    let imageUrl = ''
    if (imageFile) {
      const path = `${user?.id}/${Date.now()}`
      await supabase.storage.from('product-images').upload(path, imageFile)
      imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
    }
    const { error } = await supabase.from('products').insert({
      user_id: user?.id, name: form.name.trim(), price: parseFloat(form.price) || 0,
      stock: parseInt(form.stock) || 0, description: form.description, image_url: imageUrl
    })
    if (!error) Swal.fire('تم!', 'أضيف المنتج بنجاح', 'success').then(() => router.push('/dashboard/products'))
    setSaving(false)
  }

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', padding: '20px', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <button onClick={() => router.back()} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '10px', borderRadius: '12px' }}><ArrowRight /></button>
        <div style={{ background: '#d4af3722', padding: '8px 15px', borderRadius: '15px', color: '#d4af37', border: '1px solid #d4af3744' }}>
          {stats.plan}: {stats.unlimited ? '∞' : `${stats.count}/${stats.max}`}
        </div>
      </header>
      <div style={{ maxWidth: '500px', margin: '0 auto', display: 'grid', gap: '20px' }}>
        <div onClick={() => document.getElementById('img')?.click()} style={{ height: '200px', background: '#0a0a0a', border: '2px dashed #222', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {imagePreview ? <img src={imagePreview} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="p" /> : <Upload opacity={0.3} />}
          <input id="img" type="file" hidden onChange={e => { const f = e.target.files?.[0]; if(f){setImageFile(f); setImagePreview(URL.createObjectURL(f))} }} />
        </div>
        <div style={{ background: '#0a0a0a', padding: '25px', borderRadius: '30px', border: '1px solid #1a1a1a', display: 'grid', gap: '15px' }}>
          <input placeholder="اسم المنتج" style={{ background: '#050505', border: '1px solid #222', padding: '15px', borderRadius: '15px', color: '#fff' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input type="number" placeholder="السعر" style={{ background: '#050505', border: '1px solid #222', padding: '15px', borderRadius: '15px', color: '#d4af37', fontWeight: 900 }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <input type="number" placeholder="الكمية" style={{ background: '#050505', border: '1px solid #222', padding: '15px', borderRadius: '15px', color: '#fff' }} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>
          <button disabled={!stats.canAI} style={{ background: stats.canAI ? 'linear-gradient(45deg, #d4af37, #fbf5b7)' : '#111', color: stats.canAI ? '#000' : '#444', padding: '15px', borderRadius: '15px', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Sparkles size={18} /> ذكاء اصطناعي {!stats.canAI && <Lock size={14} />}
          </button>
          <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(45deg, #d4af37, #fbf5b7)', color: '#000', padding: '18px', borderRadius: '15px', fontWeight: 900, border: 'none' }}>
            {saving ? 'جاري الحفظ...' : 'اعتماد المنتج'}
          </button>
        </div>
      </div>
    </div>
  )
}
