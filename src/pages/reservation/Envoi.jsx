import { useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { focusRing } from '../../components/ui/styles.js'
import { useDemande } from '../../context/DemandeContext.jsx'
import { api, memoriserDossier } from '../../data/api.js'
import { calculerTotal } from '../../data/calculs.js'
import { formaterDate, formaterHeure } from '../../data/dates.js'
import { materiel, piecesRequises, salles } from '../../data/mock.js'
import useTitre from '../../hooks/useTitre.js'

export default function Envoi() {
  const { demande, update } = useDemande()
  const navigate = useNavigate()
  const [infoCaution, setInfoCaution] = useState(false)
  const [envoi, setEnvoi] = useState({ enCours: false, erreur: null })
  useTitre('Envoi (étape 6 sur 6)')

  const salle = salles.find((s) => s.id === demande.salleId)
  const total = calculerTotal(demande)
  const tarifSalle = salle?.tarif || 0
  const lignesMateriel = materiel
    .filter((m) => demande.materiel[m.id])
    .map((m) => `${demande.materiel[m.id]} ${m.nom.toLowerCase()}`)
  const { demandeur, evenement } = demande

  const lignes = [
    ['Salle', salle?.nom ?? 'Aucune salle choisie'],
    ['Date', `${formaterDate(demande.date)}, de ${formaterHeure(evenement.debut)} à ${formaterHeure(evenement.fin)}`],
    ['Matériel', lignesMateriel.join(', ') || 'Aucun'],
    ['Demandeur', [demandeur.nom, demandeur.email, demandeur.telephone].filter(Boolean).join(' · ') || 'Non renseigné'],
    [
      'Événement',
      `${evenement.type || 'Type non précisé'} · ${demande.participants} participants · ${evenement.buvette ? 'avec' : 'sans'} buvette`,
    ],
    ['Pièces', `${demande.pieces.length} sur ${piecesRequises.length}`],
  ]

  // Le serveur revérifie tout (créneau, stock, champs) : un refus s'affiche sous le bouton.
  const envoyer = async () => {
    setEnvoi({ enCours: true, erreur: null })
    try {
      const { numero } = await api.envoyer(demande)
      memoriserDossier(numero)
      update({ numeroDossier: numero })
      navigate('/confirmation')
    } catch (e) {
      setEnvoi({ enCours: false, erreur: e.message })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <section className="min-w-0">
        <h1 className="mb-4 text-2xl font-semibold">Récapitulatif</h1>
        <Card className="p-0">
          <table className="w-full text-left">
            <caption className="sr-only">Récapitulatif de votre demande</caption>
            <tbody className="divide-y divide-slate-200">
              {lignes.map(([libelle, valeur]) => (
                <tr key={libelle}>
                  <th scope="row" className="w-28 p-3 align-top font-medium text-slate-600 sm:w-32 sm:p-4">{libelle}</th>
                  <td className="p-3 break-words sm:p-4">{valeur}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      <Card as="aside" className="h-fit">
        <h2 className="mb-2 text-base font-semibold">Montant</h2>
        <dl className="space-y-1">
          <div className="flex justify-between">
            <dt className="text-slate-600">Salle</dt>
            <dd>{tarifSalle} €</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Matériel</dt>
            <dd>{total - tarifSalle} €</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold">
            <dt>Total</dt>
            <dd>{total} €</dd>
          </div>
        </dl>
        <button
          type="button"
          aria-expanded={infoCaution}
          aria-controls="info-caution"
          onClick={() => setInfoCaution((v) => !v)}
          className={`mt-3 rounded text-sm text-primary underline hover:text-primary-dark ${focusRing}`}
        >
          Info caution
        </button>
        {infoCaution && (
          <p id="info-caution" className="mt-2 rounded-md bg-slate-100 p-3 text-xs text-slate-700">
            Une caution de {(salle?.caution ?? 500).toLocaleString('fr-FR')} € vous sera demandée à la remise des clés. Elle n'est pas encaissée et vous est rendue
            après l'état des lieux.
          </p>
        )}
        <Button
          full
          onClick={envoyer}
          disabled={!salle || envoi.enCours}
          aria-describedby={!salle ? 'raison-envoi' : envoi.erreur ? 'erreur-envoi' : undefined}
          className="mt-4"
        >
          {envoi.enCours ? 'Envoi en cours…' : 'Envoyer ma demande'}
        </Button>
        {envoi.erreur && (
          <p id="erreur-envoi" role="alert" className="mt-2 text-xs text-red-700">
            {envoi.erreur}
          </p>
        )}
        {!salle && (
          <p id="raison-envoi" className="mt-2 text-xs text-amber-800">
            Choisissez une salle à l'étape Salle pour envoyer votre demande.
          </p>
        )}
      </Card>
    </div>
  )
}
