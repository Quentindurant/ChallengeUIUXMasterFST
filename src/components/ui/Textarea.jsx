import { useId } from 'react'
import { aide, champ, libelle } from './styles.js'

export default function Textarea({ label, hint, id, rows = 4, className = '', ...props }) {
  const autoId = useId()
  const champId = id ?? autoId
  const hintId = hint ? `${champId}-aide` : undefined

  return (
    <div className={className}>
      {label && <label htmlFor={champId} className={libelle}>{label}</label>}
      <textarea id={champId} rows={rows} aria-describedby={hintId} className={champ} {...props} />
      {hint && <p id={hintId} className={aide}>{hint}</p>}
    </div>
  )
}
