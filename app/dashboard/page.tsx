import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) redirect('/auth')

  const userId = data.claims.sub
  const [{ data: profile }, { data: courses }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle(),
    supabase.from('courses').select('id,title,description,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
  ])

  const name = profile?.display_name || String(data.claims.email ?? 'Learner').split('@')[0]

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="text-lg font-semibold">Astra AI Learning</Link>
          <form action={signOut}>
            <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5">Sign out</button>
          </form>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div>
          <p className="text-sm font-medium text-indigo-300">Your learning space</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Hi, {name}</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Organize your courses, study materials and progress. AI-powered learning tools will appear here as we build them.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            ['Courses', String(courses?.length ?? 0), 'Your learning subjects'],
            ['Documents', '0', 'Study materials'],
            ['Progress', '0%', 'Overall mastery'],
          ].map(([label, value, description]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Your courses</h2>
              <p className="mt-1 text-sm text-slate-400">Create a course to start organizing your learning.</p>
            </div>
            <button className="rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-400">Create course</button>
          </div>

          {courses?.length ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div key={course.id} className="rounded-xl border border-white/10 bg-slate-900 p-5">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{course.description || 'No description yet.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
              No courses yet. Course creation will be enabled in the next feature module.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
