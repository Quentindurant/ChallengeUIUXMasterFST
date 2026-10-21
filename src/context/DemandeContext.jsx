import { createContext, useContext, useState } from 'react'

// État de la demande en cours, partagé par toutes les étapes du parcours.
const initial = {
  date: '2026-11-21',
  participants: 30,
  profil: 'Habitant',
  salleId: null,
  materiel: {}, // { tables: 5, bancs: 8 }
  options: [],
  demandeur: { nom: '', email: '', telephone: '' },
  evenement: { type: '', debut: '10:00', fin: '23:00', description: '', buvette: false },
  pieces: [], // [{ id, fichier }]
  buvette: { conditions: false, signee: false },
  numeroDossier: null,
}

const DemandeContext = createContext(null)

export function DemandeProvider({ children }) {
  const [demande, setDemande] = useState(initial)
  const update = (patch) => setDemande((d) => ({ ...d, ...patch }))
  const reset = () => setDemande(initial)
  return <DemandeContext.Provider value={{ demande, update, reset }}>{children}</DemandeContext.Provider>
}

// Le hook vit à côté de son Provider : le rechargement à chaud recharge simplement ce fichier en entier.
// oxlint-disable-next-line react/only-export-components
export const useDemande = () => useContext(DemandeContext)
