import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router'

const etapes = [
  { path: 'salle', label: 'Salle' },
  { path: 'materiel', label: 'Matériel' },
  { path: 'vous', label: 'Vous' },
  { path: 'evenement', label: 'Événement' },
  { path: 'pieces', label: 'Pièces' },
  { path: 'envoi', label: 'Envoi' },
]

export default function Stepper() {
  const listeRef = useRef(null)
  const { pathname } = useLocation()

  // Sur mobile la liste défile horizontalement : on garde l'étape active visible.
  useEffect(() => {
    listeRef.current?.querySelector('[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [pathname])

  return (
    <nav aria-label="Étapes de la demande" className="mb-6">
      <ol ref={listeRef} className="flex overflow-x-auto rounded-md border border-slate-300 text-center text-sm">
        {etapes.map((e, i) => (
          <li key={e.path} className="flex-1 border-r border-slate-300 last:border-r-0">
            <NavLink
              to={`/reservation/${e.path}`}
              aria-current="step"
              className={({ isActive }) =>
                `block px-3 py-2 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset ${isActive ? 'bg-primary font-medium text-white focus-visible:ring-slate-900' : 'bg-white hover:bg-slate-100'}`
              }
            >
              <span className="sr-only">Étape {i + 1} sur {etapes.length} : </span>
              {e.label}
            </NavLink>
          </li>
        ))}
      </ol>
    </nav>
  )
}
