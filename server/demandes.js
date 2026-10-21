import { materiel as catalogue, piecesRequises, salles } from '../src/data/mock.js'
import { db, numeroDe } from './db.js'

export class ErreurApi extends Error {
  constructor(statut, message) {
    super(message)
    this.statut = statut
  }
}

export const STATUTS = ['À instruire', 'Pièce manquante', 'Accordée', 'Convention à signer', 'Refusée']

// Une demande refusée libère le créneau et le matériel ; toutes les autres les bloquent dès l'envoi.
const BLOQUANTE = "statut <> 'Refusée'"

const ISO = /^\d{4}-\d{2}-\d{2}$/

function aujourdhui() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const jourCourt = (iso) => new Date(`${iso}T00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })

function ligne(numero) {
  const row = db().prepare('SELECT * FROM demandes WHERE numero = ?').get(numero)
  if (!row) throw new ErreurApi(404, `Aucune demande ne porte le numéro ${numero}.`)
  return row
}

// Quantités de matériel déjà prises à une date, toutes demandes non refusées confondues.
export function stockReserve(date, { saufId = null } = {}) {
  if (!ISO.test(date ?? '')) return {}
  const rows = db()
    .prepare(`SELECT dm.materiel_id AS id, SUM(dm.quantite) AS quantite
      FROM demande_materiel dm JOIN demandes d ON d.id = dm.demande_id
      WHERE d.date = ? AND d.${BLOQUANTE} AND d.id IS NOT ?
      GROUP BY dm.materiel_id`)
    .all(date, saufId)
  return Object.fromEntries(rows.map((r) => [r.id, r.quantite]))
}

export function datesOccupees(salleId) {
  if (!salles.some((s) => s.id === salleId)) throw new ErreurApi(404, 'Salle inconnue.')
  return db()
    .prepare(`SELECT DISTINCT date FROM demandes WHERE salle_id = ? AND ${BLOQUANTE} ORDER BY date`)
    .all(salleId)
    .map((r) => r.date)
}

function controles(row, materiel) {
  const salle = salles.find((s) => s.id === row.salle_id)
  const liste = []

  const autres = db()
    .prepare(`SELECT numero FROM demandes WHERE salle_id = ? AND date = ? AND id <> ? AND ${BLOQUANTE}`)
    .all(row.salle_id, row.date, row.id)
  liste.push(
    autres.length
      ? { ok: false, texte: `Créneau aussi demandé par ${autres.map((a) => a.numero).join(', ')}` }
      : { ok: true, texte: "Créneau verrouillé depuis l'envoi" },
  )

  if (salle) {
    liste.push({ ok: row.participants <= salle.capacite, texte: `${row.participants} participants pour ${salle.capacite} places` })
  }

  if (Object.keys(materiel).length) {
    const reserve = stockReserve(row.date, { saufId: row.id })
    const depasse = catalogue.filter((m) => materiel[m.id] && (reserve[m.id] ?? 0) + materiel[m.id] > m.stock)
    liste.push(
      depasse.length
        ? { ok: false, texte: `Stock insuffisant le ${jourCourt(row.date)} : ${depasse.map((m) => m.nom.toLowerCase()).join(', ')}` }
        : { ok: true, texte: `Matériel réservé dans le stock du ${jourCourt(row.date)}` },
    )
  }
  return liste
}

// Même forme que l'état du front (DemandeContext), plus ce que seule la base connaît.
function versObjet(row) {
  const base = db()
  const materiel = Object.fromEntries(
    base.prepare('SELECT materiel_id AS id, quantite FROM demande_materiel WHERE demande_id = ?').all(row.id).map((m) => [m.id, m.quantite]),
  )
  const pieces = base
    .prepare('SELECT piece_id AS id, fichier, depose_le AS deposeLe FROM demande_pieces WHERE demande_id = ?')
    .all(row.id)
    .map((p) => ({ ...p }))
  const messages = base
    .prepare('SELECT auteur, texte, cree_le AS creeLe FROM messages WHERE demande_id = ? ORDER BY id')
    .all(row.id)
    .map((m) => ({ ...m }))

  return {
    numero: row.numero,
    statut: row.statut,
    creeLe: row.cree_le,
    salleId: row.salle_id,
    date: row.date,
    participants: row.participants,
    profil: row.profil,
    materiel,
    options: JSON.parse(row.options),
    demandeur: { nom: row.nom, email: row.email, telephone: row.telephone ?? '' },
    evenement: { type: row.type_evenement ?? '', debut: row.debut, fin: row.fin, description: row.description ?? '', buvette: Boolean(row.buvette) },
    buvette: { conditions: Boolean(row.conditions_buvette), signee: Boolean(row.signature) },
    pieces,
    piecesManquantes: piecesRequises.filter((p) => !pieces.some((x) => x.id === p.id)).map((p) => ({ ...p })),
    messages,
    controles: controles(row, materiel),
  }
}

export const detail = (numero) => versObjet(ligne(numero))

export function lister({ email } = {}) {
  const rows = email
    ? db().prepare('SELECT * FROM demandes WHERE lower(email) = lower(?) ORDER BY date, id').all(email)
    : db().prepare('SELECT * FROM demandes ORDER BY date, id').all()
  return rows.map(versObjet)
}

export function planning() {
  return db()
    .prepare(`SELECT numero, salle_id AS salleId, date, statut, nom, type_evenement AS type, debut, fin
      FROM demandes WHERE ${BLOQUANTE} ORDER BY date, salle_id`)
    .all()
    .map((r) => ({ ...r }))
}

const texte = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export function creer(corps) {
  const salle = salles.find((s) => s.id === corps?.salleId)
  if (!salle) throw new ErreurApi(400, 'Choisissez une salle avant d’envoyer la demande.')
  const date = texte(corps.date, 10)
  if (!ISO.test(date)) throw new ErreurApi(400, 'Choisissez une date avant d’envoyer la demande.')
  if (date < aujourdhui()) throw new ErreurApi(400, 'Cette date est déjà passée.')

  const nom = texte(corps.demandeur?.nom)
  const email = texte(corps.demandeur?.email)
  if (!nom || !email) throw new ErreurApi(400, 'Renseignez votre nom et votre e-mail à l’étape Vous.')
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new ErreurApi(400, 'L’adresse e-mail semble incomplète.')

  const participants = Number.parseInt(corps.participants, 10)
  if (!(participants >= 1)) throw new ErreurApi(400, 'Indiquez le nombre de participants.')

  if (datesOccupees(salle.id).includes(date)) {
    throw new ErreurApi(409, `Le ${salle.nom} vient d’être réservé pour cette date. Choisissez un autre jour à l’étape Salle.`)
  }

  const materiel = catalogue
    .map((m) => [m, Math.max(0, Number.parseInt(corps.materiel?.[m.id], 10) || 0)])
    .filter(([, q]) => q > 0)
  const reserve = stockReserve(date)
  const manque = materiel.filter(([m, q]) => (reserve[m.id] ?? 0) + q > m.stock)
  if (manque.length) {
    const detailManque = manque.map(([m]) => `${m.nom.toLowerCase()} (${m.stock - (reserve[m.id] ?? 0)} disponibles)`).join(', ')
    throw new ErreurApi(409, `Stock insuffisant ce jour-là : ${detailManque}.`)
  }

  const pieces = (Array.isArray(corps.pieces) ? corps.pieces : [])
    .filter((p) => piecesRequises.some((r) => r.id === p?.id) && texte(p.fichier))
  const manquantes = piecesRequises.filter((r) => !pieces.some((p) => p.id === r.id))
  const evenement = corps.evenement ?? {}
  const buvette = evenement.buvette ? 1 : 0
  if (buvette && !(corps.buvette?.conditions && corps.buvette?.signee)) {
    throw new ErreurApi(400, 'Avec buvette, acceptez les conditions et signez à l’étape Pièces.')
  }

  const base = db()
  base.exec('BEGIN')
  try {
    const { lastInsertRowid: id } = base
      .prepare(`INSERT INTO demandes
        (statut, salle_id, date, debut, fin, participants, profil, nom, email, telephone,
         type_evenement, description, buvette, conditions_buvette, signature, options)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(
        manquantes.length ? 'Pièce manquante' : 'À instruire',
        salle.id, date, texte(evenement.debut, 5) || null, texte(evenement.fin, 5) || null, participants,
        texte(corps.profil, 40), nom, email, texte(corps.demandeur?.telephone, 30),
        texte(evenement.type, 60), texte(evenement.description, 2000),
        buvette, buvette && corps.buvette?.conditions ? 1 : 0, buvette && corps.buvette?.signee ? 1 : 0,
        JSON.stringify(Array.isArray(corps.options) ? corps.options.filter((o) => typeof o === 'string') : []),
      )
    base.prepare('UPDATE demandes SET numero = ? WHERE id = ?').run(numeroDe(id), id)

    const ajoutMateriel = base.prepare('INSERT INTO demande_materiel (demande_id, materiel_id, quantite) VALUES (?, ?, ?)')
    for (const [m, q] of materiel) ajoutMateriel.run(id, m.id, q)
    const ajoutPiece = base.prepare('INSERT INTO demande_pieces (demande_id, piece_id, fichier) VALUES (?, ?, ?)')
    for (const p of pieces) ajoutPiece.run(id, p.id, texte(p.fichier))

    if (manquantes.length) {
      base.prepare("INSERT INTO messages (demande_id, auteur, texte) VALUES (?, 'Mairie', ?)").run(
        id,
        `Bonjour, votre demande est en cours d'instruction. Merci de nous transmettre : ${manquantes.map((p) => p.nom.toLowerCase()).join(', ')}.`,
      )
    }
    base.exec('COMMIT')
    return detail(numeroDe(id))
  } catch (e) {
    base.exec('ROLLBACK')
    throw e
  }
}

