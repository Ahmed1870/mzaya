'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function ReportsPage() {
  const supabase = createClient()
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // جلب 4 جداول في وقت واحد صح
      const [ { data: inv }, { data: wall }, { data: stats }, { data: prof } ] = await Promise.all([
        supabase.from('invoices').select('*').eq('user_id', user.id),
        supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('profiles').select('plan_name').eq('id', user.id).maybeSingle()
      ])
    }
    load()
  }, [])
  return <div className="p-6 text-white">صفحة التقارير جاهزة</div>
}
