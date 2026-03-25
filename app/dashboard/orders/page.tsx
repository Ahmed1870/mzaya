'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function OrdersPage() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [businessName, setBusinessName] = useState('متجري')

  useEffect(() => {
    async function loadOrders() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { data: dbInvoices }] = await Promise.all([
        supabase.from('profiles').select('business_name').eq('id', user.id).maybeSingle(),
        supabase.from('invoices').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      ])

      setBusinessName(profile?.business_name || 'متجري')
      setOrders(dbInvoices || [])
    }
    loadOrders()
  }, [])

  return <div className="p-6 text-white">قائمة الطلبات - السيستم محدث</div>
}
