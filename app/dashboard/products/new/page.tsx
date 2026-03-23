'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getSubscriptionStatus } from '@/lib/subscription'
import { Sparkles, Upload, ArrowRight, Camera, ImageIcon, CheckCircle2, Loader2, Lock } from 'lucide-react'
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
  const [userStats, setUserStats] = useState({ plan: 'جاري التحميل...', count: 0, isUnlimited: false, canUseAI: false })

  useEffect(() => {
    const checkLimits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [status, { count }] = await Promise.all([
        getSubscriptionStatus(),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])
      if (status) {
        setUserStats({ plan: status.label, count: count || 0, isUnlimited: status.isUnlimited, canUseAI: status.canUseAI })
      }
    }
    checkLimits()
  }, [])

  const handleImage = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const analyzeWithAI = async (e: any) => {
    e.preventDefault()
    if (!userStats.canUseAI) return Swal.fire('ميزة حصرية', 'تحليل المنتجات بالذكاء الاصطناعي متاح لمشتركي باقة البيزنس فقط.', 'info')
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
        setForm(prev => ({ ...prev, name: data.name || prev.name, description: data.description || prev.description, price: data.suggested_price?.toString() || prev.price, category: data.category || prev.category }))
      }
      reader.readAsDataURL(imageFile)
    } catch (err) { console.error(err) } finally { setAiLoading(false) }
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    if (saving) return
    if (!userStats.isUnlimited && userStats.count >= 5) return Swal.fire('وصلت للحد الأقصى!', 'الباقة المجانية تسمح بـ 5 منتجات فقط.', 'warning')
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
        user_id: user.id, name: form.name.trim(), price: parseFloat(form.price), cost: form.cost ? parseFloat(form.cost) : 0,
        stock: parseInt(form.stock) || 0, stock_quantity: parseInt(form.stock) || 0,
        description: form.description, category: form.category || null, image_url: imageUrl, is_active: true
      })
      if (saveErr) throw saveErr
      await Swal.fire('تم الحفظ!', 'منتجك الآن متاح في المتجر', 'success')
      router.push('/dashboard/products')
      router.refresh()
    } catch (err: any) { Swal.fire('خطأ', err.message, 'error') } finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-up" style={{ color: 'white', padding: '1.2rem', maxWidth: '500px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems:'center' }}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
           <button onClick={() => router.back()} style={{ background: '#111', border: '1px solid #222', color: '#666', padding: '10px', borderRadius: '15px' }}><ArrowRight size={22} /></button>
           <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D4AF37', letterSpacing: '-0.5px' }}>إضافة منتج ذكي</h1>
        </div>
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '8px 15px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(212, 175, 55, 0.2)', color: '#D4AF37', fontWeight: 700 }}>
           {userStats.plan}: {userStats.isUnlimited ? '∞' : `${userStats.count}/5`}
        </div>
      </header>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {/* منطقة الصورة الاحترافية */}
        <div onClick={() => galleryRef.current?.click()} style={{ background: '#080808', height: '220px', borderRadius: '2rem', border: '2px dashed #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', transition: '0.3s', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {imagePreview ? <img src={imagePreview} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{textAlign:'center', opacity: 0.4}}><Upload size={40} color="#D4AF37" /><p style={{fontSize:'0.8rem', marginTop:'12px', fontWeight: 600}}>اضغط لرفع صورة المنتج</p></div>}
        </div>

        {/* أزرار التحكم السريع */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '12px' }}>
            <button onClick={(e) => { e.preventDefault(); cameraRef.current?.click() }} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '15px', borderRadius: '18px', display:'flex', justifyContent:'center' }}><Camera size={24} /></button>
            <button onClick={(e) => { e.preventDefault(); galleryRef.current?.click() }} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '15px', borderRadius: '18px', display:'flex', justifyContent:'center' }}><ImageIcon size={24} /></button>
            <button onClick={analyzeWithAI} disabled={!imageFile || aiLoading} style={{ background: aiLoading ? '#111' : userStats.canUseAI ? 'linear-gradient(45deg, #D4AF37, #FBF5B7)' : '#1a1a1a', color: userStats.canUseAI ? '#000' : '#444', border: 'none', padding: '15px', borderRadius: '18px', fontWeight: 900, position: 'relative', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow: userStats.canUseAI ? '0 4px 15px rgba(212,175,55,0.3)' : 'none' }}>
              {aiLoading ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={20} /> {!userStats.canUseAI && <Lock size={14} />} ذكاء اصطناعي</>}
            </button>
        </div>

        {/* فورم البيانات */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222', display: 'grid', gap: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <div style={{position:'relative'}}>
            <input placeholder="اسم المنتج الفخم *" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff', fontSize:'1rem' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'5px 12px'}}>
              <label style={{fontSize:'0.6rem', color:'#444', fontWeight:700}}>السعر (ج.م)</label>
              <input type="number" style={{ width: '100%', background: 'transparent', border: 'none', padding: '5px 0', color: '#D4AF37', fontWeight:900, outline:'none' }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'5px 12px'}}>
              <label style={{fontSize:'0.6rem', color:'#444', fontWeight:700}}>الكمية المتاحة</label>
              <input type="number" style={{ width: '100%', background: 'transparent', border: 'none', padding: '5px 0', color: '#fff', outline:'none' }} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          <textarea placeholder="اوصف منتجك بأسلوب جذاب..." style={{ width: '100%', height:'100px', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#ccc', fontSize:'0.9rem', lineHeight:'1.5' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(45deg, #D4AF37, #FBF5B7)', color: '#000', padding: '1.2rem', borderRadius: '1.5rem', fontWeight: 950, border: 'none', marginTop: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize:'1.1rem', boxShadow: '0 10px 25px rgba(212,175,55,0.4)' }}>
            {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={22} /> اعتماد المنتج</>}
          </button>
        </div>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
    </div>
  )
}
