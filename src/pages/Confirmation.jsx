import { Link, Navigate } from 'react-router'
import { focusRing } from '../components/ui/styles.js'
import { useDemande } from '../context/DemandeContext.jsx'
import useTitre from '../hooks/useTitre.js'

export default function Confirmation() {
  const { demande } = useDemande()
  useTitre('Demande envoyée')

  // Accès direct sans avoir envoyé de demande : retour à l'accueil.
  if (!demande.numeroDossier) return <Navigate to="/" replace />

  return (
    <section className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
      <svg viewBox="0 0 24 24" className="mb-4 size-16 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m7.5 12.5 3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <h1 className="mb-2 text-2xl font-semibold">Demande envoyée</h1>
      <p className="mb-1 font-medium">N° de dossier {demande.numeroDossier}</p>
      <p className="mb-6 text-slate-600">Vous recevrez la réponse de la mairie par e-mail.</p>
      <Link
        to="/mes-demandes"
        className={`inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 ${focusRing}`}
      >
        Suivre ma demande
      </Link>
    </section>
  )
}
