// Catalogue de la démo, partagé par le front et le serveur (server/). Les demandes vivent dans SQLite.

export const salles = [
  { id: 'foyer-rural', nom: 'Foyer rural', capacite: 200, tarif: 250, caution: 1500, equipements: ['Vidéoprojecteur', 'Enceinte'] },
  { id: 'frederic-mistral', nom: 'Frédéric Mistral', capacite: 30, tarif: 80, caution: 500, equipements: [] },
  { id: 'alain-dupuy', nom: 'Alain Dupuy', capacite: 30, tarif: 80, caution: 500, equipements: [] },
  { id: 'danton-cazelles', nom: 'Danton Cazelles', capacite: 30, tarif: 80, caution: 500, equipements: [] },
  { id: 'chapelle-gleyzette', nom: 'Chapelle de la Gleyzette', capacite: 30, tarif: 120, caution: 500, equipements: [] },
]

export const materiel = [
  { id: 'tables', nom: 'Tables intérieures', stock: 18, prixJour: 0 },
  { id: 'bancs', nom: 'Bancs', stock: 70, prixJour: 0 },
  { id: 'barnum', nom: 'Barnum', stock: 4, prixJour: 50 },
  { id: 'barrieres', nom: 'Barrières', stock: 20, prixJour: 0 },
]

export const options = [
  { id: 'videoprojecteur', nom: 'Vidéoprojecteur' },
  { id: 'enceinte', nom: 'Enceinte' },
]

export const profils = ['Habitant', 'Association', 'Extérieur']

// Pièces justificatives ; « buvette » ajoute le bloc conditions + signature.
export const piecesRequises = [
  { id: 'identite', nom: "Pièce d'identité" },
  { id: 'domicile', nom: 'Justificatif de domicile' },
  { id: 'assurance', nom: "Attestation d'assurance" },
]
