// Appels à l'API SQLite locale, servie par Vite sous /api (dossier server/).
async function requete(chemin, { methode = 'GET', corps } = {}) {
  let reponse
  try {
    reponse = await fetch(`/api${chemin}`, {
      method: methode,
      headers: corps ? { 'Content-Type': 'application/json' } : undefined,
      body: corps ? JSON.stringify(corps) : undefined,
    })
  } catch {
    throw new Error('Impossible de joindre le serveur. Vérifiez que « npm run dev » tourne.')
  }
  const donnees = await reponse.json().catch(() => null)
  if (!reponse.ok) throw new Error(donnees?.erreur ?? `Erreur du serveur (${reponse.status}).`)
  return donnees
}

const enc = encodeURIComponent

export const api = {
  datesOccupees: (salleId) => requete(`/salles/${enc(salleId)}/disponibilites`),
  stockReserve: (date) => requete(`/stock?date=${enc(date ?? '')}`),
  planning: () => requete('/planning'),
  demandes: (email) => requete(email ? `/demandes?email=${enc(email)}` : '/demandes'),
  demande: (numero) => requete(`/demandes/${enc(numero)}`),
  envoyer: (demande) => requete('/demandes', { methode: 'POST', corps: demande }),
  changerStatut: (numero, statut) => requete(`/demandes/${enc(numero)}`, { methode: 'PATCH', corps: { statut } }),
  ajouterPiece: (numero, piece) => requete(`/demandes/${enc(numero)}/pieces`, { methode: 'POST', corps: piece }),
  ecrire: (numero, message) => requete(`/demandes/${enc(numero)}/messages`, { methode: 'POST', corps: message }),
}

// Dernier dossier envoyé depuis ce navigateur : « Mes demandes » le retrouve après un rechargement.
const CLE_DOSSIER = 'lacroix-falgarde:dossier'

export function dernierDossier() {
  try {
    return localStorage.getItem(CLE_DOSSIER)
  } catch {
    return null
  }
}

export function memoriserDossier(numero) {
  try {
    localStorage.setItem(CLE_DOSSIER, numero)
  } catch {
    // Stockage bloqué (navigation privée) : le suivi passera par le numéro saisi.
  }
}
