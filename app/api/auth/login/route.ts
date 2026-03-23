import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateEmail } from '@/lib/security'

const ADMIN_EMAIL = 'ahmedgomaelsayed@gmail.com'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const ip = req.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'بريد إلكتروني غير صالح' }, { status: 400 })
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Check lockout
    const { data: lockout } = await adminSupabase.from('account_lockouts').select('locked_until').eq('email', email).single()
    if (lockout && new Date(lockout.locked_until) > new Date()) {
      const min = Math.ceil((new Date(lockout.locked_until).getTime() - Date.now()) / 60000)
      return NextResponse.json({ error: `الحساب مقفل. حاول بعد ${min} دقيقة`, locked: true }, { status: 429 })
    }

    // Login
    const authClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data, error } = await authClient.auth.signInWithPassword({ email, password })

    // Log attempt
    await adminSupabase.from('login_attempts').insert({ email, ip_address: ip, success: !error })

    if (error) {
      const { count } = await adminSupabase.from('login_attempts').select('*', { count: 'exact', head: true })
        .eq('email', email).eq('success', false).gte('attempted_at', new Date(Date.now() - 15*60000).toISOString())

      if ((count || 0) >= 3) {
        await adminSupabase.from('account_lockouts').upsert({ email, locked_until: new Date(Date.now() + 15*60000).toISOString(), attempts: count })
        return NextResponse.json({ error: 'تم قفل الحساب ١٥ دقيقة بسبب محاولات متكررة', locked: true }, { status: 429 })
      }
      return NextResponse.json({ error: `كلمة مرور خاطئة. ${3-(count||0)} محاولة متبقية` }, { status: 401 })
    }

    // Clear lockout + log
    await adminSupabase.from('account_lockouts').delete().eq('email', email)
    await adminSupabase.from('system_logs').insert({
      user_id: data.user?.id,
      action: email === ADMIN_EMAIL ? 'دخول حساب الأدمن 🚨' : 'تسجيل دخول ناجح',
      details: `IP: ${ip} | ${userAgent.slice(0,100)}`,
      severity: email === ADMIN_EMAIL ? 'critical' : 'info',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'خطأ في السيرفر' }, { status: 500 })
  }
}
