const couleurs = {
  'À instruire': 'bg-blue-100 text-blue-800',
  'Pièce manquante': 'bg-amber-100 text-amber-800',
  'Convention à signer': 'bg-violet-100 text-violet-800',
  Accordée: 'bg-green-100 text-green-800',
  Refusée: 'bg-red-100 text-red-800',
}

// Côté habitant, on parle de l'avancement plutôt que du vocabulaire interne de la mairie.
const libellesUsager = {
  'À instruire': 'Instruction en cours',
  'Convention à signer': 'Accordée, convention à signer',
}

// Badge de statut d'une demande, partagé par le suivi et le back-office.
export default function Statut({ statut, usager = false }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${couleurs[statut] ?? 'bg-slate-100 text-slate-700'}`}>
      {(usager && libellesUsager[statut]) || statut}
    </span>
  )
}
