import { Link } from 'react-router-dom'
import { formatDate, getPollStatus, getPublicPollUrl } from '../utils/format.js'

const statusClass = {
  Collecting: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Published: 'bg-blue-50 text-blue-700 ring-blue-200',
  Expired: 'bg-amber-50 text-amber-700 ring-amber-200',
}

export default function PollCard({ poll, onPublish, onDelete, onCopied }) {
  const status = getPollStatus(poll)

  const copyLink = async () => {
    await navigator.clipboard.writeText(getPublicPollUrl(poll.slug))
    onCopied?.()
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-950">{poll.title}</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass[status]}`}>
              {status}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{poll.description || 'No description added.'}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
            <span className="rounded-md bg-slate-100 px-2.5 py-1">{poll.questions?.length || 0} questions</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1">{poll._count?.responses || 0} responses</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1">{poll.isAnonymous ? 'Anonymous' : 'Authenticated'}</span>
            <span className="rounded-md bg-slate-100 px-2.5 py-1">Expires: {formatDate(poll.expiresAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Copy link
          </button>
          <Link
            to={`/poll/${poll.slug}`}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Open
          </Link>
          <Link
            to={`/analytics/${poll.id}`}
            className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Analytics
          </Link>
          <Link
            to={`/edit/${poll.id}`}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Edit
          </Link>
          {!poll.isPublished && (
            <button
              type="button"
              onClick={() => onPublish(poll.id)}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Publish
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(poll)}
            className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
