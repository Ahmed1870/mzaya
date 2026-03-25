'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { User, Phone, MapPin, Package, CheckCircle2, Search, LogOut, Navigation, MessageSquare, Wallet, Bike, ArrowRight } from 'lucide-react'

export default function CourierPage() {
  const supabase = createClient()
  const [couriers, setCouriers] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('couriers').select('*')
      setCouriers(data || [])
    }
    load()
  }, [])

  return (
    <div style={{ background: '#020202', color: '#fff', minHeight: '100vh', padding: '20px', direction: 'rtl' }}>
      <h1 style={{ color: '#D4AF37', fontWeight: 900, marginBottom: '30px' }}>قائمة المناديب</h1>
      <div style={{ display: 'grid', gap: '15px' }}>
        {couriers.map(courier => (
          <div key={courier.id} style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} color="#D4AF37" />
              </div>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 900, margin: 0 }}>{courier.name}</h2>
                <p style={{ color: '#666', fontSize: '0.8rem', margin: 0 }}>{courier.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
