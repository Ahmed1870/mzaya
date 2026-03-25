'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { getUserPlan } from '@/lib/plans'

export default function NewProductPage() {
  const supabase = createClient()
  const [userStats, setUserStats] = useState({ plan: 'جاري التحميل...', count: 0, isPremium: false, maxLimit: 10 })

  useEffect(() => {
    const checkLimits = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const plan = await getUserPlan(user.id);
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      setUserStats({ plan: plan.name, count: count || 0, isPremium: plan.isPremium, maxLimit: plan.max_products });
    };
    checkLimits()
  }, [])

  return <div className="p-6 text-white">إضافة منتج - الربط مع الخطط سليم</div>
}
