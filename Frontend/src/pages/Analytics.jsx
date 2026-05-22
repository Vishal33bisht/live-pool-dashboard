import { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios.js'
import MetricCard from '../components/charts/MetricCard.jsx'
import QuestionResults from '../components/charts/QuestionResults.jsx'
import { SocketContext } from '../context/socket-context.js'
import { formatDate, getPublicPollUrl } from '../utils/format.js'

export default function Analytics() {
  const { pollId } = useParams()
  const socket = useContext(SocketContext)
  const [analytics, setAnalytics] = useState(null)
  const [responses, setResponses] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true

    api.get(`/polls/${pollId}/analytics`)
      .then(({ data }) => {
        if (!active) return
        setAnalytics(data.analytics)
        setError('')
      })
      .catch((err) => {
        if (active) setError(err.message)
      })

    api.get(`/polls/${pollId}/responses`)
      .then(({ data }) => {
        if (active) setResponses(data.responses)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })

    return () => {
      active = false
    }
  }, [pollId])

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get(`/polls/${pollId}/analytics`)
      setAnalytics(data.analytics)
      setError('')
      const responseData = await api.get(`/polls/${pollId}/responses`)
      setResponses(responseData.data.responses)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    if (!socket || !analytics?.pollDetails?.id) return undefined

    socket.emit('join-poll', analytics.pollDetails.id)
    socket.on('response-update', (payload) => setAnalytics(payload.analytics))
    socket.on('poll-published', (payload) => setAnalytics(payload.analytics))

    return () => {
      socket.emit('leave-poll', analytics.pollDetails.id)
      socket.off('response-update')
      socket.off('poll-published')
    }
  }, [socket, analytics?.pollDetails?.id])

  const publishResults = async () => {
    try {
      await api.post(`/polls/${pollId}/publish`, { isPublished: true })
      setNotice('Results are now public on the poll link.')
      loadAnalytics()
    } catch (err) {
      setError(err.message)
    }
  }

  const copyPublicLink = async () => {
    await navigator.clipboard.writeText(getPublicPollUrl(analytics.pollDetails.slug))
    setNotice('Public link copied.')
  }

  const exportCsv = () => {
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`
    const rows = [
      ['Submitted at', 'Respondent', 'Question', 'Selected option'],
      ...responses.flatMap((response) =>
        response.questionResponses.map((answer) => [
          new Date(response.createdAt).toLocaleString(),
          response.respondent?.email || 'Anonymous',
          answer.question.text,
          answer.selectedOption.text,
        ]),
      ),
    ]

    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${analytics.pollDetails.slug}-responses.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <section className="mx-auto mt-24 max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">{error}</h1>
      </section>
    )
  }

  if (!analytics) {
    return (
      <section className="mx-auto mt-24 max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">Loading analytics...</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Live analytics</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{analytics.pollDetails.title}</h1>
          <p className="mt-2 max-w-2xl text-slate-600">{analytics.pollDetails.description}</p>
          <p className="mt-3 text-sm text-slate-500">Expires: {formatDate(analytics.pollDetails.expiresAt)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={copyPublicLink} className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Copy link
          </button>
          <button onClick={exportCsv} className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Export CSV
          </button>
          <Link to={`/poll/${analytics.pollDetails.slug}`} className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Open poll
          </Link>
          {!analytics.pollDetails.isPublished && (
            <button onClick={publishResults} className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500">
              Publish results
            </button>
          )}
        </div>
      </div>

      {notice && <p className="mt-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{notice}</p>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total responses" value={analytics.totalResponses} />
        <MetricCard label="Completion" value={`${analytics.participation.averageCompletionRate}%`} />
        <MetricCard label="Anonymous" value={analytics.participation.anonymousResponses} />
        <MetricCard label="Authenticated" value={analytics.participation.authenticatedResponses} />
      </div>

      <div className="mt-6">
        <QuestionResults questions={analytics.questions} />
      </div>

      <TrendPanel trend={analytics.responseTrend || []} />

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-950">Individual responses</h2>
          <span className="text-sm font-medium text-slate-500">{responses.length} total</span>
        </div>
        <div className="mt-4 space-y-3">
          {responses.length === 0 ? (
            <p className="text-sm font-medium text-slate-500">No responses yet.</p>
          ) : (
            responses.map((response) => (
              <article key={response.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <p className="font-semibold text-slate-800">{response.respondent?.email || 'Anonymous respondent'}</p>
                  <p className="text-slate-500">{new Date(response.createdAt).toLocaleString()}</p>
                </div>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {response.questionResponses.map((answer) => (
                    <div key={answer.id} className="rounded-md bg-slate-50 p-3">
                      <dt className="text-xs font-semibold uppercase text-slate-500">{answer.question.text}</dt>
                      <dd className="mt-1 text-sm font-semibold text-slate-900">{answer.selectedOption.text}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  )
}

function TrendPanel({ trend }) {
  const maxCount = Math.max(1, ...trend.map((item) => item.count))

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950">Response trend</h2>
        <span className="text-sm font-medium text-slate-500">{trend.length} active days</span>
      </div>
      {trend.length === 0 ? (
        <p className="mt-4 text-sm font-medium text-slate-500">No response activity yet.</p>
      ) : (
        <div className="mt-5 flex h-44 items-end gap-2 overflow-x-auto border-b border-slate-200 pb-2">
          {trend.map((item) => (
            <div key={item.date} className="flex min-w-14 flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end justify-center rounded-md bg-slate-50 px-2">
                <div
                  className="w-full rounded-t-md bg-blue-600"
                  style={{ height: `${Math.max(8, (item.count / maxCount) * 100)}%` }}
                  title={`${item.count} responses`}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900">{item.count}</p>
                <p className="text-[11px] font-medium text-slate-500">{new Date(item.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
