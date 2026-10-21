import { focusRing } from './styles.js'

// Le <label> englobe le bouton radio : tout le texte est cliquable.
export default function Radio({ label, className = '', ...props }) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2 text-sm has-disabled:cursor-not-allowed has-disabled:opacity-50 ${className}`}>
      <input type="radio" className={`size-4 border-slate-300 accent-primary ${focusRing}`} {...props} />
      {label}
    </label>
  )
}
