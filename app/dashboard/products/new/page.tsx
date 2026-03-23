'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getSubscriptionStatus } from '@/lib/subscription'
import { Sparkles, Upload, ArrowRight, Camera, ImageIcon, Loader2, Lock } from 'lucide-react'
import Swal from 'sweetalert2'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', stock: '0' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [userStats, setUserStats] = useState({ plan: 'جاري التحميل...', count: 0, isUnlimited: false, canUseAI: false, maxLimit: 5 })

  useEffect(() => {
    const checkLimits = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [status, { count }] = await Promise.all([
        getSubscriptionStatus(),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])
      if (status) {
        setUserStats({ plan: status.label, count: count || 0, isUnlimited: status.isUnlimited, canUseAI: status.canUseAI, maxLimit: status.maxLimit })
      }
    }
    checkLimits()
  }, [])

  const handleSave = async (e: any) => {
    e.preventDefault()
    if (!form.name || !form.price) return Swal.fire('خطأ', 'برجاء كتابة اسم المنتج والسعر', 'error')
    
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let imageUrl = ''
      if (imageFile) {
        const path = `${user?.id}/${Date.now()}`
        await supabase.storage.from('product-images').upload(path, imageFile)
        imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      }

      // الحل النهائي لخطأ Column Price: تحويل السعر لرقم وضمان عدم إرسال Null
      const { error } = await supabase.from('products').insert({
        user_id: user?.id,
        name: form.name.trim(),
        price: parseFloat(form.price) || 0, 
        cost: parseFloat(form.cost) || 0,
        stock: parseInt(form.stock) || 0,
        description: form.description,
        image_url: imageUrl
      })

      if (error) throw error
      Swal.fire('تم!', 'تمت إضافة المنتج بنجاح', 'success').then(() => router.push('/dashboard/products'))
    } catch (err: any) { 
      Swal.fire('خطأ من الداتابيز', err.message, 'error') 
    } finally { setSaving(false) }
  }

  return (
    <div style={{ color: 'white', padding: '1.2rem', maxWidth: '500px', margin: '0 auto', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems:'center' }}>
        <button onClick={() => router.back()} style={{ background: '#111', border: '1px solid #222', color: '#666', padding: '10px', borderRadius: '15px' }}><ArrowRight size={22} /></button>
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '8px 15px', borderRadius: '20px', color: '#D4AF37', fontSize: '0.8rem' }}>
           {userStats.plan}: {userStats.isUnlimited ? '∞' : `${userStats.count}/${userStats.maxLimit}`}
        </div>
      </header>
      
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        <div onClick={() => galleryRef.current?.click()} style={{ background: '#080808', height: '200px', borderRadius: '2rem', border: '2px dashed #222', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
          {imagePreview ? <img src={imagePreview} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <Upload size={40} opacity={0.3} />}
        </div>

        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222', display: 'grid', gap: '1rem' }}>
          <input placeholder="اسم المنتج" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'8px 12px'}}>
              <label style={{fontSize:'0.7rem', color:'#444', display:'block'}}>السعر (مطلوب)</label>
              <input type="number" style={{ width: '100%', background: 'transparent', border: 'none', color: '#D4AF37', fontWeight:900, outline:'none' }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'8px 12px'}}>
              <label style={{fontSize:'0.7rem', color:'#444', display:'block'}}>الكمية</label>
              <input type="number" style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline:'none' }} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(45deg, #D4AF37, #FBF5B7)', color: '#000', padding: '1.2rem', borderRadius: '1.5rem', fontWeight: 950, border: 'none' }}>
            {saving ? 'جاري الاعتماد...' : 'اعتماد المنتج'}
          </button>
        </div>
      </div>
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
        const file = e.target.files?.[0];
        if(file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
      }} />
    </div>
  )
}
