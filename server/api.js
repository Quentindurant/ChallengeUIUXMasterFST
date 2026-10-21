import { ajouterPiece, changerStatut, creer, datesOccupees, detail, ecrire, ErreurApi, lister, planning, stockReserve } from './demandes.js'

// API JSON de la démo, montée par Vite sous /api (voir vite.config.js) : req.url arrive sans le préfixe.
// Pas d'authentification : c'est une démo locale.
const NUMERO = '(RES-\\d{4}-\\d{4})'

const routes = [
  ['GET', /^\/salles\/([\w-]+)\/disponibilites$/, ([salleId]) => datesOccupees(salleId)],
  ['GET', /^\/stock$/, (_, q) => stockReserve(q.get('date'))],
  ['GET', /^\/planning$/, () => planning()],
  ['GET', /^\/demandes$/, (_, q) => lister({ email: q.get('email') })],
  ['POST', /^\/demandes$/, (_, __, corps) => creer(corps)],
  ['GET', new RegExp(`^/demandes/${NUMERO}$`), ([numero]) => detail(numero)],
  ['PATCH', new RegExp(`^/demandes/${NUMERO}$`), ([numero], _, corps) => changerStatut(numero, corps?.statut)],
  ['POST', new RegExp(`^/demandes/${NUMERO}/pieces$`), ([numero], _, corps) => ajouterPiece(numero, corps)],
  ['POST', new RegExp(`^/demandes/${NUMERO}/messages$`), ([numero], _, corps) => ecrire(numero, corps)],
]

function lireCorps(req) {
  return new Promise((resolve, reject) => {
    let brut = ''
    req.setEncoding('utf8')
    req.on('data', (morceau) => {
      brut += morceau
      if (brut.length > 100_000) reject(new ErreurApi(413, 'Requête trop volumineuse.'))
    })
    req.on('end', () => {
      if (!brut) return resolve(null)
      try {
        resolve(JSON.parse(brut))
      } catch {
        reject(new ErreurApi(400, 'JSON invalide.'))
      }
    })
    req.on('error', reject)
  })
}

function repondre(res, statut, donnees) {
  res.statusCode = statut
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(donnees))
}

export async function api(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const chemin = decodeURIComponent(url.pathname)
  const memeChemin = routes.filter(([, motif]) => motif.test(chemin))
  const route = memeChemin.find(([methode]) => methode === req.method)

  if (!route) {
    return repondre(res, memeChemin.length ? 405 : 404, { erreur: memeChemin.length ? 'Méthode non autorisée.' : 'Route inconnue.' })
  }

  try {
    const [methode, motif, action] = route
    const corps = methode === 'GET' ? null : await lireCorps(req)
    const resultat = action(chemin.match(motif).slice(1), url.searchParams, corps)
    repondre(res, methode === 'POST' && chemin === '/demandes' ? 201 : 200, resultat)
  } catch (e) {
    if (e instanceof ErreurApi) return repondre(res, e.statut, { erreur: e.message })
    console.error('[api]', e)
    repondre(res, 500, { erreur: 'Erreur interne du serveur.' })
  }
}
