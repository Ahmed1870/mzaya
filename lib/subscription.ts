import { createClient } from '@/lib/supabase'

export const PLAN_CONFIGS = {
  free: { label: 'الباقة المجانية', maxProducts: 5, canUseAI: false },
  pro: { label: 'الباقة الاحترافية', maxProducts: 999999, canUseAI: false },
  business: { label: 'باقة البيزنس', maxProducts: 999999, canUseAI: true }
}

export async function getSubscriptionStatus() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { plan: 'free', label: 'غير مسجل', isUnlimited: false, canUseAI: false, count: 0 }

  const { data: profile } = await supabase.from('profiles').select('plan_name').eq('id', user.id).single()
  
  let currentPlan: 'free' | 'pro' | 'business' = 'free'
  // تحويل القيمة لـ String وتنظيفها تماماً
  const dbValue = String(profile?.plan_name || '').trim().toLowerCase()

  // الربط بناءً على الصورة اللي بعتها (احترافية = pro)
  if (dbValue.includes('احترافية') || dbValue.includes('pro')) {
    currentPlan = 'pro'
  } else if (dbValue.includes('بزنس') || dbValue.includes('business') || dbValue.includes('بيزنس')) {
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
