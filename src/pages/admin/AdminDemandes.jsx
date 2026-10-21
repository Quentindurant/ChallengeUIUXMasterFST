import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import Statut from '../../components/Statut.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import { focusRing } from '../../components/ui/styles.js'
import { api } from '../../data/api.js'
import { calculerTotal } from '../../data/calculs.js'
import { formaterDate, formaterDateCourte, formaterHeure, formaterHorodatage } from '../../data/dates.js'
import { materiel, piecesRequises, salles } from '../../data/mock.js'
import useChargement from '../../hooks/useChargement.js'
import useTitre from '../../hooks/useTitre.js'

// « Convention à signer » suit l'accord de la mairie : on la range avec les demandes accordées.
const onglets = [
  { id: 'a-traiter', libelle: 'À traiter', statuts: ['À instruire'] },
  { id: 'pieces', libelle: 'Pièces manquantes', statuts: ['Pièce manquante'] },
  { id: 'accordees', libelle: 'Accordées', statuts: ['Accordée', 'Convention à signer'] },
  { id: 'refusees', libelle: 'Refusées', statuts: ['Refusée'] },
  { id: 'toutes', libelle: 'Toutes', statuts: null },
]

const euros = (n) => `${n.toLocaleString('fr-FR')} €`
const salleDe = (d) => salles.find((s) => s.id === d.salleId)
const lignesMateriel = (d) =>
  materiel.filter((m) => d.materiel[m.id]).map((m) => `${d.materiel[m.id]} ${m.nom.toLowerCase()}`)
const etatPieces = (d) =>
  d.piecesManquantes.length ? `${piecesRequises.length - d.piecesManquantes.length}/${piecesRequises.length}` : 'Complet'

function Ligne({ libelle, children }) {
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-slate-600">{libelle}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </div>
  )
}

