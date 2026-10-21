import { useRef, useState } from 'react'
import { Link } from 'react-router'
import Statut from '../components/Statut.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import Input from '../components/ui/Input.jsx'
import { focusRing } from '../components/ui/styles.js'
import { useDemande } from '../context/DemandeContext.jsx'
import { api, dernierDossier, memoriserDossier } from '../data/api.js'
import { aujourdhui, formaterDate, formaterHorodatage } from '../data/dates.js'
import { salles } from '../data/mock.js'
import useChargement from '../hooks/useChargement.js'
import useTitre from '../hooks/useTitre.js'

const nomSalle = (id) => salles.find((s) => s.id === id)?.nom ?? 'Salle inconnue'

function CarteDemande({ d, choisie, onChoisir, onPiece }) {
  const fichierRef = useRef(null)
  const manquante = d.piecesManquantes[0]

  const choisirFichier = (e) => {
    const fichier = e.target.files?.[0]
    if (fichier) onPiece(d.numero, { id: manquante.id, fichier: fichier.name })
    e.target.value = ''
  }

  return (
    <Card aria-current={choisie ? 'true' : undefined} className={`space-y-3 ${choisie ? 'border-primary ring-1 ring-primary' : ''}`}>
      <p className="text-xs text-slate-600">N° {d.numero}</p>
      <h2 className="text-base font-semibold">
        {nomSalle(d.salleId)}, {formaterDate(d.date)}
      </h2>
      <p>
        Statut : <Statut statut={d.statut} usager />
      </p>
      {manquante && d.statut !== 'Refusée' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-amber-800">Pièce manquante : {manquante.nom.toLowerCase()}</p>
          <input ref={fichierRef} type="file" className="hidden" onChange={choisirFichier} aria-label={`${manquante.nom} : fichier`} />
          <Button variant="secondary" onClick={() => fichierRef.current.click()}>Ajouter la pièce</Button>
        </div>
      )}
      {!choisie && (
        <Button variant="outline" onClick={() => onChoisir(d.numero)}>
          Voir les échanges ({d.messages.length})
        </Button>
      )}
    </Card>
  )
}

