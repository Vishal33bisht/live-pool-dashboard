import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios.js'
import PollCard from '../components/PollCard.jsx'
import MetricCard from '../components/charts/MetricCard.jsx'
import { useAuth } from '../hooks/useAuth.js'

export default function Dashboard() {
  const { user } = useAuth()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api.get('/polls/my-polls')
      .then(({ data }) => {
        if (active) setPolls(data.polls)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const loadPolls = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/polls/my-polls')
      setPolls(data.polls)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const publishPoll = async (pollId) => {
    try {
      await api.post(`/polls/${pollId}/publish`, { isPublished: true })
      setNotice('Poll results published.')
      loadPolls()
    } catch (err) {
      setError(err.message)
    }
  }

  const deletePoll = async (poll) => {
    const confirmed = window.confirm(`Delete "${poll.title}"? This permanently removes the poll and all responses.`)
    if (!confirmed) return

    try {
      await api.delete(`/polls/${poll.id}`)
      setNotice('Poll deleted.')
      loadPolls()
    } catch (err) {
      setError(err.message)
    }
  }

  const totalResponses = polls.reduce((sum, poll) => sum + (poll._count?.responses || 0), 0)

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Hi {user.name}, manage your polls.</h1>
        </div>
        <Link to="/create" className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
          Create poll
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total polls" value={polls.length} />
        <MetricCard label="Total responses" value={totalResponses} />
        <MetricCard label="Published" value={polls.filter((poll) => poll.isPublished).length} />
      </div>

      {notice && <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}
      {error && <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
            Loading polls...
          </div>
        ) : polls.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="text-lg font-semibold text-slate-950">No polls yet</h2>
            <p className="mt-2 text-sm text-slate-500">Create your first poll and share it with respondents.</p>
            <Link to="/create" className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
              Create poll
            </Link>
          </div>
        ) : (
          polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onPublish={publishPoll}
              onDelete={deletePoll}
              onCopied={() => setNotice('Share link copied.')}
            />
          ))
        )}
      </div>
    </section>
  )
}
