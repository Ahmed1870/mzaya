'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Bell, Trash2, CheckCircle, Clock, ArrowRight, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

export default function NotificationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const fetchNotifs = async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
    setNotifications(data || [])
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        await fetchNotifs(authUser.id)
        
        const channel = supabase.channel('page-sync')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${authUser.id}` }, 
          () => fetchNotifs(authUser.id))
          .subscribe()
        return () => { supabase.removeChannel(channel) }
      }
    }
    init()
  }, [])

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
    fetchNotifs(user.id)
  }

  const clearAll = async () => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "سيتم حذف جميع الإشعارات نهائياً",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4b2b',
      cancelButtonColor: '#333',
      confirmButtonText: 'نعم، احذف',
      background: '#0a0a0a',
      color: '#fff'
    })
    if (result.isConfirmed) {
      await supabase.from('notifications').delete().eq('user_id', user.id)
      setNotifications([])
    }
  }

  return (
    <div style={{ background: '#050505', minHeight: '100vh', color: '#fff', padding: '40px 20px', direction: 'rtl' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => router.back()} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}>
              <ArrowRight size={20} />
            </button>
            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#d4af37' }}>الإشعارات</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={markAllRead} style={{ background: '#111', border: '1px solid #222', color: '#ccc', padding: '10px 15px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}>تحديد الكل</button>
            <button onClick={clearAll} style={{ background: 'rgba(255, 75, 43, 0.1)', border: '1px solid rgba(255, 75, 43, 0.3)', color: '#ff4b2b', padding: '10px 15px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}>مسح الكل</button>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>جاري التحميل...</div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 20px', background: '#0a0a0a', borderRadius: '30px', border: '1px dashed #222' }}>
            <Bell size={50} color="#222" style={{ marginBottom: '20px' }} />
            <p style={{ color: '#666' }}>لا توجد إشعارات حالياً</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {notifications.map((n) => {
              const isSub = n.title?.includes('اشتراك') || n.type === 'subscription';
              const isWallet = n.type === 'wallet';
              
              return (
                <div key={n.id} style={{
                  background: n.is_read ? '#0a0a0a' : '#0f0f0f',
                  padding: '20px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: n.is_read ? '#1a1a1a' : (isSub ? '#d4af37' : '#222'),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      padding: '12px', 
                      background: isSub ? 'rgba(212, 175, 55, 0.1)' : isWallet ? 'rgba(30, 215, 96, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '15px'
                    }}>
                      {isSub ? <Star size={20} color="#d4af37" /> : isWallet ? <CheckCircle size={20} color="#1ed760" /> : <Bell size={20} color="#888" />}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', color: n.is_read ? '#888' : '#fff' }}>{n.title}</h3>
                      <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>{n.message}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#444', marginTop: '10px' }}>
                        <Clock size={12} /> {new Date(n.created_at).toLocaleString('ar-EG')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
