import Link from 'next/link'
import { signIn, signUp } from './actions'

const inputClass = 'w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-3 text-sm outline-none focus:border-indigo-400'

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
            <h1 className="mt-2 text-3xl font-semibold">Đăng nhập</h1>
            <p className="mt-2 text-sm text-slate-400">
              Đăng nhập bằng tên đăng nhập và mật khẩu.
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
            <input name="username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" autoComplete="username" placeholder="Tên đăng nhập" className={inputClass} />
            <input name="password" type="password" required minLength={6} autoComplete="current-password" placeholder="Mật khẩu" className={inputClass} />
            <button className="w-full rounded-lg bg-indigo-500 px-4 py-3 text-sm font-semibold hover:bg-indigo-400">
              Đăng nhập
            </button>
          </form>

          <div className="my-6 h-px bg-white/10" />

          <form action={signUp} className="space-y-4">
            <h2 className="text-lg font-semibold">Tạo tài khoản</h2>
            <input name="username" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" autoComplete="username" placeholder="Tên đăng nhập" className={inputClass} />
            <input name="fullName" placeholder="Tên hiển thị (không bắt buộc)" className={inputClass} />
            <input name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="Mật khẩu (ít nhất 6 ký tự)" className={inputClass} />
            <button className="w-full rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold hover:bg-white/5">
              Tạo tài khoản
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
