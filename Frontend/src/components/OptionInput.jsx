export default function OptionInput({ value, index, canRemove, onChange, onRemove, inputProps, disabled = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100 text-sm font-semibold text-slate-600">
        {index + 1}
      </span>
      <input
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        {...inputProps}
        disabled={disabled}
        placeholder="Option text"
        required
        className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove || disabled}
        className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Remove
      </button>
    </div>
  )
}
