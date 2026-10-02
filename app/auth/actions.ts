'use server'

import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'

const AUTH_DOMAIN = 'astra.local'

function normalizeUsername(value: FormDataEntryValue | null) {
  return String(value ?? '').trim().toLowerCase()
}

function usernameEmail(username: string) {
  return `${username}@${AUTH_DOMAIN}`
}

function validateUsername(username: string) {
  return /^[a-z0-9_]{3,30}$/.test(username)
}

export async function signIn(formData: FormData) {
  const username = normalizeUsername(formData.get('username'))
  const password = String(formData.get('password') ?? '')

  if (!validateUsername(username) || !password) {
    redirect('/auth?error=Invalid username or password.')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: usernameEmail(username),
    password,
  })

  if (error) redirect('/auth?error=Invalid username or password.')
  redirect('/dashboard')
}

export async function signUp(formData: FormData) {
  const username = normalizeUsername(formData.get('username'))
  const password = String(formData.get('password') ?? '')
  const fullName = String(formData.get('fullName') ?? '').trim()

  if (!validateUsername(username)) {
    redirect('/auth?error=Username must be 3-30 characters: letters, numbers, underscore.')
  }

  if (password.length < 6) {
    redirect('/auth?error=Password must be at least 6 characters.')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: usernameEmail(username),
    password,
    options: { data: { full_name: fullName || username } },
  })

  if (error) redirect(`/auth?error=${encodeURIComponent(error.message)}`)
  if (data.session) redirect('/dashboard')
  redirect('/auth?message=Account created. You can now sign in.')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth')
}
