import { NextResponse } from "next/server"
import { createClient } from "@/src/lib/supabase/server"

const CHUNK_SIZE = 1800
const CHUNK_OVERLAP = 200

function chunkText(text: string) {
  const normalized = text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim()
  if (!normalized) return []

  const chunks: string[] = []
  let start = 0
  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE, normalized.length)
    const chunk = normalized.slice(start, end).trim()
    if (chunk) chunks.push(chunk)
    if (end === normalized.length) break
    start = Math.max(end - CHUNK_OVERLAP, start + 1)
  }
  return chunks
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json().catch(() => null)
  const documentId = typeof body?.documentId === "string" ? body.documentId : ""
  if (!documentId) return NextResponse.json({ error: "documentId is required" }, { status: 400 })

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id,name,storage_path,mime_type,course_id")
    .eq("id", documentId)
    .eq("user_id", userId)
    .maybeSingle()

  if (documentError) return NextResponse.json({ error: documentError.message }, { status: 500 })
  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

  await supabase.from("documents").update({ processing_status: "processing", processing_error: null }).eq("id", document.id)

  try {
    if (document.mime_type !== "text/plain") {
      throw new Error("This first processing version supports TXT files. PDF, PPTX and DOCX extraction will be added with dedicated parsers.")
    }

    const { data: file, error: downloadError } = await supabase.storage
      .from("study-materials")
      .download(document.storage_path)
    if (downloadError) throw downloadError

    const text = await file.text()
    const chunks = chunkText(text)
    if (!chunks.length) throw new Error("The document does not contain readable text.")

    const { error: deleteChunksError } = await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", document.id)
      .eq("user_id", userId)
    if (deleteChunksError) throw deleteChunksError

    const { error: chunksError } = await supabase.from("document_chunks").insert(
      chunks.map((content, chunk_index) => ({
        document_id: document.id,
        user_id: userId,
        chunk_index,
        content,
      })),
    )
    if (chunksError) throw chunksError

    const { error: updateError } = await supabase
      .from("documents")
      .update({
        extracted_text: text,
        processing_status: "completed",
        processing_error: null,
        processed_at: new Date().toISOString(),
      })
      .eq("id", document.id)
      .eq("user_id", userId)
    if (updateError) throw updateError

    return NextResponse.json({ status: "completed", chunks: chunks.length })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Document processing failed"
    await supabase
      .from("documents")
      .update({ processing_status: "failed", processing_error: message })
      .eq("id", document.id)
      .eq("user_id", userId)
    return NextResponse.json({ error: message }, { status: 422 })
  }
}
