'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useSubscription() {
  const supabase = createClient()
  const [data, setData] = useState({ plan: 'مجانية', trials: 0, loading: true })

  useEffect(() => {
    async function getSub() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('plan_name, trial_count').eq('id', user.id).single()
        setData({ 
          plan: profile?.plan_name || 'مجانية', 
          trials: profile?.trial_count || 0, 
          loading: false 
        })
      }
    }
    getSub()
  }, [])

  return data
}
