import { fileURLToPath } from 'node:url'
import { piecesRequises } from '../src/data/mock.js'

// Base SQLite de la démo. Le catalogue (salles, matériel, pièces) reste dans src/data/mock.js,
// partagé avec le front ; la base ne garde que ce qui change : demandes, matériel réservé, pièces, messages.
const FICHIER = fileURLToPath(new URL('./reservations.db', import.meta.url))

const SCHEMA = `
CREATE TABLE IF NOT EXISTS demandes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero TEXT UNIQUE,
  statut TEXT NOT NULL,
  salle_id TEXT NOT NULL,
  date TEXT NOT NULL,
  debut TEXT,
  fin TEXT,
  participants INTEGER NOT NULL,
  profil TEXT,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  type_evenement TEXT,
  description TEXT,
  buvette INTEGER NOT NULL DEFAULT 0,
  conditions_buvette INTEGER NOT NULL DEFAULT 0,
  signature INTEGER NOT NULL DEFAULT 0,
  options TEXT NOT NULL DEFAULT '[]',
  cree_le TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS demandes_salle_date ON demandes (salle_id, date);

CREATE TABLE IF NOT EXISTS demande_materiel (
  demande_id INTEGER NOT NULL REFERENCES demandes (id) ON DELETE CASCADE,
  materiel_id TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  PRIMARY KEY (demande_id, materiel_id)
);

CREATE TABLE IF NOT EXISTS demande_pieces (
  demande_id INTEGER NOT NULL REFERENCES demandes (id) ON DELETE CASCADE,
  piece_id TEXT NOT NULL,
  fichier TEXT NOT NULL,
  depose_le TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  PRIMARY KEY (demande_id, piece_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  demande_id INTEGER NOT NULL REFERENCES demandes (id) ON DELETE CASCADE,
  auteur TEXT NOT NULL,
  texte TEXT NOT NULL,
  cree_le TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
`

export const numeroDe = (id, annee = new Date().getFullYear()) => `RES-${annee}-${String(id).padStart(4, '0')}`

// Demandes présentes au premier lancement. Ids 130 à 141 : la première demande de la démo sera RES-2026-0142.
// pieces = nombre de pièces déjà fournies, dans l'ordre de piecesRequises.
const jeuDeDepart = [
  { id: 130, nom: 'Nicolas Petit', profil: 'Extérieur', salle: 'foyer-rural', date: '2026-11-22', debut: '14:00', fin: '19:00', participants: 80, type: 'Spectacle', statut: 'Refusée', pieces: 3 },
  { id: 131, nom: 'Comité des fêtes', profil: 'Association', salle: 'foyer-rural', date: '2026-11-07', debut: '13:00', fin: '23:00', participants: 150, type: 'Loto', statut: 'Accordée', pieces: 3, materiel: { tables: 12, bancs: 40 } },
  { id: 132, nom: 'Comité des fêtes', profil: 'Association', salle: 'foyer-rural', date: '2026-11-08', debut: '13:00', fin: '19:00', participants: 120, type: 'Loto', statut: 'Accordée', pieces: 3, materiel: { tables: 12, bancs: 40 } },
  { id: 133, nom: 'Famille Garcia', profil: 'Habitant', salle: 'foyer-rural', date: '2026-11-14', debut: '15:00', fin: '23:59', participants: 140, type: 'Fête familiale', statut: 'Convention à signer', pieces: 3, buvette: true, materiel: { tables: 15, barnum: 2 } },
  { id: 134, nom: 'Famille Garcia', profil: 'Habitant', salle: 'foyer-rural', date: '2026-11-15', debut: '10:00', fin: '18:00', participants: 60, type: 'Fête familiale', statut: 'Convention à signer', pieces: 3 },
  { id: 135, nom: 'Sophie Martin', profil: 'Habitant', salle: 'alain-dupuy', date: '2026-11-15', debut: '14:00', fin: '20:00', participants: 25, type: 'Anniversaire', statut: 'Convention à signer', pieces: 3 },
  { id: 136, nom: 'Club de gym', profil: 'Association', salle: 'frederic-mistral', date: '2026-11-03', debut: '18:30', fin: '20:30', participants: 20, type: 'Réunion', statut: 'À instruire', pieces: 3 },
  { id: 137, nom: 'Marc Dubois', profil: 'Extérieur', salle: 'chapelle-gleyzette', date: '2026-11-28', debut: '20:00', fin: '22:30', participants: 30, type: 'Spectacle', statut: 'Convention à signer', pieces: 3 },
  { id: 138, nom: "Parents d'élèves", profil: 'Association', salle: 'foyer-rural', date: '2026-11-28', debut: '09:00', fin: '18:00', participants: 180, type: 'Autre', statut: 'Accordée', pieces: 3, materiel: { tables: 10, barrieres: 6 } },
  { id: 139, nom: "Parents d'élèves", profil: 'Association', salle: 'foyer-rural', date: '2026-11-29', debut: '09:00', fin: '13:00', participants: 100, type: 'Autre', statut: 'Accordée', pieces: 3, materiel: { tables: 10 } },
  { id: 140, nom: "Club d'échecs", profil: 'Association', salle: 'foyer-rural', date: '2026-12-05', debut: '09:00', fin: '19:00', participants: 60, type: 'Autre', statut: 'À instruire', pieces: 3, materiel: { tables: 15 } },
  { id: 141, nom: 'Lucas Bernard', profil: 'Habitant', salle: 'danton-cazelles', date: '2026-11-21', debut: '19:00', fin: '23:00', participants: 25, type: 'Anniversaire', statut: 'Pièce manquante', pieces: 2, materiel: { tables: 6 } },
]

