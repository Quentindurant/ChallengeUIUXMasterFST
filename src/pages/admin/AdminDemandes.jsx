import { useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import { focusRing } from '../../components/ui/styles.js'
import { useDemande } from '../../context/DemandeContext.jsx'
import { demandesAdmin, piecesRequises, salles } from '../../data/mock.js'
import useTitre from '../../hooks/useTitre.js'

const menu = ['Demandes', 'Calendrier des salles', 'Stock de matériel', 'Salles et tarifs', 'Usagers et associations']

// « Convention à signer » suit l'accord de la mairie : on la range avec les demandes accordées.
const onglets = [
  { id: 'a-traiter', libelle: 'À traiter', statuts: ['À instruire'] },
  { id: 'pieces', libelle: 'Pièces manquantes', statuts: ['Pièce manquante'] },
  { id: 'accordees', libelle: 'Accordées', statuts: ['Accordée', 'Convention à signer'] },
  { id: 'refusees', libelle: 'Refusées', statuts: ['Refusée'] },
  { id: 'toutes', libelle: 'Toutes', statuts: null },
]

const couleursStatut = {
  'À instruire': 'bg-blue-100 text-blue-800',
  'Pièce manquante': 'bg-amber-100 text-amber-800',
  'Convention à signer': 'bg-violet-100 text-violet-800',
  Accordée: 'bg-green-100 text-green-800',
  Refusée: 'bg-red-100 text-red-800',
}

// Détail du scénario de démo ; les autres demandes ont un détail déduit de la ligne.
const detailsConnus = {
  1: {
    titre: 'Julien, Foyer rural',
    controles: ["Créneau verrouillé depuis l'envoi", '30 participants pour 200 places', 'Matériel réservé dans le stock du 21 nov.'],
    pieceManquante: 'Assurance',
    location: 250,
    caution: 1500,
  },
}

// Demande n° 1 = celle de Julien : si elle vient d'être envoyée, ses pièces viennent du parcours (et du suivi).
function avecDemandeEnCours(d, demande) {
  if (d.id !== 1 || !demande.numeroDossier) return { ...d }
  const manquantes = piecesRequises.filter((p) => !demande.pieces.some((x) => x.id === p.id))
  if (manquantes.length === 0) return { ...d, pieces: 'Complet', statut: 'À instruire' }
  return {
    ...d,
    pieces: `${piecesRequises.length - manquantes.length}/${piecesRequises.length}`,
    statut: 'Pièce manquante',
    pieceManquante: manquantes.map((p) => p.nom).join(', '),
  }
}

function detailDe(d) {
  if (detailsConnus[d.id]) return { ...detailsConnus[d.id], pieceManquante: d.pieceManquante ?? detailsConnus[d.id].pieceManquante }
  const salle = salles.find((s) => d.objet.startsWith(s.nom))
  return {
    titre: `${d.demandeur.replace(/\s*\(.*\)/, '')}, ${d.objet}`,
    controles: ["Créneau verrouillé depuis l'envoi", 'Capacité de la salle suffisante'],
    pieceManquante: null,
    location: salle?.tarif ?? null,
    caution: salle ? 500 : null,
  }
}

const euros = (n) => `${n.toLocaleString('fr-FR')} €`

function Statut({ statut }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${couleursStatut[statut] ?? 'bg-slate-100 text-slate-700'}`}>
      {statut}
    </span>
  )
}

export default function AdminDemandes() {
  const { demande } = useDemande()
  const [demandes, setDemandes] = useState(() => demandesAdmin.map((d) => avecDemandeEnCours(d, demande)))
  const [recherche, setRecherche] = useState('')
  const [onglet, setOnglet] = useState('a-traiter')
  const [selectionId, setSelectionId] = useState(null)
  const [message, setMessage] = useState('')
  useTitre('Back-office · Demandes')

  const statuts = onglets.find((o) => o.id === onglet).statuts
  const terme = recherche.trim().toLowerCase()
  const visibles = demandes.filter(
    (d) =>
      (!statuts || statuts.includes(d.statut)) &&
      (!terme || d.demandeur.toLowerCase().includes(terme) || d.objet.toLowerCase().includes(terme)),
  )

  const selection = demandes.find((d) => d.id === selectionId)
  const detail = selection && detailDe(selection)
  const incomplet = selection && selection.pieces !== 'Complet'

  const changerStatut = (statut, confirmation) => {
    setDemandes((liste) => liste.map((d) => (d.id === selectionId ? { ...d, statut } : d)))
    setMessage(confirmation)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[12rem_1fr_20rem]">
      <nav aria-label="Back-office" className="min-w-0">
        <ul className="flex gap-1 overflow-x-auto text-sm lg:flex-col">
          {menu.map((entree) =>
            entree === 'Demandes' ? (
              <li key={entree}>
                <span aria-current="page" className="block rounded-md bg-primary px-3 py-2 font-medium whitespace-nowrap text-white">
                  {entree}
                </span>
              </li>
            ) : (
              <li key={entree}>
                <span aria-disabled="true" className="block cursor-not-allowed rounded-md px-3 py-2 whitespace-nowrap text-slate-500">
                  {entree}
                </span>
              </li>
            ),
          )}
        </ul>
      </nav>

      <section className="min-w-0">
        <h1 className="mb-4 text-2xl font-semibold">Demandes de réservation</h1>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Input
            label="Rechercher"
            type="search"
            placeholder="Demandeur ou objet"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="min-w-48 flex-1"
          />
          <Button variant="outline" onClick={() => setMessage('Export simulé : aucun fichier Excel n’est généré dans la démo.')}>
            Exporter vers Excel
          </Button>
        </div>

        <p role="status" className={message ? 'mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800' : 'sr-only'}>
          {message}
        </p>

        <div role="tablist" aria-label="Statut des demandes" className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-300">
          {onglets.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={onglet === o.id}
              onClick={() => setOnglet(o.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap ${onglet === o.id ? 'border-primary text-slate-900' : 'border-transparent text-slate-600 hover:text-slate-900'} ${focusRing}`}
            >
              {o.libelle}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-300 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">N°</th>
                <th scope="col" className="px-3 py-2 font-medium">Demandeur</th>
                <th scope="col" className="px-3 py-2 font-medium">Salle ou matériel</th>
                <th scope="col" className="px-3 py-2 font-medium">Date</th>
                <th scope="col" className="px-3 py-2 font-medium">Pièces</th>
                <th scope="col" className="px-3 py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((d) => (
                <tr
                  key={d.id}
                  tabIndex={0}
                  aria-current={d.id === selectionId ? 'true' : undefined}
                  onClick={() => setSelectionId(d.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectionId(d.id)
                    }
                  }}
                  className={`cursor-pointer border-t border-slate-200 ${d.id === selectionId ? 'bg-blue-50' : 'hover:bg-slate-50'} ${focusRing}`}
                >
                  <td className="px-3 py-2 text-slate-600">{d.id}</td>
                  <td className="px-3 py-2">{d.demandeur}</td>
                  <td className="px-3 py-2">{d.objet}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{d.date}</td>
                  <td className={`px-3 py-2 ${d.pieces === 'Complet' ? '' : 'font-medium text-amber-700'}`}>{d.pieces}</td>
                  <td className="px-3 py-2"><Statut statut={d.statut} /></td>
                </tr>
              ))}
              {visibles.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-600">Aucune demande dans cette catégorie.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <aside aria-label="Détail de la demande">
        {selection ? (
          <Card className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">{detail.titre}</h2>
              <p className="mt-1 text-slate-600">{selection.date} · <Statut statut={selection.statut} /></p>
            </div>

            <div>
              <h3 className="mb-2 font-medium">Contrôles automatiques</h3>
              <ul className="space-y-1">
                {detail.controles.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span aria-hidden="true" className="text-green-600">✓</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-1 font-medium">Pièces</h3>
              <p className={incomplet ? 'text-amber-700' : 'text-slate-700'}>
                {incomplet ? `${selection.pieces} ${detail.pieceManquante ?? ''}`.trim() : 'Dossier complet'}
              </p>
            </div>

            {detail.location != null && (
              <p className="font-medium">
                Location {euros(detail.location)} · Caution {euros(detail.caution)}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                disabled={incomplet}
                onClick={() => changerStatut('Accordée', `Demande n° ${selection.id} accordée.`)}
              >
                {incomplet ? 'Accorder (dossier incomplet)' : 'Accorder'}
              </Button>
              <Button
                variant="outline"
                onClick={() => changerStatut('Pièce manquante', `Pièce demandée au demandeur de la demande n° ${selection.id}.`)}
              >
                Demander une pièce
              </Button>
              <Button
                variant="outline"
                className="text-red-700"
                onClick={() => changerStatut('Refusée', `Demande n° ${selection.id} refusée.`)}
              >
                Refuser
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="text-slate-600">Sélectionnez une demande dans le tableau pour afficher son détail.</Card>
        )}
      </aside>
    </div>
  )
}
