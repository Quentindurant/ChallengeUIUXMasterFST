import { useId } from 'react'
import { champ, libelle } from './styles.js'

// options : ['A', 'B'] ou [{ value: 'a', label: 'A' }].
export default function Select({ label, options = [], id, className = '', ...props }) {
  const autoId = useId()
  const champId = id ?? autoId

  return (
    <div className={className}>
      {label && <label htmlFor={champId} className={libelle}>{label}</label>}
      <select id={champId} className={champ} {...props}>
        {options.map((o) => {
          const { value, label: texte } = typeof o === 'string' ? { value: o, label: o } : o
          return <option key={value} value={value}>{texte}</option>
        })}
      </select>
    </div>
  )
}
