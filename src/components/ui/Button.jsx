import { focusRing } from './styles.js'

const variantes = {
  primary: 'bg-slate-900 text-white hover:bg-slate-700',
  secondary: 'bg-primary text-white hover:bg-primary-dark',
  outline: 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100',
}

export default function Button({ variant = 'primary', full = false, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variant]} ${full ? 'w-full' : ''} ${focusRing} ${className}`}
      {...props}
    />
  )
}
