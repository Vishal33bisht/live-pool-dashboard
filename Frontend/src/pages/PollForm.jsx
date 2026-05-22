import { useMemo, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import QuestionCard from '../components/QuestionCard.jsx'

const emptyQuestion = () => ({
  text: '',
  isMandatory: true,
  options: [{ text: '' }, { text: '' }],
})

const toDateTimeLocal = (value) => {
  if (!value) return ''
  const date = new Date(value)
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}

const pollDefaults = (poll) => ({
  title: poll?.title || '',
  description: poll?.description || '',
  isAnonymous: String(poll?.isAnonymous ?? true),
  expiresAt: toDateTimeLocal(poll?.expiresAt),
  questions: poll?.questions?.length
    ? poll.questions.map((question) => ({
        text: question.text,
        isMandatory: question.isMandatory,
        options: question.options.map((option) => ({ text: option.text })),
      }))
    : [emptyQuestion()],
})

const toPayload = (values, includeQuestions) => {
  const payload = {
    title: values.title,
    description: values.description || undefined,
    isAnonymous: values.isAnonymous,
    expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
  }

  if (includeQuestions) {
    payload.questions = values.questions.map(({ text, isMandatory, options }) => ({
      text,
      isMandatory,
      options: options.map((option) => ({ text: option.text })),
    }))
  }

  return payload
}

export default function PollForm({ mode, initialPoll }) {
  const navigate = useNavigate()
  const isEdit = mode === 'edit'
  const responseCount = initialPoll?._count?.responses || 0
  const canEditQuestions = !isEdit || responseCount === 0
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const defaults = useMemo(() => pollDefaults(initialPoll), [initialPoll])

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaults,
  })

  const watchedIsAnonymous = useWatch({
    control,
    name: 'isAnonymous',
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  })

  const isAnonymous = watchedIsAnonymous === true || watchedIsAnonymous === 'true'

  const onSubmit = async (values) => {
    setError('')
    setLoading(true)

    try {
      const payload = toPayload(values, canEditQuestions)
      const { data } = isEdit
        ? await api.put(`/polls/${initialPoll.id}`, payload)
        : await api.post('/polls', payload)

      navigate(`/analytics/${data.poll.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Poll builder</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {isEdit ? 'Edit poll.' : 'Create a shareable poll.'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-medium text-slate-700">
              Poll title
              <input
                {...register('title', { required: true, minLength: 3, maxLength: 255 })}
                minLength={3}
                required
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Description
              <textarea
                {...register('description', { maxLength: 1000 })}
                rows={3}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Expiry time
                <input
                  type="datetime-local"
                  {...register('expiresAt')}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Response mode
                <select
                  {...register('isAnonymous', {
                    setValueAs: (value) => value === 'true' || value === true,
                  })}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="true">Anonymous</option>
                  <option value="false">Authenticated</option>
                </select>
              </label>
            </div>
          </section>

          {!canEditQuestions && (
            <p className="rounded-md bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              This poll already has responses, so only metadata can be edited.
            </p>
          )}

          {fields.map((question, questionIndex) => (
            <QuestionCard
              key={question.id}
              control={control}
              register={register}
              questionName={`questions.${questionIndex}`}
              index={questionIndex}
              canRemove={fields.length > 1}
              disabled={!canEditQuestions}
              onRemoveQuestion={() => remove(questionIndex)}
            />
          ))}
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Questions</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{fields.length}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Mode</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{isAnonymous ? 'Anon' : 'Auth'}</p>
            </div>
          </div>
          {(error || Object.keys(errors).length > 0) && (
            <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {error || 'Please complete all required fields.'}
            </p>
          )}
          <button
            type="button"
            onClick={() => append(emptyQuestion())}
            disabled={!canEditQuestions}
            className="mt-5 w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add question
          </button>
          <button
            disabled={loading}
            className="mt-3 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save changes' : 'Create poll'}
          </button>
        </aside>
      </form>
    </section>
  )
}
