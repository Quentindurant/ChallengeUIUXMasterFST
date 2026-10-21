import { Link, NavLink, Outlet } from 'react-router'
import Button from './ui/Button.jsx'
import { focusRing } from './ui/styles.js'

const navClass = ({ isActive }) =>
  `rounded ${isActive ? 'font-medium text-primary' : 'text-slate-600 hover:text-slate-900'} ${focusRing}`

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        {/* Sous 640 px, la navigation passe sous le nom de la commune. */}
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4">
          <Link to="/" className={`rounded font-semibold ${focusRing}`}>Lacroix-Falgarde</Link>
          <nav aria-label="Navigation principale" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:gap-x-6">
            <NavLink to="/recherche" className={navClass}>Salles</NavLink>
            <NavLink to="/reservation/materiel" className={navClass}>Matériel</NavLink>
            <NavLink to="/mes-demandes" className={navClass}>Mes demandes</NavLink>
            <Button variant="outline">Se connecter</Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
