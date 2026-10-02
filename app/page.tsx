import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims?.sub) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Astra AI Learning</p>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
            Your AI-powered learning workspace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Organize courses and study materials, then turn them into a focused learning workflow with progress tracking, quizzes and AI-assisted study tools.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/auth" className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400">
              Start learning
            </Link>
            <Link href="/auth" className="rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-20 grid gap-4 sm:grid-cols-3">
          {[
            ['Courses', 'Keep each subject in its own workspace.'],
            ['Study materials', 'Upload and organize your learning documents.'],
            ['Learning progress', 'Track what you have studied and what needs attention.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
