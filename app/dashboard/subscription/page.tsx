'use client'
import { createClient } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { getSubscriptionStatus } from '@/lib/subscription'
import { Crown, Zap, CheckCircle2, Star } from 'lucide-react'
import Swal from 'sweetalert2'

export default function SubscriptionPage() {
  const supabase = createClient()
  const [currentPlanLabel, setCurrentPlanLabel] = useState('تحميل...')

  useEffect(() => {
    async function init() {
      const status = await getSubscriptionStatus()
      setCurrentPlanLabel(status?.label || 'المجانية')
    }
    init()
  }, [])

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '40px 20px', direction: 'rtl' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#d4af37' }}>مزايا بريميوم</h1>
        <div style={{ marginTop: '20px', background: 'rgba(212, 175, 55, 0.1)', padding: '12px 30px', borderRadius: '50px', border: '1px solid #d4af3733', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
          <Star size={18} color="#d4af37" />
          باقتك الحالية: <span style={{ color: '#d4af37', fontWeight: '900' }}>{currentPlanLabel}</span>
        </div>
      </div>
      {/* باقي الـ UI بتاعك زي ما هو */}
    </div>
  )
}