function Detail({ d, occupe, onStatut, onMessage }) {
  const [brouillon, setBrouillon] = useState('')
  const salle = salleDe(d)
  const total = calculerTotal(d)
  const incomplet = d.piecesManquantes.length > 0 || (d.evenement.buvette && !(d.buvette.conditions && d.buvette.signee))

  const envoyer = (e) => {
    e.preventDefault()
    if (!brouillon.trim()) return
    onMessage(brouillon.trim())
    setBrouillon('')
  }

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-base font-semibold">
          {d.demandeur.nom}, {salle?.nom}
        </h2>
        <p className="mt-1 text-slate-600">
          {d.numero} · <Statut statut={d.statut} />
        </p>
        <p className="mt-1 text-xs text-slate-600">Reçue le {formaterHorodatage(d.creeLe)}</p>
      </div>

      <section>
        <h3 className="mb-2 font-medium">Réservation</h3>
        <dl className="space-y-1">
          <Ligne libelle="Date">{formaterDate(d.date)}</Ligne>
          <Ligne libelle="Horaires">
            {formaterHeure(d.evenement.debut)} – {formaterHeure(d.evenement.fin)}
          </Ligne>
          <Ligne libelle="Événement">
            {d.evenement.type || 'Non précisé'} · {d.participants} pers. · {d.evenement.buvette ? 'avec' : 'sans'} buvette
          </Ligne>
          <Ligne libelle="Matériel">{lignesMateriel(d).join(', ') || 'Aucun'}</Ligne>
          {d.evenement.description && <Ligne libelle="Description">{d.evenement.description}</Ligne>}
        </dl>
      </section>

      <section>
        <h3 className="mb-2 font-medium">Demandeur</h3>
        <dl className="space-y-1">
          <Ligne libelle="Profil">{d.profil || '—'}</Ligne>
          <Ligne libelle="E-mail">
            <a href={`mailto:${d.demandeur.email}`} className={`rounded text-primary underline hover:text-primary-dark ${focusRing}`}>
              {d.demandeur.email}
            </a>
          </Ligne>
          <Ligne libelle="Téléphone">{d.demandeur.telephone || '—'}</Ligne>
        </dl>
      </section>

      <section>
        <h3 className="mb-2 font-medium">Contrôles automatiques</h3>
        <ul className="space-y-1">
          {d.controles.map((c) => (
            <li key={c.texte} className={`flex gap-2 ${c.ok ? '' : 'font-medium text-red-700'}`}>
              <span aria-hidden="true" className={c.ok ? 'text-green-700' : ''}>{c.ok ? '✓' : '⚠'}</span>
              <span>
                <span className="sr-only">{c.ok ? 'Conforme : ' : 'À vérifier : '}</span>
                {c.texte}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 font-medium">Pièces ({etatPieces(d)})</h3>
        <ul className="space-y-1">
          {piecesRequises.map((p) => {
            const fournie = d.pieces.find((x) => x.id === p.id)
            return (
              <li key={p.id} className="flex flex-wrap justify-between gap-x-2">
                <span>{p.nom}</span>
                <span className={`min-w-0 break-all ${fournie ? 'text-slate-600' : 'font-medium text-amber-800'}`}>
                  {fournie ? fournie.fichier : 'Manquante'}
                </span>
              </li>
            )
          })}
          {d.evenement.buvette && (
            <li className="flex flex-wrap justify-between gap-x-2">
              <span>Buvette : conditions et signature</span>
              <span className={d.buvette.conditions && d.buvette.signee ? 'text-slate-600' : 'font-medium text-amber-800'}>
                {d.buvette.conditions && d.buvette.signee ? 'Signées' : 'Incomplètes'}
              </span>
            </li>
          )}
        </ul>
      </section>

      {salle && (
        <p className="font-medium">
          Location {euros(salle.tarif)}
          {total > salle.tarif && ` + matériel ${euros(total - salle.tarif)}`} · Caution {euros(salle.caution)}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="secondary" disabled={incomplet || occupe || d.statut === 'Accordée'} onClick={() => onStatut('Accordée')}>
          {incomplet ? 'Accorder (dossier incomplet)' : d.statut === 'Accordée' ? 'Déjà accordée' : 'Accorder'}
        </Button>
        <Button variant="outline" disabled={occupe} onClick={() => onStatut('Pièce manquante')}>
          Demander une pièce
        </Button>
        <Button variant="outline" disabled={occupe || d.statut === 'Refusée'} className="text-red-700" onClick={() => onStatut('Refusée')}>
          {d.statut === 'Refusée' ? 'Déjà refusée' : 'Refuser'}
        </Button>
      </div>

      <section className="border-t border-slate-200 pt-4">
        <h3 className="mb-2 font-medium">Échanges avec le demandeur</h3>
        <ul className="mb-3 max-h-60 space-y-2 overflow-y-auto">
          {d.messages.map((m, i) => (
            <li key={i} className={`rounded-md p-2 ${m.auteur === 'Mairie' ? 'ml-6 bg-primary/10' : 'bg-slate-100'}`}>
              <p className="text-xs font-medium text-slate-600">
                {m.auteur === 'Vous' ? d.demandeur.nom : 'Mairie'} · {formaterHorodatage(m.creeLe)}
              </p>
              <p>{m.texte}</p>
            </li>
          ))}
          {d.messages.length === 0 && <li className="text-slate-600">Aucun message.</li>}
        </ul>
        <form onSubmit={envoyer} className="flex items-end gap-2">
          <Input label="Répondre" className="min-w-0 flex-1" value={brouillon} onChange={(e) => setBrouillon(e.target.value)} />
          <Button type="submit" disabled={!brouillon.trim() || occupe}>Envoyer</Button>
        </form>
      </section>
    </Card>
  )
}

export default function AdminDemandes() {
  useTitre('Back-office · Demandes')
  const [params, setParams] = useSearchParams()
  const numeroChoisi = params.get('dossier')
  const liste = useChargement(() => api.demandes(), [])
  const [recherche, setRecherche] = useState('')
  // Arrivée depuis le planning (?dossier=…) : on montre toutes les demandes pour que la ligne soit visible.
  const [onglet, setOnglet] = useState(() => (numeroChoisi ? 'toutes' : 'a-traiter'))
  const [retour, setRetour] = useState(null)
  const [occupe, setOccupe] = useState(false)
  const detailRef = useRef(null)

  const demandes = liste.donnees ?? []
  const statuts = onglets.find((o) => o.id === onglet).statuts
  const terme = recherche.trim().toLowerCase()
  const visibles = demandes.filter(
    (d) =>
      (!statuts || statuts.includes(d.statut)) &&
      (!terme || [d.numero, d.demandeur.nom, salleDe(d)?.nom ?? ''].some((t) => t.toLowerCase().includes(terme))),
  )
  const compte = (o) => (o.statuts ? demandes.filter((d) => o.statuts.includes(d.statut)).length : demandes.length)
  const selection = demandes.find((d) => d.numero === numeroChoisi)
  const trouvee = Boolean(selection)

  // Sous xl, le détail est sous le tableau : on le fait apparaître à l'écran.
  useEffect(() => {
    if (trouvee) detailRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [trouvee, numeroChoisi])

  const choisir = (numero) => setParams({ dossier: numero }, { replace: true })

  const agir = async (action, confirmation) => {
    setOccupe(true)
    try {
      await action()
      setRetour({ ok: true, texte: confirmation })
      liste.recharger()
    } catch (e) {
      setRetour({ ok: false, texte: e.message })
    } finally {
      setOccupe(false)
    }
  }

  const libellesStatut = {
    Accordée: 'accordée',
    Refusée: 'refusée',
    'Pièce manquante': 'en attente de pièce : le demandeur a reçu un message',
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <section className="min-w-0">
        <h1 className="mb-4 text-2xl font-semibold">Demandes de réservation</h1>

        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Input
            label="Rechercher"
            type="search"
            placeholder="N°, demandeur ou salle"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            className="min-w-48 flex-1"
          />
          <Button variant="outline" onClick={() => setRetour({ ok: true, texte: 'Export simulé : aucun fichier Excel n’est généré dans la démo.' })}>
            Exporter vers Excel
          </Button>
        </div>

        <p
          role={retour && !retour.ok ? 'alert' : 'status'}
          className={retour ? `mb-4 rounded-md px-3 py-2 text-sm ${retour.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}` : 'sr-only'}
        >
          {retour?.texte}
        </p>

        <div role="tablist" aria-label="Statut des demandes" className="mb-4 flex flex-wrap gap-x-1 border-b border-slate-300">
          {onglets.map((o) => (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={onglet === o.id}
              onClick={() => setOnglet(o.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap ${onglet === o.id ? 'border-primary text-slate-900' : 'border-transparent text-slate-600 hover:text-slate-900'} ${focusRing}`}
            >
              {o.libelle} ({compte(o)})
            </button>
          ))}
        </div>

        {/* Trois colonnes regroupées : le tableau tient à côté du détail sans défilement interne.
            Sous md, une liste de cartes remplace le tableau. */}
        {visibles.length === 0 ? (
          <p className="rounded-lg border border-slate-300 bg-white px-3 py-6 text-center text-sm text-slate-600">
            {liste.erreur ?? (liste.chargement ? 'Chargement…' : 'Aucune demande dans cette catégorie.')}
          </p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {visibles.map((d) => (
                <li key={d.numero}>
                  <button
                    type="button"
                    aria-current={d.numero === numeroChoisi ? 'true' : undefined}
                    onClick={() => choisir(d.numero)}
                    className={`block w-full rounded-lg border bg-white p-3 text-left text-sm ${d.numero === numeroChoisi ? 'border-primary bg-blue-50 ring-1 ring-primary' : 'border-slate-300 hover:bg-slate-50'} ${focusRing}`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-medium">{d.demandeur.nom}</span>
                      <Statut statut={d.statut} />
                    </span>
                    <span className="mt-1 block text-slate-700">
                      {salleDe(d)?.nom}
                      {lignesMateriel(d).length > 0 && ' + matériel'} · {formaterDateCourte(d.date)}
                    </span>
                    <span className="mt-1 flex justify-between gap-2 text-xs text-slate-600">
                      <span>{d.numero} · {d.profil.toLowerCase()}</span>
                      <span className={d.piecesManquantes.length ? 'font-medium text-amber-800' : ''}>Pièces : {etatPieces(d)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <table className="hidden w-full overflow-hidden rounded-lg border border-slate-300 bg-white text-left text-sm md:table">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">Demande</th>
                  <th scope="col" className="px-3 py-2 font-medium">Salle et date</th>
                  <th scope="col" className="px-3 py-2 font-medium">État</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((d) => (
                  <tr
                    key={d.numero}
                    tabIndex={0}
                    aria-current={d.numero === numeroChoisi ? 'true' : undefined}
                    onClick={() => choisir(d.numero)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        choisir(d.numero)
                      }
                    }}
                    className={`cursor-pointer border-t border-slate-200 align-top ${d.numero === numeroChoisi ? 'bg-blue-50' : 'hover:bg-slate-50'} ${focusRing}`}
                  >
                    <td className="px-3 py-2">
                      <p className="font-medium">{d.demandeur.nom}</p>
                      <p className="text-xs text-slate-600">{d.numero} · {d.profil.toLowerCase()}</p>
                    </td>
                    <td className="px-3 py-2">
                      <p>
                        {salleDe(d)?.nom}
                        {lignesMateriel(d).length > 0 && ' + matériel'}
                      </p>
                      <p className="text-xs text-slate-600">{formaterDateCourte(d.date)}</p>
                    </td>
                    <td className="px-3 py-2">
                      <Statut statut={d.statut} />
                      <p className={`mt-1 text-xs ${d.piecesManquantes.length ? 'font-medium text-amber-800' : 'text-slate-600'}`}>
                        Pièces : {etatPieces(d)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      <aside ref={detailRef} aria-label="Détail de la demande" className="min-w-0 scroll-mt-4">
        {selection ? (
          <Detail
            key={selection.numero}
            d={selection}
            occupe={occupe}
            onStatut={(statut) => agir(() => api.changerStatut(selection.numero, statut), `Demande ${selection.numero} ${libellesStatut[statut]}.`)}
            onMessage={(texte) => agir(() => api.ecrire(selection.numero, { auteur: 'Mairie', texte }), `Message envoyé à ${selection.demandeur.nom}.`)}
          />
        ) : (
          <Card className="text-slate-600">Sélectionnez une demande dans le tableau pour afficher son détail.</Card>
        )}
      </aside>
    </div>
  )
}
