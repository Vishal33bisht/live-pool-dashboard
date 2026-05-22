import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

const authCopy = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Login to your workspace',
    button: 'Login',
    loading: 'Logging in...',
    footer: 'New here?',
    footerLink: 'Create an account',
    footerTo: '/register',
  },
  register: {
    eyebrow: 'Create account',
    title: 'Start building polls',
    button: 'Create account',
    loading: 'Creating...',
    footer: 'Already registered?',
    footerLink: 'Login',
    footerTo: '/login',
  },
}

export default function AuthForm({ mode }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const copy = authCopy[mode]
  const isRegister = mode === 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = isRegister ? form : { email: form.email, password: form.password }
      await auth[mode](payload)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4 py-12">
      <form onSubmit={handleSubmit} className="animate-page-enter w-full rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{copy.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{copy.title}</h1>

        {isRegister && (
          <label className="mt-6 block text-sm font-medium text-slate-700">
            Name
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              minLength={3}
              required
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
            />
          </label>
        )}

        <label className={`${isRegister ? 'mt-4' : 'mt-6'} block text-sm font-medium text-slate-700`}>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => updateField('password', event.target.value)}
            minLength={6}
            required
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

        <button disabled={loading} className="mt-6 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800">
          {loading ? copy.loading : copy.button}
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          {copy.footer} <Link className="font-semibold text-blue-700" to={copy.footerTo}>{copy.footerLink}</Link>
        </p>
      </form>
    </section>
  )
}
