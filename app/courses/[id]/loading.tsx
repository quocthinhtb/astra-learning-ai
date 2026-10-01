export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="mt-8 h-10 w-80 rounded bg-white/10" />
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          <div className="h-28 rounded-2xl bg-white/[0.04]" />
          <div className="h-28 rounded-2xl bg-white/[0.04]" />
          <div className="h-28 rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    </main>
  )
}
