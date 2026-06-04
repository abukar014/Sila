import { NextRequest, NextResponse } from 'next/server'

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_auth', '', { maxAge: 0 })
  return response
}

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_auth', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
  return response
}
