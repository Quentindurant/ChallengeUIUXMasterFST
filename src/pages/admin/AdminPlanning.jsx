import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Statut from '../../components/Statut.jsx'
import Card from '../../components/ui/Card.jsx'
import { focusRing } from '../../components/ui/styles.js'
import { api } from '../../data/api.js'
import { aujourdhui, formaterDate, formaterDateCourte, formaterHeure, versIso } from '../../data/dates.js'
import { salles } from '../../data/mock.js'
import useChargement from '../../hooks/useChargement.js'
import useTitre from '../../hooks/useTitre.js'

// Trois états lisibles d'un coup d'œil ; les demandes refusées ne prennent pas de place au planning.
const categories = [
  { id: 'confirmee', libelle: 'Confirmée', statuts: ['Accordée', 'Convention à signer'], classe: 'bg-green-700 text-white' },
  { id: 'instruction', libelle: 'En instruction', statuts: ['À instruire', 'Pièce manquante'], classe: 'bg-amber-200 text-amber-950' },
  { id: 'conflit', libelle: 'Plusieurs demandes', statuts: [], classe: 'bg-red-700 text-white' },
]
const categorieDe = (reservations) =>
  reservations.length > 1 ? categories[2] : categories.find((c) => c.statuts.includes(reservations[0].statut))

const initiales = (nom) =>
  nom
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter((m) => m.length > 2 || /^\p{Lu}/u.test(m))
    .slice(0, 2)
    .map((m) => m[0].toUpperCase())
    .join('')

const lettresJour = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function moisDe(iso) {
  const [annee, mois] = iso.split('-').map(Number)
  return { annee, mois: mois - 1 }
}

export default function AdminPlanning() {
  useTitre('Back-office · Calendrier des salles')
  const navigate = useNavigate()
  const planning = useChargement(() => api.planning(), [])
  const reservations = planning.donnees ?? []
  const today = aujourdhui()

  // Par défaut : le mois de la prochaine réservation (la démo démarre avant les événements de novembre).
  const [moisChoisi, setMoisChoisi] = useState(null)
  const vue = moisChoisi ?? moisDe(reservations.find((r) => r.date >= today)?.date ?? today)

  const changerMois = (delta) => {
    const d = new Date(vue.annee, vue.mois + delta, 1)
    setMoisChoisi({ annee: d.getFullYear(), mois: d.getMonth() })
  }

  const nomMois = new Date(vue.annee, vue.mois, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const titre = nomMois.charAt(0).toUpperCase() + nomMois.slice(1)
  const jours = Array.from({ length: new Date(vue.annee, vue.mois + 1, 0).getDate() }, (_, i) => {
    const date = new Date(vue.annee, vue.mois, i + 1)
    return { jour: i + 1, iso: versIso(vue.annee, vue.mois, i + 1), lettre: lettresJour[date.getDay()], weekend: [0, 6].includes(date.getDay()) }
  })

  const prefixe = versIso(vue.annee, vue.mois, 1).slice(0, 7)
  const duMois = reservations.filter((r) => r.date.startsWith(prefixe))
  const parCase = new Map()
  for (const r of duMois) {
    const cle = `${r.salleId}|${r.date}`
    parCase.set(cle, [...(parCase.get(cle) ?? []), r])
  }
  const ouvrir = (numero) => navigate(`/admin?dossier=${encodeURIComponent(numero)}`)

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Calendrier des salles</h1>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => changerMois(-1)} aria-label="Mois précédent" className={`rounded-md border border-slate-300 bg-white px-3 py-1 hover:bg-slate-100 ${focusRing}`}>
            ‹
          </button>
          <h2 className="min-w-40 text-center text-base font-semibold" aria-live="polite">{titre}</h2>
          <button type="button" onClick={() => changerMois(1)} aria-label="Mois suivant" className={`rounded-md border border-slate-300 bg-white px-3 py-1 hover:bg-slate-100 ${focusRing}`}>
            ›
          </button>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Légende">
          {categories.map((c) => (
            <li key={c.id} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={`inline-block size-3 rounded-sm ${c.classe}`} />
              {c.libelle}
            </li>
          ))}
        </ul>
      </div>

      {planning.erreur && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{planning.erreur}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
        <table className="w-full border-collapse text-xs">
          <caption className="sr-only">Occupation des salles, {titre}. Chaque case occupée ouvre la demande.</caption>
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th scope="col" className="sticky left-0 z-10 bg-slate-100 px-3 py-2 text-left text-sm font-medium">Salle</th>
              {jours.map((j) => (
                <th
                  key={j.iso}
                  scope="col"
                  className={`min-w-8 px-0.5 py-1 text-center font-medium ${j.weekend ? 'bg-slate-200' : ''} ${j.iso === today ? 'text-primary' : ''}`}
                >
                  <abbr title={formaterDate(j.iso)} className="block no-underline">
                    <span className="block text-[10px]">{j.lettre}</span>
                    {j.jour}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salles.map((s) => (
              <tr key={s.id} className="border-t border-slate-200">
                <th scope="row" className="sticky left-0 z-10 max-w-36 bg-white px-3 py-2 text-left text-sm font-medium">
                  {s.nom}
                </th>
                {jours.map((j) => {
                  const cases = parCase.get(`${s.id}|${j.iso}`)
                  const categorie = cases && categorieDe(cases)
                  return (
                    <td key={j.iso} className={`h-11 border-l border-slate-100 p-0.5 ${j.weekend ? 'bg-slate-50' : ''}`}>
                      {cases && (
                        <button
                          type="button"
                          onClick={() => ouvrir(cases[0].numero)}
                          aria-label={`${s.nom}, ${formaterDate(j.iso)} : ${cases.map((r) => `${r.nom}, ${r.statut}`).join(' ; ')}`}
                          title={cases.map((r) => `${r.nom} · ${r.type || 'Événement'} · ${formaterHeure(r.debut)}–${formaterHeure(r.fin)} · ${r.statut}`).join('\n')}
                          className={`flex h-full w-full items-center justify-center rounded text-[10px] font-semibold ${categorie.classe} ${focusRing}`}
                        >
                          {cases.length > 1 ? cases.length : initiales(cases[0].nom)}
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Card>
        <h2 className="mb-3 text-base font-semibold">
          Réservations de {nomMois} ({duMois.length})
        </h2>
        {duMois.length === 0 ? (
          <p className="text-slate-600">{planning.chargement ? 'Chargement…' : 'Aucune réservation ce mois-ci.'}</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {duMois.map((r) => (
              <li key={r.numero} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <Link to={`/admin?dossier=${encodeURIComponent(r.numero)}`} className={`rounded hover:underline ${focusRing}`}>
                  <span className="font-medium">{formaterDateCourte(r.date)}</span> · {salles.find((s) => s.id === r.salleId)?.nom} · {r.nom}
                  <span className="text-slate-600"> ({formaterHeure(r.debut)} – {formaterHeure(r.fin)})</span>
                </Link>
                <Statut statut={r.statut} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
