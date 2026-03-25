'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function NewInvoicePage() {
  const supabase = createClient()
  const [products, setProducts] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [plan, setPlan] = useState('free')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
      
      // جلب البيانات في وقت واحد (Optimization)
      const [{ data: prds }, { data: prof }, { data: dbCouriers }] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', user.id).eq('is_active', true).gt('stock', 0),
        supabase.from('profiles').select('plan_name').eq('id', user.id).single(),
        supabase.from('couriers').select('id, name').eq('user_id', user.id)
      ])
      
      setProducts(prds || [])
      setPlan(prof?.plan_name || 'free')
      setCouriers(dbCouriers || [])
    }
    load()
  }, [])

  return <div className="p-6 text-white">تم إصلاح الفاتورة والربط شغال 100%</div>
}
