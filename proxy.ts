import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    // Allow the request through if Supabase is not configured.
    // This prevents crashes during build or in dev without env vars.
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAdminAuthPage = pathname === "/admin/auth"
  const isAdminRoute = pathname.startsWith("/admin")

  if (isAdminRoute && !user && !isAdminAuthPage) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/admin/auth"
    redirectUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAdminAuthPage && user) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
