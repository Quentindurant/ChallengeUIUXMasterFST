import { useId } from 'react'
import { useNavigate } from 'react-router'
import { useDemande } from '../context/DemandeContext.jsx'
import { calculerTotal } from '../data/calculs.js'
import { formaterDate } from '../data/dates.js'
import { materiel, piecesRequises, salles } from '../data/mock.js'
import Button from './ui/Button.jsx'
import Card from './ui/Card.jsx'

// Encart « Votre demande » affiché à droite de chaque étape (dessous sur mobile).
// raison : phrase affichée sous le bouton quand il est désactivé.
export default function RecapDemande({ suivant, libelle = 'Continuer', disabled = false, raison, afficherPieces = false }) {
  const { demande } = useDemande()
  const navigate = useNavigate()
  const raisonId = useId()
  const salle = salles.find((s) => s.id === demande.salleId)
  const lignesMateriel = materiel
    .filter((m) => demande.materiel[m.id])
    .map((m) => `${demande.materiel[m.id]} ${m.nom.toLowerCase()}`)
  const afficherRaison = disabled && raison

  return (
    <Card as="aside" aria-label="Votre demande" className="h-fit">
      <h2 className="mb-2 text-base font-semibold">Votre demande</h2>
      <p className="font-medium">{salle?.nom ?? 'Aucune salle choisie'}</p>
      <p className="text-slate-600">{formaterDate(demande.date)} · Journée</p>
      <p className="text-slate-600">Matériel : {lignesMateriel.join(', ') || 'aucun'}</p>
      {afficherPieces && (
        <p className="text-slate-600">Pièces : {demande.pieces.length} sur {piecesRequises.length}</p>
      )}
      <p className="mt-3 font-semibold">Total : {calculerTotal(demande)} €</p>
      {suivant && (
        <>
          <Button
            full
            onClick={() => navigate(suivant)}
            disabled={disabled}
            aria-describedby={afficherRaison ? raisonId : undefined}
            className="mt-3"
          >
            {libelle}
          </Button>
          <p id={raisonId} aria-live="polite" className={afficherRaison ? 'mt-2 text-xs text-amber-800' : 'sr-only'}>
            {afficherRaison ? raison : ''}
          </p>
        </>
      )}
    </Card>
  )
}
