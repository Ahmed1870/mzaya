import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    // تبادل الكود بالجلسة (Session)
    await supabase.auth.exchangeCodeForSession(code)
  }

  // التحويل التلقائي للداشبورد بعد النجاح
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
