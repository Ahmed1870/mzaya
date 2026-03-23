import { createClient } from '@/lib/supabase'

export const PLAN_CONFIGS = {
  free: { label: 'المجانية', maxProducts: 5, canUseAI: false },
  pro: { label: 'الاحترافية', maxProducts: 999999, canUseAI: false },
  business: { label: 'البيزنس', maxProducts: 999999, canUseAI: true }
}

export async function getSubscriptionStatus() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_name, subscription_status, end_subscription, max_products, role')
    .eq('id', user.id)
    .single()

  let currentPlan: 'free' | 'pro' | 'business' = 'free'
  const dbPlanName = (profile?.plan_name || '').trim()
  const status = profile?.subscription_status || 'inactive'
  
  const now = new Date()
  const endDate = profile?.end_subscription ? new Date(profile.end_subscription) : null
  const isExpired = endDate ? endDate < now : false

  if (status === 'active' && !isExpired) {
    if (dbPlanName === 'احترافية' || dbPlanName.toLowerCase().includes('pro')) {
      currentPlan = 'pro'
    } else if (dbPlanName.includes('بزنس') || dbPlanName.includes('بيزنس') || dbPlanName.toLowerCase().includes('business')) {
      currentPlan = 'business'
    }
  }

  if (profile?.role === 'admin') currentPlan = 'business'

  const config = PLAN_CONFIGS[currentPlan]
  return {
    plan: currentPlan,
    label: config.label,
    maxLimit: currentPlan !== 'free' ? config.maxProducts : (profile?.max_products || 5),
    isUnlimited: currentPlan !== 'free',
    canUseAI: config.canUseAI
  }
}
