import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: auth, error: authError } = await supabase.auth.getClaims()

  if (authError || !auth?.claims?.sub) redirect("/auth")

  const [{ data: course }, { data: documents }] = await Promise.all([
    supabase.from("courses").select("id,title,description,created_at").eq("id", id).eq("user_id", auth.claims.sub).maybeSingle(),
    supabase.from("documents").select("id,name,mime_type,file_size,processing_status,created_at").eq("course_id", id).eq("user_id", auth.claims.sub).order("created_at", { ascending: false }),
  ])

  if (!course) notFound()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">← Dashboard</Link>
        <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-indigo-300">Course</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-400">{course.description || "Build your study space by adding learning materials."}</p>
          </div>
          <button className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400">Add document</button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><p className="text-sm text-slate-400">Documents</p><p className="mt-2 text-3xl font-semibold">{documents?.length ?? 0}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><p className="text-sm text-slate-400">Learning activities</p><p className="mt-2 text-3xl font-semibold">0</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><p className="text-sm text-slate-400">Mastery</p><p className="mt-2 text-3xl font-semibold">0%</p></div>
        </div>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-xl font-semibold">Study materials</h2>
          <p className="mt-1 text-sm text-slate-400">Your PDFs, slides and notes will appear here.</p>
          {documents?.length ? (
            <div className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-4 p-4">
                  <div><p className="font-medium">{document.name}</p><p className="mt-1 text-xs text-slate-500">{document.processing_status}</p></div>
                  <span className="text-xs text-slate-500">{document.mime_type || "file"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-white/10 p-12 text-center">
              <p className="text-slate-300">No study materials yet.</p>
              <p className="mt-2 text-sm text-slate-500">Document upload will be connected in the next module.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
