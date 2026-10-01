import { redirect } from "next/navigation"
import { createClient } from "@/src/lib/supabase/server"

export default async function CoursesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) redirect("/auth")
  redirect("/dashboard")
}
