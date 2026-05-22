import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios.js'
import QuestionResults from '../components/charts/QuestionResults.jsx'
import { SocketContext } from '../context/socket-context.js'
import { useAuth } from '../hooks/useAuth.js'
import { formatDate } from '../utils/format.js'

const getAnonymousId = () => {
  const key = 'pulsepoll_anonymous_id'
  const existing = window.localStorage.getItem(key)
  if (existing) return existing

  const id = crypto.randomUUID()
  window.localStorage.setItem(key, id)
  return id
}

export default function PollPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const socket = useContext(SocketContext)
  const { user } = useAuth()
  const [poll, setPoll] = useState(null)
  const [publicResults, setPublicResults] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/polls/view/${slug}`)
      .then(({ data }) => {
        setPoll(data.poll)
        setPublicResults(data.publicResults)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!socket || !poll?.id) return undefined

    socket.emit('join-poll', poll.id)
    socket.on('poll-published', (payload) => {
      setPublicResults(payload.analytics)
      setPoll((current) => current ? { ...current, isPublished: true, canRespond: false } : current)
    })

    return () => {
      socket.emit('leave-poll', poll.id)
      socket.off('poll-published')
    }
  }, [socket, poll?.id])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setError('')

    const submittedKey = `pulsepoll_submitted_${slug}`
    if (poll.isAnonymous && window.localStorage.getItem(submittedKey)) {
      setError('You have already submitted a response for this poll.')
      submittingRef.current = false
      return
    }

    const missingQuestion = poll.questions.find((question) => question.isMandatory && !answers[question.id])
    if (missingQuestion) {
      setError(`Please answer: ${missingQuestion.text}`)
      submittingRef.current = false
      return
    }

    try {
      setSubmitting(true)
      await api.post(`/responses/${slug}/submit`, {
        answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
          questionId,
          selectedOptionId,
        })),
      }, {
        headers: poll.isAnonymous ? { 'X-Anonymous-Id': getAnonymousId() } : undefined,
      })
      if (poll.isAnonymous) window.localStorage.setItem(submittedKey, 'true')
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (loading) return <StatePanel title="Loading poll..." />
  if (error && !poll) return <StatePanel title={error} />
  if (!poll) return <StatePanel title="Poll not found" />

  if (publicResults) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Published results</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">{publicResults.pollDetails.title}</h1>
          <p className="mt-2 text-slate-600">{publicResults.pollDetails.description}</p>
        </div>
        <QuestionResults questions={publicResults.questions} />
      </section>
    )
  }

  if (submitted) {
    return <StatePanel title="Response submitted" action="Back to home" onAction={() => navigate('/')} />
  }

  if (!poll.canRespond) {
    const needsLogin = poll.requiresAuth && !user
    return (
      <StatePanel
        title={poll.isExpired ? 'This poll has expired' : needsLogin ? 'Login required to respond' : 'This poll is not accepting responses'}
        action={needsLogin ? 'Login' : undefined}
        onAction={() => navigate('/login')}
      />
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          {poll.requiresAuth ? 'Authenticated poll' : 'Anonymous poll'}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{poll.title}</h1>
        {poll.description && <p className="mt-2 text-slate-600">{poll.description}</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
          <span className="rounded-md bg-slate-100 px-2.5 py-1">Expires: {formatDate(poll.expiresAt)}</span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1">{poll.questions.length} questions</span>
        </div>

        <div className="mt-6 space-y-5">
          {poll.questions.map((question) => (
            <fieldset key={question.id} className="rounded-lg border border-slate-200 p-4">
              <legend className="px-1 text-base font-semibold text-slate-950">
                {question.text}
                {question.isMandatory && <span className="ml-2 text-xs font-semibold text-red-600">Required</span>}
              </legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option) => (
                  <label key={option.id} className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                    <input
                      type="radio"
                      name={question.id}
                      checked={answers[question.id] === option.id}
                      onChange={() => setAnswers({ ...answers, [question.id]: option.id })}
                      className="h-4 w-4 accent-slate-950"
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        {error && <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitting ? 'Submitting...' : 'Submit feedback'}
        </button>
      </form>
    </section>
  )
}

function StatePanel({ title, action, onAction }) {
  return (
    <section className="mx-auto mt-24 max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-slate-950">{title}</h1>
      {action && (
        <button onClick={onAction} className="mt-5 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
          {action}
        </button>
      )}
      {!action && <Link className="mt-5 inline-flex text-sm font-semibold text-blue-700" to="/">Back to home</Link>}
    </section>
  )
}
