import Link from "next/link"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Course not found</h1>
        <p className="mt-3 text-slate-400">This course does not exist or is not available to your account.</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400">Back to dashboard</Link>
      </div>
    </main>
  )
}
