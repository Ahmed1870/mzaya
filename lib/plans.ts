import { createClient } from './supabase'

export async function getUserPlan(userId: string) {
  const supabase = createClient()

  // 1. نجيب اسم الباقة من بروفايل المستخدم
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan_name')
    .eq('id', userId)
    .single()

  const planName = profile?.plan_name || 'مجاني'

  // 2. نجيب تفاصيل الباقة من جدول الـ subscriptions اللي إنت بعته
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('plan_id', planName)
    .single()

  // 3. نرجع Object موحد للسيستم كله
  return {
    name: planName,
    max_products: plan?.max_products || 10,
    max_couriers: plan?.max_couriers || 1,
    has_radar: plan?.has_radar || false,
    has_advanced_reports: plan?.has_advanced_reports || false,
    isPremium: planName !== 'مجاني'
  }
}
