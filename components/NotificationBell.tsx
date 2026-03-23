'use client'
import { Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
      setUnreadCount(count || 0)
    }
    fetchUnread()

    const channel = supabase.channel(`bell-sync-${userId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications', 
        filter: `user_id=eq.${userId}` 
      }, () => setUnreadCount(prev => prev + 1))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <div style={{ 
      position: 'relative', 
      cursor: 'pointer', 
      padding: '10px', 
      background: '#0a0a0a', 
      borderRadius: '14px', 
      border: '1px solid #1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1a1a1a'}
    >
      <Bell size={20} color={unreadCount > 0 ? '#d4af37' : '#666'} strokeWidth={unreadCount > 0 ? 2.5 : 2} />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute', top: '-2px', right: '-2px',
          background: 'linear-gradient(45deg, #ff4b2b, #ff416c)', 
          color: '#fff', fontSize: '10px',
          padding: '2px 5px', borderRadius: '50%', fontWeight: '900',
          border: '2px solid #050505',
          boxShadow: '0 0 10px rgba(255, 75, 43, 0.5)'
        }}>
          {unreadCount > 9 ? '+9' : unreadCount}
        </span>
      )}
    </div>
  )
}
