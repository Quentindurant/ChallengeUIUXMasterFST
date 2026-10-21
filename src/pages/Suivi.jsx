import { useRef, useState } from 'react'
import { Link } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Checkbox from '../components/ui/Checkbox.jsx'
import Input from '../components/ui/Input.jsx'
import { focusRing } from '../components/ui/styles.js'
import { useDemande } from '../context/DemandeContext.jsx'
import { formaterDate } from '../data/dates.js'
import { piecesRequises, salles } from '../data/mock.js'
import useTitre from '../hooks/useTitre.js'

const onglets = [
  { id: 'en-cours', libelle: 'En cours (1)' },
  { id: 'passees', libelle: 'Passées' },
]

const messageInitial = {
  auteur: 'Mairie',
  texte: "Bonjour, votre demande est en cours d'instruction. Merci de nous transmettre l'attestation d'assurance.",
}

export default function Suivi() {
  const { demande, update } = useDemande()
  const [onglet, setOnglet] = useState('en-cours')
  const [pieceAjoutee, setPieceAjoutee] = useState(null)
  const [messages, setMessages] = useState([messageInitial])
  const [brouillon, setBrouillon] = useState('')
  const [prevenir, setPrevenir] = useState({ email: true, sms: false })
  const fichierRef = useRef(null)
  useTitre('Mes demandes')

  const numero = demande.numeroDossier ?? 'RES-2026-0142'
  const salle = salles.find((s) => s.id === demande.salleId)?.nom ?? 'Foyer rural'
  const date = formaterDate(demande.date || '2026-11-21')

  // Accès direct sans parcours : on reprend le scénario de démo (attestation d'assurance manquante).
  // Après un vrai envoi, la pièce ajoutée rejoint la demande : le back-office la voit aussi.
  const pieceManquante = demande.numeroDossier
    ? piecesRequises.find((p) => !demande.pieces.some((d) => d.id === p.id))
    : !pieceAjoutee && piecesRequises.find((p) => p.id === 'assurance')
  const manque = Boolean(pieceManquante)

  const choisirFichier = (e) => {
    const fichier = e.target.files?.[0]
    if (fichier) {
      setPieceAjoutee(fichier.name)
      if (demande.numeroDossier) update({ pieces: [...demande.pieces, { id: pieceManquante.id, fichier: fichier.name }] })
    }
    e.target.value = ''
  }

  const envoyerMessage = (e) => {
    e.preventDefault()
    const texte = brouillon.trim()
    if (!texte) return
    setMessages((m) => [...m, { auteur: 'Vous', texte }])
    setBrouillon('')
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Mes demandes</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div role="tablist" aria-label="Mes demandes" className="mb-4 flex gap-1 border-b border-slate-300">
            {onglets.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={onglet === o.id}
                onClick={() => setOnglet(o.id)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${onglet === o.id ? 'border-primary text-slate-900' : 'border-transparent text-slate-600 hover:text-slate-900'} ${focusRing}`}
              >
                {o.libelle}
              </button>
            ))}
          </div>

          {onglet === 'en-cours' ? (
            <Card className="space-y-3">
              <p className="text-xs text-slate-600">N° {numero}</p>
              <h2 className="text-base font-semibold">{salle}, {date}</h2>
              <p>
                Statut :{' '}
                <span className={`font-medium ${manque ? 'text-amber-700' : 'text-green-700'}`}>
                  {manque ? 'Instruction en cours' : 'Dossier complet'}
                </span>
              </p>
              {manque && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300 bg-amber-50 p-3">
                  <p role="alert" className="text-amber-800">
                    Pièce manquante : {pieceManquante.nom.toLowerCase()}
                  </p>
                  <input ref={fichierRef} type="file" className="hidden" onChange={choisirFichier} aria-label={`${pieceManquante.nom} : fichier`} />
                  <Button variant="secondary" onClick={() => fichierRef.current.click()}>Ajouter la pièce</Button>
                </div>
              )}
              {pieceAjoutee && <p className="text-xs text-green-700">Pièce envoyée : {pieceAjoutee}</p>}
            </Card>
          ) : (
            <p className="text-slate-600">Aucune demande passée.</p>
          )}
        </div>

        <Card className="space-y-4">
          <h2 className="text-base font-semibold">Échanges avec la mairie</h2>
          <ul className="max-h-72 space-y-2 overflow-y-auto" aria-live="polite">
            {messages.map((m, i) => (
              <li key={i} className={`rounded-md p-3 ${m.auteur === 'Mairie' ? 'bg-slate-100' : 'ml-8 bg-primary/10'}`}>
                <p className="text-xs font-medium text-slate-600">{m.auteur}</p>
                <p>{m.texte}</p>
              </li>
            ))}
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

      <Link
        to="/admin"
        className={`mt-6 inline-block rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 ${focusRing}`}
      >
        Voir côté mairie
      </Link>
    </section>
  )
}
