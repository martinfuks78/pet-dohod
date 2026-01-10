import { NextResponse } from 'next/server'

/**
 * Middleware funkce pro ověření admin přístupu
 * Používá simple password-based auth
 *
 * V budoucnu nahradit NextAuth nebo podobným řešením
 */
export function requireAuth(handler) {
  return async (request) => {
    // Ověření autentizace přes header
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - missing authorization header' },
        { status: 401 }
      )
    }

    // Očekáváme formát: "Bearer PASSWORD"
    const [type, password] = authHeader.split(' ')

    if (type !== 'Bearer' || !password) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid authorization format' },
        { status: 401 }
      )
    }

    // Ověření hesla
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

    if (!ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid credentials' },
        { status: 401 }
      )
    }

    // Pokud je vše OK, zavolej handler
    return handler(request)
  }
}
