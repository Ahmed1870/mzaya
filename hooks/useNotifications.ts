'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Swal from 'sweetalert2'

export const useNotifications = (userId: string | undefined) => {
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { title, message, type } = payload.new
          
          // صوت إشعار خفيف لرفع الـ UX
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3')
          audio.play().catch(() => {})

          Swal.fire({
            title: `<span style="color: #d4af37; font-weight: 900; font-family: sans-serif;">${title}</span>`,
            html: `<span style="color: #ccc; font-family: sans-serif;">${message}</span>`,
            icon: type === 'wallet' ? 'success' : 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            background: '#0a0a0a',
            color: '#fff',
            customClass: {
              popup: 'border-gold-gradient'
            }
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])
}
