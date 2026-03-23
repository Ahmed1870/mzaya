'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, User, Globe, Save, LogOut, ShieldCheck, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    business_name: '',
    full_name: '',
    currency: 'EGP',
    phone: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        if (data) setProfile({
          business_name: data.business_name || '',
          full_name: data.full_name || '',
          currency: data.currency || 'EGP',
          phone: data.phone || ''
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').upsert({
      id: user?.id,
      ...profile,
      updated_at: new Date().toISOString()
    })
    setSaving(false)
    if (!error) alert('تم حفظ هوية مزايا بنجاح ✨')
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '3rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37' }}>⚙️ إعدادات المنصة</h1>
        <p style={{ color: '#444', fontSize: '0.85rem' }}>تخصيص هوية متجرك على مزايا</p>
      </header>

      <div style={{ display: 'grid', gap: '1.2rem' }}>
        {/* المتجر */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>
            <Store size={18} /> هوية المتجر
          </div>
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <div className="input-group">
              <label style={{ fontSize: '0.7rem', color: '#444', display: 'block', marginBottom: '5px' }}>اسم النشاط (يظهر في الفواتير)</label>
              <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff' }} 
                value={profile.business_name} onChange={e => setProfile({...profile, business_name: e.target.value})} placeholder="مثلاً: براند أحمد للملابس" />
            </div>
            <div className="input-group">
              <label style={{ fontSize: '0.7rem', color: '#444', display: 'block', marginBottom: '5px' }}>عملة النظام</label>
              <select style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff' }}
                value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})}>
                <option value="EGP">جنيه مصري (EGP)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* الحساب */}
        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1.8rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#D4AF37', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>
            <User size={18} /> المدير المسؤول
          </div>
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem', borderRadius: '15px', color: '#fff' }} 
              value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} placeholder="الاسم الشخصي" />
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
              <input style={{ width: '100%', background: '#050505', border: '1px solid #222', padding: '1rem 2.8rem 1rem 1rem', borderRadius: '15px', color: '#fff' }} 
                value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="رقم واتساب الإرسال" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} style={{ background: 'linear-gradient(45deg, #D4AF37, #fbf5b7)', color: '#000', padding: '1.2rem', borderRadius: '18px', fontWeight: 900, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {saving ? 'جاري المزامنة...' : <><Save size={20} /> حفظ وتثبيت الهوية</>}
        </button>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} style={{ background: 'transparent', border: 'none', color: '#e74c3c', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <LogOut size={16} /> تسجيل خروج
          </button>
        </div>
      </div>
    </div>
  )
}
