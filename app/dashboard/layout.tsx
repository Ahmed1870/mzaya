import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'
import AIChat from '@/components/chat/AIChat'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, shop_name')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || user.email === 'xcm3108@gmail.com'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050505', fontFamily: "'IBM Plex Sans Arabic',sans-serif" }}>
      <DashboardShell user={user} profile={profile} isAdmin={isAdmin}>
        <AIChat shopName={profile?.shop_name || 'مزايا'} />
        {children}
      </DashboardShell>
    </div>
  )
}
