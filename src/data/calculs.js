import { materiel, salles } from './mock.js'

export function calculerTotal(demande) {
  const salle = salles.find((s) => s.id === demande.salleId)
  const totalMateriel = materiel.reduce((sum, m) => sum + (demande.materiel[m.id] || 0) * m.prixJour, 0)
  return (salle?.tarif || 0) + totalMateriel
}
