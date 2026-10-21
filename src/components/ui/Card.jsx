export default function Card({ as: Balise = 'div', className = '', ...props }) {
  return <Balise className={`rounded-lg border border-slate-300 bg-white p-4 text-sm ${className}`} {...props} />
}
