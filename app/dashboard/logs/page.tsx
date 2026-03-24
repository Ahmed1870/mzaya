'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Shield, Activity, Search, Clock, Database, Tag } from 'lucide-react'

export default function LogsPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // الربط مع جدول system_logs الحقيقي من الداتا بيز
    const { data } = await supabase
      .from('system_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      
    setLogs(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const term = search.toLowerCase()
    setFiltered(logs.filter(l => 
      (l.action?.toLowerCase().includes(term)) || 
      (l.details?.toLowerCase().includes(term)) ||
      (l.table_name?.toLowerCase().includes(term))
    ))
  }, [search, logs])

  // نظام تلوين ذكي بناءً على الـ severity والـ action
  const getActionStyle = (log: any) => {
    const action = log.action || ''
    const severity = log.severity?.toLowerCase() || ''
    
    if (severity === 'error' || action.includes('حذف')) return { bg: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c' }
    if (severity === 'success' || action.includes('إضافة') || action.includes('INSERT')) return { bg: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71' }
    if (severity === 'warning' || action.includes('تعديل') || action.includes('UPDATE')) return { bg: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f' }
    return { bg: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37' }
  }

  if (loading) return (
    <div style={{display:'flex',justifyContent:'center',padding:'5rem'}}>
      <div className="animate-spin" style={{width:30,height:30,border:'3px solid #D4AF37',borderTopColor:'transparent',borderRadius:'50%'}}/>
    </div>
  )

  return (
    <div className="animate-fade-up" style={{ color: 'white', paddingBottom: '2rem', direction: 'rtl', fontFamily: 'Tajawal, sans-serif' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#D4AF37', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={26} /> سجل العمليات
        </h1>
        <p style={{ color: '#666', fontSize: '0.85rem' }}>مراقبة نشاط متجر مزايا لحظة بلحظة</p>
      </header>

      {/* Search Bar بنفس تصميمك */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
        <input 
          style={{ width: '100%', background: '#111', border: '1px solid #222', padding: '0.9rem 2.8rem 0.9rem 1rem', borderRadius: '15px', color: '#fff', outline: 'none' }} 
          placeholder="ابحث في السجلات (حذف، إضافة، اسم الجدول...)" 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#444' }}>
            <Activity size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>لا توجد سجلات مطابقة لنشاطك</p>
          </div>
        ) : (
          filtered.map((log) => {
            const style = getActionStyle(log)
            const date = new Date(log.created_at)
            return (
              <div key={log.id} style={{ background: '#111', padding: '1.2rem', borderRadius: '1.5rem', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '0.8rem', transition: '0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ background: style.bg, color: style.color, padding: '4px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Database size={12} /> {log.table_name}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: '#ccc', margin: 0, lineHeight: '1.4' }}>
                  {log.details || 'لا توجد تفاصيل مسجلة'}
                </p>
                
                <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: '0.7rem', color: '#444' }}>{date.toLocaleDateString('ar-EG')}</div>
                   {log.record_id && (
                     <div style={{ fontSize: '0.65rem', color: '#333', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <Tag size={10} /> ID: {log.record_id.substring(0, 8)}
                     </div>
                   )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
