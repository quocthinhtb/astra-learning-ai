"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"

export async function createCourse(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()

  if (!title) {
    throw new Error("Course title is required")
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims?.sub) redirect("/auth")

  const { data: course, error: insertError } = await supabase
    .from("courses")
    .insert({
      user_id: data.claims.sub,
      title,
      description: description || null,
    })
    .select("id")
    .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  revalidatePath("/dashboard")
  redirect(`/courses/${course.id}`)
}
