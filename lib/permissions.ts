export function getPlanPermissions(plan: any) {
  // بنستخدم البيانات اللي جاية من الداتابيز مباشرة (Object اللي في lib/plans)
  return {
    maxProducts: plan?.max_products || 10,
    maxCouriers: plan?.max_couriers || 1,
    hasRadar: plan?.has_radar || false,
    hasAdvancedReports: plan?.has_advanced_reports || false,
    isPremium: plan?.isPremium || false
  }
}
