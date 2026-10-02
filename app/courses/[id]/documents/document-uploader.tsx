"use client"

import { useRef, useState } from "react"
import { createClient } from "@/src/lib/supabase/client"

const MAX_SIZE = 25 * 1024 * 1024
const ACCEPTED = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
])

export function DocumentUploader({ courseId, userId }: { courseId: string; userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function upload(file: File) {
    if (!ACCEPTED.has(file.type)) return setStatus("Please choose a PDF, PPTX, DOCX, or TXT file.")
    if (file.size > MAX_SIZE) return setStatus("The file must be 25 MB or smaller.")

    setBusy(true)
    setStatus(null)
    const supabase = createClient()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const path = `${userId}/${courseId}/${crypto.randomUUID()}-${safeName}`

    const { error: uploadError } = await supabase.storage.from("study-materials").upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

    if (uploadError) {
      setBusy(false)
      return setStatus(uploadError.message)
    }

    const { data: document, error: insertError } = await supabase
      .from("documents")
      .insert({
        course_id: courseId,
        user_id: userId,
        name: file.name,
        storage_path: path,
        mime_type: file.type,
        file_size: file.size,
        processing_status: "pending",
      })
      .select("id")
      .single()

    if (insertError || !document) {
      await supabase.storage.from("study-materials").remove([path])
      setBusy(false)
      return setStatus(insertError?.message ?? "Could not create the document record.")
    }

    const response = await fetch("/api/documents/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: document.id }),
    })
    const result = await response.json().catch(() => null)

    setBusy(false)
    setStatus(
      response.ok
        ? `Processed successfully${result?.chunks ? ` into ${result.chunks} chunks` : ""}.`
        : result?.error ?? "The document was uploaded but could not be processed.",
    )
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.pptx,.docx,.txt"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      <p className="font-medium">Upload study material</p>
      <p className="mt-2 text-sm text-slate-500">PDF, PPTX, DOCX or TXT · max 25 MB</p>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-5 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Processing…" : "Choose file"}
      </button>
      {status && <p className="mt-4 text-sm text-slate-400">{status}</p>}
    </div>
  )
}
