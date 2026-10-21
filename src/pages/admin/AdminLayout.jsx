import { NavLink, Outlet } from 'react-router'
import { focusRing } from '../../components/ui/styles.js'

// Entrées sans « to » : écrans hors périmètre de la démo, affichés mais inactifs.
const menu = [
  { to: '/admin', libelle: 'Demandes', end: true },
  { to: '/admin/planning', libelle: 'Calendrier des salles' },
  { libelle: 'Stock de matériel' },
  { libelle: 'Salles et tarifs' },
  { libelle: 'Usagers et associations' },
]

export default function AdminLayout() {
  return (
    <div className="grid gap-6 lg:grid-cols-[12rem_1fr]">
      <nav aria-label="Back-office" className="min-w-0">
        <ul className="flex flex-wrap gap-1 text-sm lg:flex-col">
          {menu.map((entree) => (
            <li key={entree.libelle}>
              {entree.to ? (
                <NavLink
                  to={entree.to}
                  end={entree.end}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 whitespace-nowrap ${isActive ? 'bg-primary font-medium text-white' : 'text-slate-700 hover:bg-slate-100'} ${focusRing}`
                  }
                >
                  {entree.libelle}
                </NavLink>
              ) : (
                <span aria-disabled="true" className="block cursor-not-allowed rounded-md px-3 py-2 whitespace-nowrap text-slate-500">
                  {entree.libelle}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
