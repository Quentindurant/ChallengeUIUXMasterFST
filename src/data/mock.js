// Données fictives pour la démo — aucune API.

export const salles = [
  { id: 'foyer-rural', nom: 'Foyer rural', capacite: 200, tarif: 250, equipements: ['Vidéoprojecteur', 'Enceinte'] },
  { id: 'frederic-mistral', nom: 'Frédéric Mistral', capacite: 30, tarif: 80, equipements: [] },
  { id: 'alain-dupuy', nom: 'Alain Dupuy', capacite: 30, tarif: 80, equipements: [] },
  { id: 'danton-cazelles', nom: 'Danton Cazelles', capacite: 30, tarif: 80, equipements: [] },
  { id: 'chapelle-gleyzette', nom: 'Chapelle de la Gleyzette', capacite: 30, tarif: 120, equipements: [] },
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

// Jours déjà réservés (novembre 2026) pour griser le calendrier.
export const joursIndisponibles = ['2026-11-07', '2026-11-08', '2026-11-14', '2026-11-15', '2026-11-28', '2026-11-29']

export const profils = ['Habitant', 'Association', 'Extérieur']

// Pièces justificatives ; « buvette » ajoute le bloc conditions + signature.
export const piecesRequises = [
  { id: 'identite', nom: "Pièce d'identité" },
  { id: 'domicile', nom: 'Justificatif de domicile' },
  { id: 'assurance', nom: "Attestation d'assurance" },
]

export const demandesAdmin = [
  { id: 1, demandeur: 'Julien (particulier)', objet: 'Foyer rural + matériel', date: 'sam. 21 nov.', pieces: '2/3', statut: 'Pièce manquante' },
  { id: 2, demandeur: 'Club de gym (association)', objet: 'Dojo chaque mardi soir', date: 'dès le 3 nov.', pieces: 'Complet', statut: 'À instruire' },
  { id: 3, demandeur: "Club d'échecs (association)", objet: 'Foyer rural + matériel', date: 'sam. 5 déc.', pieces: 'Complet', statut: 'À instruire' },
  { id: 4, demandeur: 'Sophie (particulier)', objet: 'Alain Dupuy', date: 'dim. 15 nov.', pieces: 'Complet', statut: 'Convention à signer' },
  { id: 5, demandeur: 'Marc (extérieur)', objet: 'Chapelle de la Gleyzette', date: 'sam. 28 nov.', pieces: 'Complet', statut: 'Convention à signer' },
]
