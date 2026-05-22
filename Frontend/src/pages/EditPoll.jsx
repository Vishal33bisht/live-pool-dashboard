import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios.js'
import PollForm from './PollForm.jsx'

export default function EditPoll() {
  const { pollId } = useParams()
  const [poll, setPoll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api.get('/polls/my-polls')
      .then(({ data }) => {
        if (!active) return
        const match = data.polls.find((item) => item.id === pollId)
        if (!match) {
          setError('Poll not found')
          return
        }
        setPoll(match)
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
  }, [pollId])

  if (loading) {
    return (
      <section className="mx-auto mt-24 max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">Loading poll...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto mt-24 max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">{error}</h1>
      </section>
    )
  }

  return <PollForm mode="edit" initialPoll={poll} />
}
