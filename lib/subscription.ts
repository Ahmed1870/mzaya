import { createClient } from '@/lib/supabase'

// المصدر الوحيد للحقيقة (Single Source of Truth)
export const PLAN_CONFIGS = {
  free: {
    label: 'المجانية',
    maxProducts: 5,
    canSeeCRM: false,
    canSeeAds: false,
    canUseAI: false,
    price: 0
  },
  pro: {
    label: 'الاحترافية',
    maxProducts: 999999,
    canSeeCRM: true,
    canSeeAds: false,
    canUseAI: false,
    price: 99
  },
  business: {
    label: 'البيزنس',
    maxProducts: 999999,
    canSeeCRM: true,
    canSeeAds: true,
    canUseAI: true,
    price: 199
  }
}

export type PlanType = keyof typeof PLAN_CONFIGS;

export async function getSubscriptionStatus() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_name')
    .eq('id', user.id)
    .single()

  // المترجم الذكي: بيحول الاسم العربي لاسم برمجي عشان السيستم يفهم
  let currentPlan: PlanType = 'free'
  const dbPlan = profile?.plan_name || 'free'
  
  if (dbPlan === 'احترافية' || dbPlan === 'pro') currentPlan = 'pro'
  else if (dbPlan === 'بزنس' || dbPlan === 'business') currentPlan = 'business'

  const config = PLAN_CONFIGS[currentPlan]

  return {
    plan: currentPlan,
    label: config.label,
    limits: config,
    isUnlimited: currentPlan === 'business' || currentPlan === 'pro',
    canUseAI: config.canUseAI
  }
}
