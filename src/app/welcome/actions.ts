'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function diveIn() {
  const cookieStore = await cookies()
  cookieStore.set('booster-guest', 'true', { 
    path: '/', 
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  })
  redirect('/')
}
