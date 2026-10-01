"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/src/lib/supabase/client"

const MAX_FILE_SIZE = 25 * 1024 * 1024
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
])

export function UploadForm({ courseId }: { courseId: string }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function upload() {
    if (!file || busy) return
    setError("")

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 25 MB or less.")
      return
    }
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Supported formats: PDF, PPTX, DOCX and TXT.")
      return
    }

    setBusy(true)
    const supabase = createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      setError("Your session has expired. Please sign in again.")
      setBusy(false)
      return
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const path = `${userData.user.id}/${courseId}/${crypto.randomUUID()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from("study-materials")
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setBusy(false)
      return
    }

    const { error: documentError } = await supabase.from("documents").insert({
      course_id: courseId,
      user_id: userData.user.id,
      name: file.name,
      storage_path: path,
      mime_type: file.type,
      file_size: file.size,
      processing_status: "pending",
    })

    if (documentError) {
      await supabase.storage.from("study-materials").remove([path])
      setError(documentError.message)
      setBusy(false)
      return
    }

    setFile(null)
    if (inputRef.current) inputRef.current.value = ""
    setBusy(false)
    router.push(`/courses/${courseId}`)
    router.refresh()
  }

  return (
    <div className="mt-8 rounded-xl border border-dashed border-white/10 p-6">
      <label htmlFor="study-file" className="block text-sm font-medium text-slate-200">Study material</label>
      <p className="mt-1 text-sm text-slate-500">PDF, PPTX, DOCX or TXT · max 25 MB</p>
      <input
        ref={inputRef}
        id="study-file"
        type="file"
        accept=".pdf,.pptx,.docx,.txt"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={busy}
        className="mt-5 block w-full text-sm text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
      />
      {file && <p className="mt-3 truncate text-sm text-slate-300">Selected: {file.name}</p>}
      {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
      <button
        type="button"
        onClick={upload}
        disabled={!file || busy}
        className="mt-5 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Upload document"}
      </button>
    </div>
  )
}
