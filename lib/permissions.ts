import { createClient } from '@/lib/supabase'

export async function checkAccess(userId: string) {
  const supabase = createClient()
  
  // 1. جلب بروفايل التاجر (الخطة الحالية)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, subscription_plans(*)')
    .eq('id', userId)
    .single()

  const plan = profile?.subscription_plans
  const isAdmin = profile?.role === 'admin'

  // 2. قانون العسكري (التفرقة الحرفية)
  return {
    // البيانات الأساسية
    planName: profile?.plan_name,
    isAdmin,
    
    // 🚚 المناديب (مسموح لو فيه عدد مسموح به في الباقة)
    canManageCouriers: (plan?.max_couriers > 0) || isAdmin,
    maxCouriers: plan?.max_couriers || 0,

    // 📡 رادار العملاء
    canUseRadar: plan?.has_radar === true || isAdmin,

    // 📊 التقارير المتقدمة
    canViewReports: plan?.has_advanced_reports === true || isAdmin,

    // 📦 المنتجات (مراقبة الحد الأقصى)
    maxProducts: plan?.max_products || 10,
    
    // 💳 الفواتير (ميزة أساسية تفتح للكل أو تقيدها هنا)
    canCreateInvoices: true, 

    // حالة الاشتراك
    isSubscriptionActive: profile?.subscription_status === 'active' || isAdmin
  }
}
