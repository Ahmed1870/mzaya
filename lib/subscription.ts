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
  const dbValue = (profile?.plan_name || 'free').toLowerCase().trim()

  // فحص ذكي يقبل كل الصيغ (business, Business, بزنس, البيزنس)
  if (dbValue.includes('business') || dbValue.includes('بزنس')) currentPlan = 'business'
  else if (dbValue.includes('pro') || dbValue.includes('احترافية')) currentPlan = 'pro'

  const config = PLAN_CONFIGS[currentPlan]
  return {
    plan: currentPlan,
    label: config.label,
    isUnlimited: currentPlan !== 'free',
    canUseAI: config.canUseAI,
    count: 0 // سيتم تحديثه في الصفحة
  }
}