const messagesStatut = {
  Accordée: 'Bonne nouvelle : votre demande est accordée. La convention de mise à disposition vous sera envoyée par e-mail.',
  Refusée: "Nous sommes désolés : votre demande ne peut pas être acceptée. N'hésitez pas à nous écrire pour trouver une autre date.",
}

export function changerStatut(numero, statut) {
  if (!STATUTS.includes(statut)) throw new ErreurApi(400, 'Statut inconnu.')
  const row = ligne(numero)
  const actuelle = versObjet(row)
  if (statut === 'Accordée' && actuelle.piecesManquantes.length) {
    throw new ErreurApi(409, 'Le dossier est incomplet : demandez d’abord la pièce manquante.')
  }
  if (statut === 'Accordée' && actuelle.evenement.buvette && !(actuelle.buvette.conditions && actuelle.buvette.signee)) {
    throw new ErreurApi(409, 'L’engagement buvette n’est pas signé.')
  }

  const base = db()
  base.prepare('UPDATE demandes SET statut = ? WHERE id = ?').run(statut, row.id)
  const texteMessage =
    statut === 'Pièce manquante'
      ? actuelle.piecesManquantes.length
        ? `Merci de nous transmettre : ${actuelle.piecesManquantes.map((p) => p.nom.toLowerCase()).join(', ')}.`
        : 'Merci de compléter votre dossier : une pièce doit être renvoyée.'
      : messagesStatut[statut]
  if (texteMessage) base.prepare("INSERT INTO messages (demande_id, auteur, texte) VALUES (?, 'Mairie', ?)").run(row.id, texteMessage)
  return detail(numero)
}

