import { createClient } from '@/lib/supabase'

export const PLAN_CONFIGS = {
  free: {
    label: 'الباقة المجانية',
    maxProducts: 5,
    canSeeCRM: false,
    canSeeAds: false,
    canUseAI: false,
    price: 0
  },
  pro: {
    label: 'الباقة الاحترافية',
    maxProducts: 999999,
    canSeeCRM: true,
    canSeeAds: false,
    canUseAI: false,
    price: 99
  },
  business: {
    label: 'باقة البيزنس',
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

  // المترجم الذكي الخارق: بيحول أي نص لـ lowercase وبيمسح المسافات
  let currentPlan: PlanType = 'free'
  const dbValue = (profile?.plan_name || 'free').toLowerCase().trim();

  // مخرجات Supabase المحتملة (عربي/إنجليزي/كبير/صغير)
  const isPro = ['pro', 'professional', 'احترافية', 'الاحترافية', 'الاحترافيه'].some(v => dbValue.includes(v));
  const isBusiness = ['business', 'biz', 'بزنس', 'البيزنس', 'بيزنس'].some(v => dbValue.includes(v));

  if (isBusiness) {
    currentPlan = 'business';
  } else if (isPro) {
    currentPlan = 'pro';
  }

  const config = PLAN_CONFIGS[currentPlan];

  return {
    plan: currentPlan,
    label: config.label,
    limits: config,
    isUnlimited: currentPlan === 'business' || currentPlan === 'pro',
    canUseAI: config.canUseAI
  }
}
