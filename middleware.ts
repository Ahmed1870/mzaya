import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('plan_name, is_admin').eq('id', user.id).single()
    const plan = profile?.plan_name || 'مجاني'

    // 1. حماية الرادار والتقارير (ممنوعة على المجاني)
    const restrictedForFree = ['/dashboard/crm', '/dashboard/reports', '/dashboard/analytics']
    if (restrictedForFree.some(r => pathname.startsWith(r)) && plan === 'مجاني') {
      return NextResponse.redirect(new URL('/dashboard/subscription', request.url))
    }

    // 2. حماية مميزات البيزنس الحصرية (الذكاء الاصطناعي والإعلانات)
    const businessOnly = ['/dashboard/ads', '/dashboard/ai']
    if (businessOnly.some(r => pathname.startsWith(r)) && plan !== 'البيزنس') {
      return NextResponse.redirect(new URL('/dashboard/subscription', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
