import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import { DocumentUploader } from "./document-uploader"

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: auth, error: authError } = await supabase.auth.getClaims()
  if (authError || !auth?.claims?.sub) redirect("/auth")

  const userId = auth.claims.sub
  const { data: course } = await supabase.from("courses").select("id,title").eq("id", id).eq("user_id", userId).maybeSingle()
  if (!course) notFound()

  const { data: documents } = await supabase
    .from("documents")
    .select("id,name,file_size,processing_status,created_at")
    .eq("course_id", course.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <Link href={`/courses/${course.id}`} className="text-sm text-slate-400 hover:text-white">← Back to {course.title}</Link>
        <div className="mt-8">
          <p className="text-sm font-medium text-indigo-300">Study materials</p>
          <h1 className="mt-2 text-3xl font-semibold">Documents</h1>
          <p className="mt-3 text-slate-400">Keep the source material for this course in one private workspace.</p>

          <DocumentUploader courseId={course.id} userId={userId} />

          <div className="mt-8 space-y-3">
            {documents?.length ? documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{document.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(1)} MB` : ""} · {document.processing_status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-sm text-slate-500">No documents yet.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
