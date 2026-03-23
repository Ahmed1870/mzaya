'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Shield, Activity, Search, Filter, Clock, Box } from 'lucide-react'

export default function LogsPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('system_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)
    setLogs(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    setFiltered(logs.filter(l => l.action?.includes(term) || l.details?.includes(term)))
  }, [search, logs])

  const getActionStyle = (action: string) => {
    if (action.includes('حذف')) return { bg: '#e74c3c20', color: '#e74c3c' }
    if (action.includes('إضافة')) return { bg: '#2ecc7120', color: '#2ecc71' }
    if (action.includes('تعديل')) return { bg: '#f1c40f20', color: '#f1c40f' }
    return { bg: '#D4AF3720', color: '#D4AF37' }
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}><div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/></div>

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={26} /> سجل العمليات
        </h1>
        <p style={{ color: '#444', fontSize: '0.85rem' }}>مراقبة نشاط المتجر لحظة بلحظة</p>
      </header>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
        <input style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '0.9rem 2.8rem 0.9rem 1rem', borderRadius: '15px', color: '#fff' }} 
          placeholder="ابحث عن عملية (حذف، تعديل...)" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#444' }}>
            <Activity size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>لا توجد سجلات مطابقة</p>
          </div>
        ) : (
          filtered.map((log) => {
            const style = getActionStyle(log.action)
            const date = new Date(log.created_at)
            return (
              <div key={log.id} style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: style.bg, color: style.color, padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                    {log.action}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#ccc', margin: 0 }}>{log.details}</p>
                <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '0.8rem', fontSize: '0.7rem', color: '#444' }}>
                   {date.toLocaleDateString('ar-EG')}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
