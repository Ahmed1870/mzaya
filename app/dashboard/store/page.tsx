'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Copy, Check, ExternalLink, Store, Phone, Link as LinkIcon, Share2, Save } from 'lucide-react'
import Swal from 'sweetalert2'

export default function MyStorePage() {
  const supabase = createClient()
  const [username, setUsername] = useState('')
  const [shopName, setShopName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    async function loadStoreData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setUsername(data.username || '')
        setShopName(data.shop_name || data.full_name || '')
        setPhone(data.phone || '')
      }
    }
    loadStoreData()
  }, [])

  const storeUrl = username ? `${origin}/store/${username}` : ''

  const handleSave = async () => {
    if (!username.trim() || !shopName.trim() || !phone.trim()) {
      Swal.fire({ icon: 'error', title: 'بيانات ناقصة', text: 'يرجى ملء جميع الحقول الأساسية', background: '#050505', color: '#fff' })
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    // تنسيق الرقم
    let fixedPhone = phone.replace(/\s/g, '').replace('+', '')
    if (fixedPhone.startsWith('0')) fixedPhone = '2' + fixedPhone
    if (!fixedPhone.startsWith('2')) fixedPhone = '2' + fixedPhone

    const { error } = await supabase.from('profiles').update({
      username: username.toLowerCase().trim(),
      shop_name: shopName.trim(),
      phone: fixedPhone
    }).eq('id', user!.id)

    setSaving(false)
    if (error) {
      Swal.fire({ icon: 'error', title: 'خطأ في الحفظ', text: error.message, background: '#050505', color: '#fff' })
    } else {
      Swal.fire({ icon: 'success', title: 'تم التحديث', text: 'هوية متجرك الآن جاهزة ومتصلة بالسيستم', background: '#050505', color: '#fff', confirmButtonColor: '#D4AF37' })
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Store size={28} /> إعدادات الهوية والتواصل
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>إدارة العلامة التجارية ورابط متجرك المباشر</p>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ background: '#111', padding: '2rem', borderRadius: '1.5rem', border: '1px solid rgba(212,175,55,0.1)' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>اسم البراند / النشاط</label>
              <input value={shopName} onChange={e => setShopName(e.target.value)} style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '12px', borderRadius: '12px', color: 'white', outline: 'none' }} placeholder="مثلاً: فاشن ستور" />
            </div>

            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>معرف المتجر (يستخدم في الرابط)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#050505', border: '1px solid #222', borderRadius: '12px', padding: '0 12px' }}>
                <span style={{ color: '#444', fontSize: '0.8rem' }}>mzaya.run/store/</span>
                <input value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} style={{ background: 'transparent', border: 'none', padding: '12px 5px', color: '#D4AF37', fontWeight: 700, flex: 1, outline: 'none' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>رقم واتساب الطلبات</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '12px 12px 12px 40px', borderRadius: '12px', color: 'white', outline: 'none' }} placeholder="01xxxxxxxxx" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', marginTop: '1rem' }}>
              <Save size={18} /> {saving ? 'جاري المزامنة...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>

        {username && (
          <div style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(212,175,55,0.1)' }}>
             <h3 style={{ fontSize: '0.9rem', color: '#D4AF37', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}><LinkIcon size={16}/> رابط البيع الخاص بك</h3>
             <div style={{ background: '#050505', padding: '1rem', borderRadius: '12px', border: '1px solid #222', marginBottom: '1rem', color: '#D4AF37', fontSize: '0.85rem', wordBreak: 'break-all' }}>{storeUrl}</div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button onClick={() => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(()=>setCopied(false), 2000) }} style={{ background: '#111', color: 'white', border: '1px solid #222', padding: '12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {copied ? <Check size={16} color="#2ECC71"/> : <Copy size={16}/>} {copied ? 'تم النسخ' : 'نسخ الرابط'}
                </button>
                <a href={storeUrl} target="_blank" style={{ background: '#D4AF37', color: '#000', padding: '12px', borderRadius: '10px', textAlign: 'center', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <ExternalLink size={16}/> معاينة المتجر
                </a>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
