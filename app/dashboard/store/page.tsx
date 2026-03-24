'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Copy, Check, ExternalLink, Store, Phone, Link as LinkIcon, Save, Sparkles } from 'lucide-react'
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
      Swal.fire({ 
        icon: 'warning', 
        title: 'بيانات ناقصة', 
        text: 'يا بطل، كمل بيانات متجرك عشان الزبائن يعرفوا يوصلوا لك', 
        background: '#0A0A0A', 
        color: '#fff',
        confirmButtonColor: '#D4AF37'
      })
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    let fixedPhone = phone.replace(/\s/g, '').replace('+', '')
    if (fixedPhone.startsWith('0')) fixedPhone = '2' + fixedPhone
    if (!fixedPhone.startsWith('2')) fixedPhone = '2' + fixedPhone

    const { error } = await supabase.from('profiles').update({
      username: username.toLowerCase().trim(),
      shop_name: shopName.trim(),
      phone: fixedPhone
    }).eq('id', user!.id)

    if (!error) {
        // تسجيل لوج في نظام العمليات تلقائياً
        await supabase.from('system_logs').insert([{
            user_id: user?.id,
            action: 'تعديل الهوية',
            table_name: 'profiles',
            details: `تم تحديث اسم المتجر إلى: ${shopName}`,
            severity: 'success'
        }])
    }

    setSaving(false)
    if (error) {
      Swal.fire({ icon: 'error', title: 'خطأ في الحفظ', text: error.message, background: '#0A0A0A', color: '#fff' })
    } else {
      Swal.fire({ 
        icon: 'success', 
        title: 'تم التحديث بنجاح', 
        text: 'هوية متجرك الآن جاهزة ومتصلة بسيستم مزايا', 
        background: '#0A0A0A', 
        color: '#fff', 
        confirmButtonColor: '#D4AF37',
        timer: 2000
      })
    }
  }

  const inputStyle = {
    width: '100%',
    background: '#050505',
    border: '1px solid #222',
    padding: '14px',
    borderRadius: '12px',
    color: '#FFFFFF', // لون الكتابة صريح ومكشوف
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Store size={28} /> إعدادات متجر مزايا
        </h1>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>تحكم في اسم البراند ورابط البيع الخاص بك</p>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <div style={{ background: '#0A0A0A', padding: '2rem', borderRadius: '1.5rem', border: '1px solid #1a1a1a' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            
            {/* اسم البراند */}
            <div>
              <label style={{ display: 'block', color: '#D4AF37', fontSize: '0.8rem', marginBottom: '0.6rem', fontWeight: 700 }}>اسم البراند / النشاط التجاري</label>
              <input 
                value={shopName} 
                onChange={e => setShopName(e.target.value)} 
                style={inputStyle} 
                onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                onBlur={(e) => e.target.style.borderColor = '#222'}
                placeholder="مثلاً: متجر السعادة" 
              />
            </div>

            {/* معرف المتجر */}
            <div>
              <label style={{ display: 'block', color: '#D4AF37', fontSize: '0.8rem', marginBottom: '0.6rem', fontWeight: 700 }}>معرف المتجر (Username)</label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#050505', border: '1px solid #222', borderRadius: '12px', padding: '0 12px' }}>
                <span style={{ color: '#444', fontSize: '0.8rem', direction: 'ltr' }}>mzaya.run/store/</span>
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))} 
                  style={{ background: 'transparent', border: 'none', padding: '14px 5px', color: '#D4AF37', fontWeight: 700, flex: 1, outline: 'none' }} 
                />
              </div>
            </div>

            {/* واتساب الطلبات */}
            <div>
              <label style={{ display: 'block', color: '#D4AF37', fontSize: '0.8rem', marginBottom: '0.6rem', fontWeight: 700 }}>رقم واتساب استقبال الطلبات</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                <input 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  style={{ ...inputStyle, paddingRight: '45px' }} 
                  onFocus={(e) => e.target.style.borderColor = '#D4AF37'}
                  onBlur={(e) => e.target.style.borderColor = '#222'}
                  placeholder="01xxxxxxxxx" 
                />
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={saving} 
              style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', marginTop: '0.5rem', transition: '0.3s' }}
            >
              {saving ? <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"/> : <Save size={20} />}
              {saving ? 'جاري المزامنة...' : 'حفظ ونشر التعديلات'}
            </button>
          </div>
        </div>

        {/* كارت الرابط */}
        {username && (
          <div className="animate-fade-up" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, #0A0A0A 100%)', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid rgba(212,175,55,0.2)' }}>
             <h3 style={{ fontSize: '0.95rem', color: '#D4AF37', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
                <Sparkles size={18}/> رابط متجرك المباشر
             </h3>
             <div style={{ background: '#050505', padding: '1.2rem', borderRadius: '12px', border: '1px solid #222', marginBottom: '1.5rem', color: '#D4AF37', fontSize: '0.9rem', textAlign: 'center', wordBreak: 'break-all', fontWeight: 600 }}>
                {storeUrl}
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button 
                  onClick={() => { navigator.clipboard.writeText(storeUrl); setCopied(true); setTimeout(()=>setCopied(false), 2000) }} 
                  style={{ background: '#111', color: 'white', border: '1px solid #222', padding: '14px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                >
                  {copied ? <Check size={18} color="#2ECC71"/> : <Copy size={18}/>} 
                  {copied ? 'تم النسخ' : 'نسخ الرابط'}
                </button>
                <a 
                  href={storeUrl} 
                  target="_blank" 
                  style={{ background: '#D4AF37', color: '#000', padding: '14px', borderRadius: '12px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <ExternalLink size={18}/> معاينة المتجر
                </a>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
