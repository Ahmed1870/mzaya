'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import DashboardShell from '@/components/dashboard/DashboardShell'
import AIChat from '@/components/chat/AIChat'
import Swal from 'sweetalert2'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
        setProfile(data)
      }
      setLoading(false)
    }
    getUserData()
  }, [])

  useEffect(() => {
    if (!user?.id) return

    // الرادار اللحظي: بيراقب تغيير الباقة في جدول البروفايل
    const channel = supabase.channel(`plan-sync-${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `id=eq.${user.id}` 
      }, (payload) => {
        const newPlan = payload.new.plan_name
        const oldPlan = payload.old.plan_name

        if (newPlan !== oldPlan) {
          setProfile(payload.new)
          
          Swal.fire({
            title: '🎊 مبروك يا بطل!',
            text: `تم تفعيل باقة "${newPlan}" بنجاح. استمتع بمميزاتك الجديدة الآن!`,
            icon: 'success',
            background: '#050505',
            color: '#fff',
            confirmButtonColor: '#d4af37',
            confirmButtonText: 'ممتاز!',
            backdrop: `rgba(212, 175, 55, 0.2)`
          }).then(() => {
             window.location.reload() 
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id, supabase])

  if (loading) return null

  const isAdmin = profile?.role === 'admin' || user?.email === 'xcm3108@gmail.com'
  // السيستم بيفهم لوحده: لو بيزنس أو أدمن يفتح الـ AI
  const canUseAI = profile?.plan_name === 'البيزنس' || isAdmin

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', fontFamily: "'IBM Plex Sans Arabic',sans-serif" }}>
      <DashboardShell user={user} profile={profile} isAdmin={isAdmin}>
        {canUseAI && <AIChat />}
        {children}
      </DashboardShell>
    </div>
  )
}
