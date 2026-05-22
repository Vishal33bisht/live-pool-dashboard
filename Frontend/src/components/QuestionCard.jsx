import OptionInput from './OptionInput.jsx'
import { useFieldArray } from 'react-hook-form'

export default function QuestionCard({
  control,
  register,
  index,
  questionName,
  canRemove,
  onRemoveQuestion,
  disabled = false,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${questionName}.options`,
  })

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">Question {index + 1}</h2>
        <label className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            {...register(`${questionName}.isMandatory`)}
            disabled={disabled}
            className="h-4 w-4 accent-slate-950"
          />
          Mandatory
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Question text
        <input
          {...register(`${questionName}.text`, { required: true, minLength: 3 })}
          disabled={disabled}
          minLength={3}
          required
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
        />
      </label>

      <div className="mt-4 space-y-3">
        {fields.map((option, optionIndex) => (
          <OptionInput
            key={option.id}
            value={undefined}
            inputProps={register(`${questionName}.options.${optionIndex}.text`, { required: true, minLength: 1 })}
            index={optionIndex}
            canRemove={!disabled && fields.length > 2}
            disabled={disabled}
            onRemove={() => remove(optionIndex)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => append({ text: '' })}
          disabled={disabled}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add option
        </button>
        <button
          type="button"
          onClick={onRemoveQuestion}
          disabled={!canRemove || disabled}
          className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Remove question
        </button>
      </div>
    </section>
  )
}
