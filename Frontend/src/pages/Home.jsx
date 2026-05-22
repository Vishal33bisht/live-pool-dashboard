import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function Home() {
  const { user } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
      <div>
        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-blue-100">
          Full-stack polling workspace
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
          Create polls, collect feedback, publish final results.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Build single-choice polls with mandatory questions, expiry windows, anonymous or authenticated
          responses, live analytics, and public result summaries.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register" className="rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800">
            Start creating
          </Link>
          <Link to="/login" className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Login
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
        <h2 className="text-lg font-bold text-slate-950">Poll workflow</h2>
        <div className="mt-5 space-y-4">
          {['Create questions with ordered options', 'Share anonymous or authenticated links', 'Track responses and publish results'].map((item, index) => (
            <div key={item} className="flex gap-3 rounded-md border border-slate-200 p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-slate-950 text-sm font-bold text-white">
                {index + 1}
              </span>
              <p className="pt-1 text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