const slug = (texte) =>
  texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')

function remplir(base) {
  const demande = base.prepare(`INSERT INTO demandes
    (id, numero, statut, salle_id, date, debut, fin, participants, profil, nom, email, telephone,
     type_evenement, description, buvette, conditions_buvette, signature, cree_le)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?)`)
  const materiel = base.prepare('INSERT INTO demande_materiel (demande_id, materiel_id, quantite) VALUES (?, ?, ?)')
  const piece = base.prepare('INSERT INTO demande_pieces (demande_id, piece_id, fichier, depose_le) VALUES (?, ?, ?, ?)')
  const message = base.prepare('INSERT INTO messages (demande_id, auteur, texte, cree_le) VALUES (?, ?, ?, ?)')

  base.exec('BEGIN')
  for (const d of jeuDeDepart) {
    const creeLe = `2026-10-${String(d.id - 125).padStart(2, '0')} 10:00:00`
    const buvette = d.buvette ? 1 : 0
    demande.run(d.id, numeroDe(d.id, 2026), d.statut, d.salle, d.date, d.debut, d.fin, d.participants, d.profil, d.nom,
      `${slug(d.nom)}@example.fr`, '05 61 00 00 00', d.type, buvette, buvette, buvette, creeLe)
    for (const [id, quantite] of Object.entries(d.materiel ?? {})) materiel.run(d.id, id, quantite)
    for (const p of piecesRequises.slice(0, d.pieces)) piece.run(d.id, p.id, `${p.id}-${slug(d.nom)}.pdf`, creeLe)
    if (d.pieces < piecesRequises.length) {
      const manquantes = piecesRequises.slice(d.pieces).map((p) => p.nom.toLowerCase()).join(', ')
      message.run(d.id, 'Mairie', `Bonjour, votre demande est en cours d'instruction. Merci de nous transmettre : ${manquantes}.`, creeLe)
    }
  }
  base.exec('COMMIT')
}

let instance = null

// Ouverture paresseuse : rien ne se passe tant que l'API n'est pas appelée (pas pendant « vite build »).
export function db() {
  if (!instance) {
    // Chargé ici et pas en import : Vite regroupe la config, un import remonterait au chargement de « vite build ».
    const { DatabaseSync } = process.getBuiltinModule('node:sqlite')
    instance = new DatabaseSync(FICHIER)
    instance.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;')
    instance.exec(SCHEMA)
    if (instance.prepare('SELECT COUNT(*) AS n FROM demandes').get().n === 0) remplir(instance)
  }
  return instance
}

// Vide la base et remet le jeu de départ (npm run db:reset), même si le serveur de dev tourne.
export function reinitialiser() {
  const base = db()
  base.exec('DELETE FROM messages; DELETE FROM demande_pieces; DELETE FROM demande_materiel; DELETE FROM demandes; DELETE FROM sqlite_sequence;')
  remplir(base)
}
