import { useId } from 'react'
import { aide, champ, libelle } from './styles.js'

// type : text (défaut), email, tel, date, time, number.
export default function Input({ label, hint, id, type = 'text', className = '', ...props }) {
  const autoId = useId()
  const champId = id ?? autoId
  const hintId = hint ? `${champId}-aide` : undefined

  return (
    <div className={className}>
      {label && <label htmlFor={champId} className={libelle}>{label}</label>}
      <input id={champId} type={type} aria-describedby={hintId} className={champ} {...props} />
      {hint && <p id={hintId} className={aide}>{hint}</p>}
    </div>
  )
}
