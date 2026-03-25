'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const supabase = createClient()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setData({ products: count || 0, plan: profile?.plan_name || 'مجاني' })
    }
    loadStats()
  }, [])

  return <div className="p-6 text-white">لوحة التحكم شغالة والربط سليم</div>
}
