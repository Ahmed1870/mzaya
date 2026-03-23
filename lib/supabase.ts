import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Mzaya Warning: Supabase environment variables are missing!')
}

// العميل الخاص بالمتصفح (Client Components)
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!)
}

// العميل الخاص بالسيرفر (Server Components / API Routes)
export async function createServerSupabaseClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch (error) {
          // التعامل مع الكوكيز في Server Actions أحياناً بيطلع خطأ لو مفيش Middleware
        }
      },
    },
  })
}
