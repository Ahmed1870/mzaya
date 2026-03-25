'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export function useSubscription() {
  const supabase = createClient()
  const [data, setData] = useState({ 
    plan: 'مجاني', 
    limits: {
      max_products: 10,
      max_couriers: 1,
      has_radar: false,
      has_advanced_reports: false
    },
    loading: true 
  })

  useEffect(() => {
    async function getSub() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. جلب اسم الباقة من البروفايل
        const { data: profile } = await supabase.from('profiles').select('plan_name').eq('id', user.id).single()
        const planName = profile?.plan_name || 'مجاني'

        // 2. جلب مميزات الباقة من جدول الخطط
        const { data: planDetails } = await supabase.from('subscription_plans').select('*').eq('plan_id', planName).single()

        setData({
          plan: planName,
          limits: {
            max_products: planDetails?.max_products || 10,
            max_couriers: planDetails?.max_couriers || 1,
            has_radar: planDetails?.has_radar || false,
            has_advanced_reports: planDetails?.has_advanced_reports || false
          },
          loading: false
        })
      }
    }
    getSub()
  }, [])

  return data
}
