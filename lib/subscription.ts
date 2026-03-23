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

  // بناءً على صورك: العمود اسمه plan وليس plan_name
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status, subscription_end_date, max_products, role')
    .eq('id', user.id)
    .single()

  let currentPlan: 'free' | 'pro' | 'business' = 'free'
  const dbPlan = (profile?.plan || 'free').trim().toLowerCase()
  const status = profile?.subscription_status || 'inactive'
  
  const now = new Date()
  const endDate = profile?.subscription_end_date ? new Date(profile.subscription_end_date) : null
  const isExpired = endDate ? endDate < now : false

  if (status === 'active' && !isExpired) {
    if (dbPlan.includes('احترافية') || dbPlan.includes('pro')) {
      currentPlan = 'pro'
    } else if (dbPlan.includes('بزنس') || dbPlan.includes('بيزنس') || dbPlan.includes('business')) {
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
