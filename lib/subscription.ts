import { createClient } from '@/lib/supabase'

// تعريف حدود الباقات في منظومة مزايا
export const PLAN_CONFIGS = {
  free: {
    label: 'الباقة المجانية',
    maxProducts: 10,
    canSeeCRM: false,
    canSeeAds: false,
    price: 0
  },
  pro: {
    label: 'الباقة الاحترافية',
    maxProducts: 100,
    canSeeCRM: true,
    canSeeAds: false,
    price: 99
  },
  business: {
    label: 'باقة البيزنس',
    maxProducts: 9999,
    canSeeCRM: true,
    canSeeAds: true,
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
    .select('plan_name, trial_count, ads_generated')
    .eq('id', user.id)
    .single()

  // التأكد من أن الخطة موجودة أو الرجوع للمجانية
  const currentPlan = (profile?.plan_name || 'free') as PlanType
  const config = PLAN_CONFIGS[currentPlan] || PLAN_CONFIGS.free

  return {
    plan: currentPlan,
    label: config.label,
    limits: config,
    stats: {
      trials: profile?.trial_count || 0,
      adsUsed: profile?.ads_generated || 0
    }
  }
}

// دالة سريعة للتحقق من الصلاحيات (التناغم الأمني)
export async function canAccess(feature: 'CRM' | 'Ads') {
  const status = await getSubscriptionStatus()
  if (!status) return false
  
  if (feature === 'CRM') return status.limits.canSeeCRM
  if (feature === 'Ads') return status.limits.canSeeAds
  return false
}
