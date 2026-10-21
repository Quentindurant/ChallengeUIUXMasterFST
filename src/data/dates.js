// Formats français partagés par toutes les pages.

const deuxChiffres = (n) => String(n).padStart(2, '0')

// 'AAAA-MM-JJ' en heure locale : toISOString() décalerait la date selon le fuseau.
export const versIso = (annee, mois, jour) => `${annee}-${deuxChiffres(mois + 1)}-${deuxChiffres(jour)}`

export function aujourdhui() {
  const d = new Date()
  return versIso(d.getFullYear(), d.getMonth(), d.getDate())
}

// Le T00:00 force l'heure locale (sinon décalage selon le fuseau).
const versDate = (iso) => new Date(`${iso}T00:00`)
const valide = (iso) => Boolean(iso) && !Number.isNaN(versDate(iso).getTime())

// 'AAAA-MM-JJ' → « samedi 21 novembre 2026 ».
export function formaterDate(iso) {
  if (!valide(iso)) return 'Date à choisir'
  return versDate(iso).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// 'AAAA-MM-JJ' → « sam. 21 nov. », pour les tableaux.
export function formaterDateCourte(iso) {
  if (!valide(iso)) return '—'
  return versDate(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

// '10:00' → « 10 h », '10:30' → « 10 h 30 ».
export function formaterHeure(hhmm) {
  if (!hhmm) return '—'
  const [h, m] = hhmm.split(':')
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`
}

// '2026-10-21 14:05:00' (SQLite) → « 21 oct. à 14 h 05 ».
export function formaterHorodatage(texte) {
  if (!texte) return ''
  const [jour, heure] = texte.split(' ')
  const date = versDate(jour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return heure ? `${date} à ${formaterHeure(heure.slice(0, 5))}` : date
}