export default function Suivi() {
  const { demande } = useDemande()
  useTitre('Mes demandes')

  // Connecté (étape Vous) : toutes les demandes de cet e-mail. Sinon : le dernier dossier envoyé ou un numéro saisi.
  const email = demande.demandeur.email.trim()
  const [numeroSuivi, setNumeroSuivi] = useState(() => demande.numeroDossier ?? dernierDossier())
  const [saisie, setSaisie] = useState('')
  const liste = useChargement(
    () => (email ? api.demandes(email) : numeroSuivi ? api.demande(numeroSuivi).then((d) => [d]) : Promise.resolve([])),
    [email, numeroSuivi],
  )

  const [onglet, setOnglet] = useState('en-cours')
  const [selection, setSelection] = useState(null)
  const [brouillon, setBrouillon] = useState('')
  const [retour, setRetour] = useState(null)
  const [prevenir, setPrevenir] = useState({ email: true, sms: false })

  const demandes = liste.donnees ?? []
  const today = aujourdhui()
  const enCours = demandes.filter((d) => d.statut !== 'Refusée' && d.date >= today)
  const passees = demandes.filter((d) => !enCours.includes(d))
  const visibles = onglet === 'en-cours' ? enCours : passees
  const choisie =
    visibles.find((d) => d.numero === selection) ?? visibles.find((d) => d.numero === numeroSuivi) ?? visibles[0]

  const onglets = [
    { id: 'en-cours', libelle: `En cours (${enCours.length})` },
    { id: 'passees', libelle: `Passées ou refusées (${passees.length})` },
  ]

  const agir = async (action, confirmation) => {
    try {
      await action()
      setRetour({ ok: true, texte: confirmation })
      liste.recharger()
    } catch (e) {
      setRetour({ ok: false, texte: e.message })
    }
  }

  const envoyerMessage = (e) => {
    e.preventDefault()
    const texte = brouillon.trim()
    if (!texte || !choisie) return
    agir(() => api.ecrire(choisie.numero, { auteur: 'Vous', texte }), 'Message envoyé à la mairie.')
    setBrouillon('')
  }

  const rechercher = (e) => {
    e.preventDefault()
    const numero = saisie.trim().toUpperCase()
    if (!numero) return
    memoriserDossier(numero)
    setNumeroSuivi(numero)
  }

  const sansDossier = !email && (!numeroSuivi || liste.erreur)

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Mes demandes</h1>

      {retour && (
        <p role={retour.ok ? 'status' : 'alert'} className={`mb-4 rounded-md px-3 py-2 text-sm ${retour.ok ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {retour.texte}
        </p>
      )}

      {sansDossier ? (
        <Card as="form" onSubmit={rechercher} className="max-w-md space-y-4">
          <h2 className="text-base font-semibold">Retrouver une demande</h2>
          {liste.erreur && <p role="alert" className="text-red-700">{liste.erreur}</p>}
          <Input label="Numéro de dossier" placeholder="RES-2026-0142" value={saisie} onChange={(e) => setSaisie(e.target.value)} />
          <Button type="submit" disabled={!saisie.trim()}>Rechercher</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="min-w-0">
            <div role="tablist" aria-label="Mes demandes" className="mb-4 flex gap-1 overflow-x-auto border-b border-slate-300">
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

            {liste.erreur ? (
              <p role="alert" className="text-red-700">{liste.erreur}</p>
            ) : liste.chargement && !liste.donnees ? (
              <p className="text-slate-600">Chargement…</p>
            ) : visibles.length === 0 ? (
              <p className="text-slate-600">{onglet === 'en-cours' ? 'Aucune demande en cours.' : 'Aucune demande passée.'}</p>
            ) : (
              <ul className="space-y-3">
                {visibles.map((d) => (
                  <li key={d.numero}>
                    <CarteDemande
                      d={d}
                      choisie={d === choisie}
                      onChoisir={setSelection}
                      onPiece={(numero, piece) => agir(() => api.ajouterPiece(numero, piece), `Pièce envoyée : ${piece.fichier}`)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Card className="h-fit space-y-4">
            <h2 className="text-base font-semibold">
              Échanges avec la mairie{choisie && <span className="font-normal text-slate-600"> · {choisie.numero}</span>}
            </h2>
            {choisie ? (
              <>
                <ul className="max-h-72 space-y-2 overflow-y-auto" aria-live="polite">
                  {choisie.messages.map((m, i) => (
                    <li key={i} className={`rounded-md p-3 ${m.auteur === 'Mairie' ? 'bg-slate-100' : 'ml-8 bg-primary/10'}`}>
                      <p className="text-xs font-medium text-slate-600">
                        {m.auteur} · {formaterHorodatage(m.creeLe)}
                      </p>
                      <p>{m.texte}</p>
                    </li>
                  ))}
                  {choisie.messages.length === 0 && <li className="text-slate-600">Aucun message pour l’instant.</li>}
                </ul>
                <form onSubmit={envoyerMessage} className="flex items-end gap-2">
                  <Input
                    label="Votre message"
                    className="min-w-0 flex-1"
                    value={brouillon}
                    onChange={(e) => setBrouillon(e.target.value)}
                    placeholder="Écrire à la mairie…"
                  />
                  <Button type="submit" disabled={!brouillon.trim()}>Envoyer</Button>
                </form>
              </>
            ) : (
              <p className="text-slate-600">Choisissez une demande pour voir les échanges.</p>
            )}
            <div className="border-t border-slate-200 pt-4">
              <fieldset>
                <legend className="mb-2 font-semibold">Me prévenir de chaque étape par</legend>
                <div className="flex gap-6">
                  <Checkbox label="E-mail" checked={prevenir.email} onChange={(e) => setPrevenir({ ...prevenir, email: e.target.checked })} />
                  <Checkbox label="SMS" checked={prevenir.sms} onChange={(e) => setPrevenir({ ...prevenir, sms: e.target.checked })} />
                </div>
              </fieldset>
            </div>
          </Card>
        </div>
      )}

      <Link
        to="/admin"
        className={`mt-6 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 ${focusRing}`}
      >
        Voir côté mairie
      </Link>
    </section>
  )
}