export function ajouterPiece(numero, corps) {
  const row = ligne(numero)
  if (!piecesRequises.some((p) => p.id === corps?.id)) throw new ErreurApi(400, 'Pièce inconnue.')
  const fichier = texte(corps.fichier)
  if (!fichier) throw new ErreurApi(400, 'Aucun fichier reçu.')

  const base = db()
  base
    .prepare(`INSERT INTO demande_pieces (demande_id, piece_id, fichier) VALUES (?, ?, ?)
      ON CONFLICT (demande_id, piece_id) DO UPDATE SET fichier = excluded.fichier, depose_le = datetime('now', 'localtime')`)
    .run(row.id, corps.id, fichier)

  // Dossier désormais complet : il repart dans la file « À traiter » de la mairie.
  const apres = detail(numero)
  if (row.statut === 'Pièce manquante' && apres.piecesManquantes.length === 0) {
    base.prepare("UPDATE demandes SET statut = 'À instruire' WHERE id = ?").run(row.id)
    return detail(numero)
  }
  return apres
}

export function ecrire(numero, corps) {
  const row = ligne(numero)
  if (!['Vous', 'Mairie'].includes(corps?.auteur)) throw new ErreurApi(400, 'Auteur inconnu.')
  const contenu = texte(corps.texte, 2000)
  if (!contenu) throw new ErreurApi(400, 'Le message est vide.')
  db().prepare('INSERT INTO messages (demande_id, auteur, texte) VALUES (?, ?, ?)').run(row.id, corps.auteur, contenu)
  return detail(numero)
}
