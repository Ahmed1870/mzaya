'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Sparkles, Copy, Check, Loader2, Target, Crown, Zap, Lock, ArrowUpCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'

export default function AdsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [platform, setPlatform] = useState('facebook')
  const [tone, setTone] = useState('شعبي شيك وبيّاع')
  const [loading, setLoading] = useState(false)
  const [ads, setAds] = useState<string[]>([])
  const [copied, setCopied] = useState<number|null>(null)
  const [stats, setStats] = useState({ plan: 'مجانية', used: 0, limit: 5, isPremium: false })

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [prodRes, profRes] = await Promise.all([
      supabase.from('products').select('id,name,price,description').eq('user_id', user.id),
      supabase.from('profiles').select('plan_name, ads_generated').eq('id', user.id).single()
    ])
    
    setProducts(prodRes.data || [])
    if (profRes.data) {
      const plan = profRes.data.plan_name || 'مجانية'
      const isPremium = plan === 'البيزنس' || plan === 'الاحترافية'
      setStats({
        plan: plan,
        used: profRes.data.ads_generated || 0,
        limit: plan === 'البيزنس' ? 9999 : plan === 'الاحترافية' ? 50 : 5,
        isPremium
      })
    }
  }

  useEffect(() => { init() }, [])

  const generateAds = async () => {
    if (!selectedProduct) return Swal.fire({ icon: 'warning', title: 'اختار منتج الأول', background: '#111', color: '#fff' })
    
    // حماية الرصيد
    if (stats.used >= stats.limit) {
      return Swal.fire({ 
        icon: 'error', 
        title: 'خلصت رصيدك 🛑', 
        text: 'لقد استهلكت جميع المحاولات المتاحة لباقكتك حالياً.', 
        showCancelButton: true,
        confirmButtonText: 'ترقية الباقة الآن 💎',
        confirmButtonColor: '#D4AF37',
        background: '#111', 
        color: '#fff' 
      }).then(res => { if(res.isConfirmed) router.push('/dashboard/subscription') })
    }

    setLoading(true)
    const product = products.find(p => p.id === selectedProduct)

    try {
      const res = await fetch('/api/ai/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: product.name, productDesc: product.description, platform, tone, targetAudience })
      })
      const data = await res.json()
      if (data.result) {
        setAds([data.result, ...ads])
        const { data: { user } } = await supabase.auth.getUser()
        await supabase.from('profiles').update({ ads_generated: stats.used + 1 }).eq('id', user?.id)
        setStats(prev => ({ ...prev, used: prev.used + 1 }))
        Swal.fire({ icon: 'success', title: 'تم توليد الإعلان بنجاح ✨', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, background: '#111', color: '#fff' })
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'عفواً', text: 'الخدمة مشغولة حالياً، حاول مرة أخرى', background: '#111', color: '#fff' })
    } finally { setLoading(false) }
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem', direction: 'rtl' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={28} /> مولد الإعلانات الذكي 
            <span style={{fontSize:'0.65rem', background: stats.isPremium ? '#1ed760' : '#D4AF37', color:'#000', padding:'3px 10px', borderRadius:'12px', fontWeight: 900}}>
              باقة {stats.plan}
            </span>
          </h1>
          <p style={{ color: '#444', fontSize: '0.85rem', marginTop: '5px' }}>حوّل بيانات منتجك إلى إعلان بيّاع بضغطة زر</p>
        </div>
        
        <div style={{ background: '#111', padding: '12px 20px', borderRadius: '18px', border: '1px solid #D4AF3730', textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>الرصيد المتبقي</div>
          <div style={{ color: stats.used >= stats.limit ? '#ff4444' : '#D4AF37', fontWeight: 900, fontSize: '1.1rem' }}>
            {stats.isPremium ? '∞ محاولات' : `${stats.limit - stats.used} محاولة`}
          </div>
        </div>
      </header>

      <div style={{ background: '#0A0A0A', padding: '2rem', borderRadius: '2rem', border: '1px solid #222', marginBottom: '2rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'grid', gap: '1.2rem' }}>
          <div>
            <label style={{display:'block', marginBottom:'8px', fontSize:'0.8rem', color:'#666'}}>اختار المنتج المراد الترويج له</label>
            <select style={{width:'100%', padding:'1rem', background:'#000', color:'#fff', borderRadius:'15px', border:'1px solid #222', outline:'none', cursor:'pointer'}} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>
              <option value="">-- اضغط للاختيار --</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{display:'block', marginBottom:'8px', fontSize:'0.8rem', color:'#666'}}>الجمهور المستهدف</label>
            <div style={{position:'relative'}}>
              <Target size={18} style={{position:'absolute', right:'15px', top:'50%', transform:'translateY(-50%)', color:'#444'}} />
              <input placeholder="مثلاً: شباب مهتمين بالرياضة، ربات بيوت.." value={targetAudience} onChange={e => setTargetAudience(e.target.value)} style={{width:'100%', padding:'1rem 3rem 1rem 1rem', background:'#000', color:'#fff', borderRadius:'15px', border:'1px solid #222', outline:'none'}} />
            </div>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div>
              <label style={{display:'block', marginBottom:'8px', fontSize:'0.8rem', color:'#666'}}>المنصة</label>
              <select value={platform} onChange={e => setPlatform(e.target.value)} style={{width:'100%', padding:'0.9rem', background:'#000', color:'#fff', borderRadius:'15px', border:'1px solid #222', outline:'none'}}>
                <option value="facebook">فيسبوك</option>
                <option value="instagram">انستجرام</option>
                <option value="tiktok">تيك توك</option>
                <option value="whatsapp">واتساب (رسالة بيع)</option>
              </select>
            </div>
            <div>
              <label style={{display:'block', marginBottom:'8px', fontSize:'0.8rem', color:'#666'}}>لهجة الإعلان</label>
              <select value={tone} onChange={e => setTone(e.target.value)} style={{width:'100%', padding:'0.9rem', background:'#000', color:'#fff', borderRadius:'15px', border:'1px solid #222', outline:'none'}}>
                <option value="شعبي شيك وبيّاع">شعبي شيك وبيّاع</option>
                <option value="احترافي وفخم">احترافي وفخم</option>
                <option value="كوميدي وخفيف">كوميدي وخفيف</option>
                <option value="عاطفي ومؤثر">عاطفي ومؤثر</option>
              </select>
            </div>
          </div>

          <button onClick={generateAds} disabled={loading} style={{ width: '100%', padding: '1.2rem', borderRadius: '18px', border: 'none', background: 'linear-gradient(45deg, #D4AF37, #FBF5B7)', color: '#000', fontWeight: 950, cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', marginTop:'10px', boxShadow:'0 5px 15px rgba(212,175,55,0.2)' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={20} /> توليد الإعلان بالذكاء الاصطناعي 🚀</>}
          </button>
        </div>
      </div>

      <div style={{display:'grid', gap:'1.2rem'}}>
        {ads.length > 0 && <h2 style={{fontSize:'1.1rem', color:'#D4AF37', fontWeight:800}}>النتائج المولدة:</h2>}
        {ads.map((ad, i) => (
          <div key={i} className="animate-fade-left" style={{ background: '#111', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #222', position:'relative' }}>
            <p style={{whiteSpace:'pre-wrap', fontSize:'0.95rem', lineHeight:'1.7', color:'#ccc'}}>{ad}</p>
            <div style={{marginTop:'1.5rem', display:'flex', justifyContent:'flex-end'}}>
              <button onClick={() => handleCopy(ad, i)} style={{ background: copied === i ? '#1ed760' : '#222', color: copied === i ? '#000' : '#fff', border: 'none', padding: '8px 18px', borderRadius: '10px', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', transition:'0.3s' }}>
                {copied === i ? <><Check size={14} /> تم النسخ</> : <><Copy size={14} /> نسخ النص</>}
              </button>
            </div>
          </div>
        ))}
        {ads.length === 0 && !loading && (
          <div style={{textAlign:'center', padding:'4rem', opacity:0.2}}>
            <Sparkles size={60} style={{margin:'0 auto 1rem'}} />
            <p>املأ البيانات بالأعلى لتوليد أول إعلان لك</p>
          </div>
        )}
      </div>
    </div>
  )
}
