'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Sparkles, Upload, ArrowRight, Camera, ImageIcon, CheckCircle2, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', stock: '0', category: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [userStats, setUserStats] = useState({ plan: 'مجانية', count: 0, isUnlimited: false })

  useEffect(() => {
    const checkLimits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from('profiles').select('plan_name').eq('id', user.id).single(),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])

      const plan = profile?.plan_name || 'مجانية'
      const isUnlimited = plan === 'بزنس' || plan === 'احترافية'
      setUserStats({ plan, count: count || 0, isUnlimited })
    }
    checkLimits()
  }, [])

  const handleImage = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const analyzeWithAI = async (e: any) => {
    e.preventDefault()
    if (!imageFile) return Swal.fire('ارفع صورة أولاً', '', 'info')
    setAiLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const res = await fetch('/api/ai/analyze-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: imageFile.type }),
        })
        const data = await res.json()
        setForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          description: data.description || prev.description,
          price: data.suggested_price?.toString() || prev.price,
          category: data.category || prev.category
        }))
      }
      reader.readAsDataURL(imageFile)
    } catch (err) { console.error(err) } finally { setAiLoading(false) }
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    if (saving) return
    
    if (!userStats.isUnlimited && userStats.count >= 5) {
      return Swal.fire('وصلت للحد الأقصى!', 'الباقة المجانية تسمح بـ 5 منتجات فقط.', 'warning')
    }

    if (!form.name || !form.price) return Swal.fire('بيانات ناقصة', 'الاسم والسعر مطلوبين', 'error')
    
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('سجل دخولك أولاً')

      let imageUrl = ''
      if (imageFile) {
        const path = `${user.id}/${Date.now()}`
        await supabase.storage.from('product-images').upload(path, imageFile)
        imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      }

      const { error: saveErr } = await supabase.from('products').insert({
        user_id: user.id,
        name: form.name.trim(),
        price: parseFloat(form.price),
        cost: form.cost ? parseFloat(form.cost) : 0,
        stock: parseInt(form.stock) || 0,
        stock_quantity: parseInt(form.stock) || 0,
        description: form.description,
        category: form.category || null,
        image_url: imageUrl,
        is_active: true
      })

      if (saveErr) throw saveErr
      
      await Swal.fire('تم الحفظ!', 'منتجك الآن متاح في المتجر', 'success')
      router.push('/dashboard/products')
      router.refresh()
    } catch (err: any) {
      Swal.fire('خطأ', err.message, 'error')
    } finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-up" style={{ color: 'white', padding: '1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems:'center' }}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
           <button onClick={() => router.back()} style={{ background: '#111', border: 'none', color: '#666', padding: '8px', borderRadius: '10px' }}><ArrowRight size={20} /></button>
           <h1 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>إضافة منتج ذكي (V1.4)</h1>
        </div>
        <div style={{ background: '#111', padding: '5px 12px', borderRadius: '10px', fontSize: '0.7rem', border: '1px solid #222' }}>
           الباقة: <span style={{color: '#D4AF37'}}>{userStats.plan}</span> ({userStats.isUnlimited ? '∞' : `${userStats.count}/5`})
        </div>
      </header>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div onClick={() => galleryRef.current?.click()} style={{ background: '#111', height: '180px', borderRadius: '1.5rem', border: '2px dashed #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
          {imagePreview ? <img src={imagePreview} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{textAlign:'center'}}><Upload size={30} color="#444" /><p style={{color:'#444', fontSize:'0.7rem', marginTop:'10px'}}>ارفع صورة المنتج</p></div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <button onClick={(e) => { e.preventDefault(); cameraRef.current?.click() }} style={{ background: '#050505', border: '1px solid #222', color: '#fff', padding: '12px', borderRadius: '12px' }}><Camera size={20} /></button>
            <button onClick={(e) => { e.preventDefault(); galleryRef.current?.click() }} style={{ background: '#050505', border: '1px solid #222', color: '#fff', padding: '12px', borderRadius: '12px' }}><ImageIcon size={20} /></button>
            <button onClick={analyzeWithAI} disabled={!imageFile || aiLoading} style={{ background: aiLoading ? '#111' : '#D4AF37', color: '#000', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 900 }}>
              {aiLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            </button>
        </div>

        <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #222', display: 'grid', gap: '0.8rem' }}>
          <input placeholder="اسم المنتج *" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <input type="number" placeholder="السعر *" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            <input type="number" placeholder="الكمية" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
          </div>

          <textarea placeholder="وصف المنتج..." style={{ width: '100%', height:'80px', background: '#050505', border: '1px solid #222', padding: '0.8rem', borderRadius: '12px', color: '#fff' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', color: '#000', padding: '1rem', borderRadius: '15px', fontWeight: 900, border: 'none', marginTop: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> حفظ المنتج</>}
          </button>
        </div>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
    </div>
  )
}
