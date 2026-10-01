import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import { UploadForm } from "./upload-form"

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: auth, error: authError } = await supabase.auth.getClaims()
  if (authError || !auth?.claims?.sub) redirect("/auth")

  const { data: course } = await supabase.from("courses").select("id,title").eq("id", id).eq("user_id", auth.claims.sub).maybeSingle()
  if (!course) notFound()

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href={`/courses/${course.id}`} className="text-sm text-slate-400 hover:text-white">← Back to {course.title}</Link>
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-8">
          <p className="text-sm font-medium text-indigo-300">Study materials</p>
          <h1 className="mt-2 text-3xl font-semibold">Add a document</h1>
          <p className="mt-3 text-slate-400">Upload course materials. They will be processed later into AI-ready learning content.</p>
          <UploadForm courseId={course.id} />
        </div>
      </div>
    </main>
  )
}
