export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="mt-6 h-10 w-64 rounded bg-white/10" />
        <div className="mt-10 h-40 rounded-2xl bg-white/[0.04]" />
      </div>
    </main>
  )
}
