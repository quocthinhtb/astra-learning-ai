import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, options) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) => {
            supabaseResponse.cookies.set(name, value, cookieOptions)
          })
          if (options?.headers) {
            for (const [key, value] of Object.entries(options.headers)) {
              supabaseResponse.headers.set(key, value)
            }
          }
        },
      },
    },
  )

  await supabase.auth.getClaims()
  return supabaseResponse
}
