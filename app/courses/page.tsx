import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"
import { redirect as nextRedirect } from "next/navigation"

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) nextRedirect("/auth")
  const { data: courses } = await supabase.from("courses").select("id").eq("user_id", data!.claims.sub)
  if ((courses?.length ?? 0) === 0) redirect("/courses/new")
  redirect("/dashboard")
}
