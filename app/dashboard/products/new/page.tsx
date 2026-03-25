'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/plans'
import { Sparkles, Upload, ArrowRight, Camera, ImageIcon, Loader2, Lock } from 'lucide-react'
import Swal from 'sweetalert2'

export default function NewProductPage() {
  const router = useRouter()
  const supabase = createClient()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({ name: '', description: '', price: '', cost: '', stock: '0', category: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [userStats, setUserStats] = useState({ plan: 'جاري التحميل...', count: 0, isPremium: false, maxLimit: 10 })

  useEffect(() => {
  const checkLimits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const plan = await getUserPlan(user.id);
    const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id);
    setUserStats({ plan: plan.name, count: count || 0, isPremium: plan.isPremium, maxLimit: plan.max_products });
  };
      if (!user) return
      
      const { data: profile } = await supabase.from('profiles').select('plan_name').eq('id', user.id).maybeSingle()

      const { data: plan } = await supabase
        .from('subscription_plans')
        .select('max_products')
        .eq('plan_id', profile?.plan_name)
        .maybeSingle()

      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      
      const isPremium = profile?.plan_name !== 'مجاني'
      setUserStats({ 
        plan: profile?.plan_name || 'مجانية', 
        count: count || 0, 
        isPremium, 
        maxLimit: plan?.max_products || 10 
      })
    }
    checkLimits()
  }, [])

  const handleImage = (file: File) => {
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSave = async (e: any) => {
    e.preventDefault()
    if (saving) return

    if (!userStats.isPremium && userStats.count >= userStats.maxLimit) {
      return Swal.fire({
        title: 'وصلت للحد الأقصى! 🛑',
        text: `باقة "${userStats.plan}" تسمح بـ ${userStats.maxLimit} منتجات فقط.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ترقية الباقة 💎',
        confirmButtonColor: '#D4AF37',
        background: '#111',
        color: '#fff'
      }).then(res => { if(res.isConfirmed) router.push('/dashboard/subscription') })
    }

    if (!form.name || !form.price) return Swal.fire('تنبيه', 'برجاء كتابة اسم المنتج وسعره', 'warning')

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      let imageUrl = ''
      if (imageFile) {
        const path = `${user?.id}/${Date.now()}`
        await supabase.storage.from('product-images').upload(path, imageFile)
        imageUrl = supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl
      }
      if (userStats.count >= userStats.maxLimit) {
        setSaving(false);
        return Swal.fire({ icon: 'warning', title: 'عفواً، انتهت حدود باقتك', text: 'لقد وصلت للحد الأقصى للمنتجات المسموح بها في باقة ' + userStats.plan, background: '#0a0a0a', color: '#fff', confirmButtonColor: '#D4AF37' });
      }

      const { error } = await supabase.from('products').insert({
        user_id: user?.id, name: form.name.trim(), price: parseFloat(form.price), 
        cost: form.cost ? parseFloat(form.cost) : 0, stock: parseInt(form.stock) || 0, 
        description: form.description, image_url: imageUrl, is_active: true
      })
      if (error) throw error
      Swal.fire({ icon: 'success', title: 'تم الحفظ بنجاح', showConfirmButton: false, timer: 1500, background: '#111', color: '#fff' })
      router.push('/dashboard/products')
      router.refresh()
    } catch (err: any) { Swal.fire('خطأ', err.message, 'error') } finally { setSaving(false) }
  }

  return (
    <div style={{ color: 'white', padding: '1.2rem', maxWidth: '500px', margin: '0 auto', direction: 'rtl' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems:'center' }}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
           <button onClick={() => router.back()} style={{ background: '#111', border: '1px solid #222', color: '#666', padding: '10px', borderRadius: '15px' }}><ArrowRight size={22} /></button>
           <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D4AF37' }}>إضافة منتج ذكي</h1>
        </div>
        <div style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '8px 15px', borderRadius: '20px', fontSize: '0.75rem', border: '1px solid rgba(212, 175, 55, 0.2)', color: '#D4AF37', fontWeight: 700 }}>
           {userStats.isPremium ? 'باقة غير محدودة' : `${userStats.count} / ${userStats.maxLimit}`}
        </div>
      </header>
      <div style={{ display: 'grid', gap: '1.2rem' }}>
        <div onClick={() => galleryRef.current?.click()} style={{ background: '#080808', height: '220px', borderRadius: '2rem', border: '2px dashed #222', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
          {imagePreview ? <img src={imagePreview} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="preview" /> : <div style={{textAlign:'center', opacity: 0.4}}><Upload size={40} color="#D4AF37" /><p style={{fontSize:'0.8rem', marginTop:'12px'}}>رفع صورة</p></div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '12px' }}>
            <button onClick={() => cameraRef.current?.click()} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '15px', borderRadius: '18px', display:'flex', justifyContent:'center' }}><Camera size={24} /></button>
            <button onClick={() => galleryRef.current?.click()} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '15px', borderRadius: '18px', display:'flex', justifyContent:'center' }}><ImageIcon size={24} /></button>
            <button disabled={!userStats.isPremium} style={{ background: userStats.isPremium ? 'linear-gradient(45deg, #D4AF37, #FBF5B7)' : '#1a1a1a', color: userStats.isPremium ? '#000' : '#444', border: 'none', padding: '15px', borderRadius: '18px', fontWeight: 900, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
              <Sparkles size={20} /> AI {!userStats.isPremium && <Lock size={14} />}
            </button>
        </div>
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '2rem', border: '1px solid #222', display: 'grid', gap: '1rem' }}>
          <input placeholder="اسم المنتج" style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff', outline:'none' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div style={{background:'#050505', borderRadius:'15px', border:'1px solid #222', padding:'5px 10px'}}>
              <label style={{fontSize:'0.55rem', color:'#444'}}>البيع</label>
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
          <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(45deg, #D4AF37, #FBF5B7)', color: '#000', padding: '1.2rem', borderRadius: '1.5rem', fontWeight: 950, border: 'none', cursor: 'pointer', display:'flex', justifyContent:'center' }}>
            {saving ? <Loader2 className="animate-spin" /> : 'اعتماد المنتج'}
          </button>
        </div>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
    </div>
  )
}
