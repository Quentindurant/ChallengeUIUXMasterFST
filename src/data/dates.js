// Formats français partagés par toutes les pages.

// 'AAAA-MM-JJ' → « samedi 21 novembre 2026 ». Le T00:00 force l'heure locale (sinon décalage selon le fuseau).
export function formaterDate(iso) {
  const d = new Date(`${iso}T00:00`)
  if (!iso || Number.isNaN(d.getTime())) return 'Date à choisir'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// '10:00' → « 10 h », '10:30' → « 10 h 30 ».
export function formaterHeure(hhmm) {
  if (!hhmm) return '—'
  const [h, m] = hhmm.split(':')
  return m === '00' ? `${Number(h)} h` : `${Number(h)} h ${m}`
}
