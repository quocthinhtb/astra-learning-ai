import Link from 'next/link'
import { signIn, signUp } from './actions'

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← Astra AI Learning
        </Link>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="mb-8">
            <p className="text-sm font-medium text-indigo-300">Astra AI Learning</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to continue learning or create a new account.
            </p>
          </div>

          {params.error && (
            <div className="mb-5 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-sm text-red-200">
              {params.error}
            </div>
          )}
          {params.message && (
            <div className="mb-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
              {params.message}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400" />
            <input name="password" type="password" required minLength={6} placeholder="Password" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400" />
            <button className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold hover:bg-indigo-400">
              Sign in
            </button>
          </form>

          <div className="my-6 h-px bg-white/10" />

          <form action={signUp} className="space-y-4">
            <h2 className="text-lg font-semibold">Create account</h2>
            <input name="fullName" placeholder="Full name" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400" />
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400" />
            <input name="password" type="password" required minLength={6} placeholder="Password (at least 6 characters)" className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400" />
            <button className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5">
              Create account
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
