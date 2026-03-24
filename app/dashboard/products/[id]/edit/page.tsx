'use client'
import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Sparkles, Upload, ArrowRight, Camera, ImageIcon, CheckCircle2, Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', stock: '0', category: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      if (data) {
        setForm({
          name: data.name,
          description: data.description || '',
          price: data.price.toString(),
          cost: data.cost?.toString() || '0',
          stock: data.stock?.toString() || '0',
          category: data.category || ''
        })
        setImagePreview(data.image_url || '')
      }
      setLoading(false)
    }
    loadProduct()
  }, [id])

  const handleUpdate = async (e: any) => {
    e.preventDefault()
    if (saving) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      let imageUrl = imagePreview
      if (imageFile) {
        const path = `${user?.id}/${Date.now()}`
        await supabase.storage.from('product-images').upload(path, imageFile)
        imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      }

      await supabase.from('products').update({
        name: form.name.trim(), price: parseFloat(form.price),
        cost: parseFloat(form.cost), stock: parseInt(form.stock),
        description: form.description, image_url: imageUrl
      }).eq('id', id)

      Swal.fire({ icon: 'success', title: 'تم التحديث', background: '#111', color: '#fff', timer: 1500, showConfirmButton: false })
      router.push('/dashboard/products')
    } catch (err: any) { Swal.fire('خطأ', err.message, 'error') } finally { setSaving(false) }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><Loader2 className="animate-spin" color="#D4AF37" /></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', padding: '1.2rem', maxWidth: '500px', margin: '0 auto', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems:'center' }}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
           <button onClick={() => router.back()} style={{ background: '#111', border: '1px solid #222', color: '#666', padding: '10px', borderRadius: '15px' }}><ArrowRight size={22} /></button>
           <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D4AF37' }}>تعديل المنتج</h1>
        </div>
      </header>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        <div onClick={() => galleryRef.current?.click()} style={{ background: '#080808', height: '220px', borderRadius: '2rem', border: '2px dashed #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
          {imagePreview ? <img src={imagePreview} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={{textAlign:'center', opacity: 0.4}}><Upload size={40} color="#D4AF37" /></div>}
        </div>

        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222', display: 'grid', gap: '1rem' }}>
          <input placeholder="اسم المنتج" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'5px 10px'}}>
              <label style={{fontSize:'0.55rem', color:'#444'}}>سعر البيع</label>
              <input type="number" style={{ width: '100%', background: 'transparent', border: 'none', color: '#D4AF37', fontWeight:900, outline:'none' }} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
            </div>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'5px 10px'}}>
              <label style={{fontSize:'0.55rem', color:'#444'}}>التكلفة</label>
              <input type="number" style={{ width: '100%', background: 'transparent', border: 'none', color: '#e74c3c', fontWeight:900, outline:'none' }} value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'5px 10px'}}>
              <label style={{fontSize:'0.55rem', color:'#444'}}>الكمية</label>
              <input type="number" style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline:'none' }} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>
          <button onClick={handleUpdate} disabled={saving} style={{ background: 'linear-gradient(45deg, #D4AF37, #FBF5B7)', color: '#000', padding: '1.2rem', borderRadius: '1.5rem', fontWeight: 950, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            {saving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={20} /> تحديث البيانات</>}
          </button>
        </div>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} />
    </div>
  )
}
