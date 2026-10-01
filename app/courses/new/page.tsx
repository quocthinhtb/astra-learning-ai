import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import { createCourse } from "../actions"

export default async function NewCoursePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) redirect("/auth")

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">← Back to dashboard</Link>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm font-medium text-indigo-300">New learning space</p>
          <h1 className="mt-2 text-3xl font-semibold">Create a course</h1>
          <p className="mt-3 text-slate-400">Create a subject first, then add documents and AI learning activities to it.</p>

          <form action={createCourse} className="mt-8 space-y-6">
            <div>
              <label htmlFor="title" className="text-sm font-medium text-slate-200">Course name</label>
              <input id="title" name="title" required maxLength={120} placeholder="e.g. Data Warehouse & Integration" className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-400" />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium text-slate-200">Description <span className="text-slate-500">(optional)</span></label>
              <textarea id="description" name="description" rows={4} maxLength={500} placeholder="What are you studying in this course?" className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-400" />
            </div>
            <div className="flex justify-end gap-3">
              <Link href="/dashboard" className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/5">Cancel</Link>
              <button type="submit" className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400">Create course</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
