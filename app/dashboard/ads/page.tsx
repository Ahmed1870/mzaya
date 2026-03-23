'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Sparkles, Copy, Check, Loader2, Target, Crown, Zap } from 'lucide-react'
import Swal from 'sweetalert2'

export default function AdsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [platform, setPlatform] = useState('facebook')
  const [tone, setTone] = useState('شعبي شيك وبيّاع')
  const [loading, setLoading] = useState(false)
  const [ads, setAds] = useState<string[]>([])
  const [copied, setCopied] = useState<number|null>(null)
  const [stats, setStats] = useState({ plan: 'مجانية', used: 0, limit: 5 })

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
      setStats({
        plan: plan,
        used: profRes.data.ads_generated || 0,
        limit: plan === 'بزنس' ? 999999 : plan === 'احترافية' ? 100 : 5
      })
    }
  }

  useEffect(() => { init() }, [])

  const generateAds = async () => {
    if (!selectedProduct) return Swal.fire({ icon: 'warning', title: 'اختار منتج الأول', background: '#111', color: '#fff' })
    if (stats.used >= stats.limit) return Swal.fire({ icon: 'error', title: 'خلصت رصيدك', text: 'حدث باقتك عشان تكمل توليد إعلانات', background: '#111', color: '#fff' })

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
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'عفواً', text: 'الخدمة مشغولة، جرب كمان لحظة', background: '#111', color: '#fff' })
    } finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={28} /> مولد الإعلانات <span style={{fontSize:'0.6rem', background:'#D4AF37', color:'#000', padding:'2px 8px', borderRadius:'10px'}}>{stats.plan}</span>
          </h1>
        </div>
        <div style={{ background: '#111', padding: '10px 15px', borderRadius: '15px', border: '1px solid #D4AF3740' }}>
          <div style={{ fontSize: '10px', color: '#666' }}>رصيدك المتبقي</div>
          <div style={{ color: '#D4AF37', fontWeight: 900 }}>{stats.limit - stats.used} محاولة</div>
        </div>
      </header>

      <div style={{ background: '#0A0A0A', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #222', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <select className="input" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{width:'100%', padding:'0.8rem', background:'#000', color:'#fff', borderRadius:'12px', border:'1px solid #222'}}>
            <option value="">اختار المنتج...</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input className="input" placeholder="مين جمهورك؟ (بنات، شباب، تجار..)" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} style={{width:'100%', padding:'0.8rem', background:'#000', color:'#fff', borderRadius:'12px', border:'1px solid #222'}} />
          <button onClick={generateAds} disabled={loading} style={{ width: '100%', padding: '1rem', borderRadius: '15px', border: 'none', background: '#D4AF37', color: '#000', fontWeight: 900, cursor: 'pointer' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'توليد إعلان ذكي 🚀'}
          </button>
        </div>
      </div>

      <div style={{display:'grid', gap:'1rem'}}>
        {ads.map((ad, i) => (
          <div key={i} style={{ background: '#111', padding: '1.5rem', borderRadius: '1.2rem', border: '1px solid #222' }}>
            <p style={{whiteSpace:'pre-wrap', fontSize:'0.9rem', lineHeight:'1.6'}}>{ad}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
