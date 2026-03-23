import { createClient } from '@/lib/supabase'

export const PLAN_CONFIGS = {
  free: { label: 'الباقة المجانية', maxProducts: 5, canUseAI: false },
  pro: { label: 'الباقة الاحترافية', maxProducts: 999999, canUseAI: false },
  business: { label: 'باقة البيزنس', maxProducts: 999999, canUseAI: true }
}

export async function getSubscriptionStatus() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('plan_name').eq('id', user.id).single()
  
  let currentPlan: 'free' | 'pro' | 'business' = 'free'
  const dbValue = (profile?.plan_name || '').trim()

  // الربط المباشر مع مسميات سوبا بيز اللي في الصورة
  if (dbValue === 'احترافية' || dbValue.toLowerCase().includes('pro')) {
    currentPlan = 'pro'
  } else if (dbValue === 'بزنس' || dbValue === 'البيزنس' || dbValue.toLowerCase().includes('business')) {
    currentPlan = 'business'
  }

  const config = PLAN_CONFIGS[currentPlan]
  return {
    plan: currentPlan,
    label: config.label,
    isUnlimited: currentPlan !== 'free',
    canUseAI: config.canUseAI,
    count: 0 
  }
}
