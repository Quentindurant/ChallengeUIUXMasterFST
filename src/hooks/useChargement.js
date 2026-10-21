import { useEffect, useState } from 'react'

// Charge des données de l'API et relance quand une dépendance change.
// recharger() garde les données affichées pendant le nouvel appel : pas de clignotement après une action.
export default function useChargement(charger, dependances) {
  const [etat, setEtat] = useState({ donnees: null, erreur: null, chargement: true })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let actif = true
    setEtat((e) => ({ ...e, chargement: true }))
    charger()
      .then((donnees) => actif && setEtat({ donnees, erreur: null, chargement: false }))
      .catch((e) => actif && setEtat({ donnees: null, erreur: e.message, chargement: false }))
    return () => {
      actif = false
    }
    // charger change à chaque rendu : on suit seulement les dépendances déclarées.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependances, version])

  return { ...etat, recharger: () => setVersion((v) => v + 1) }
}
