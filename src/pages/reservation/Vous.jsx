import RecapDemande from '../../components/RecapDemande.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import { useDemande } from '../../context/DemandeContext.jsx'
import useTitre from '../../hooks/useTitre.js'
import { profils } from '../../data/mock.js'

// Connexion fictive : pré-remplit un faux usager.
const usagerFictif = { nom: 'Julien Particulier', email: 'julien@example.fr', telephone: '06 12 34 56 78' }

export default function Vous() {
  const { demande, update } = useDemande()
  const { demandeur } = demande
  const connecte = demandeur.email === usagerFictif.email && demandeur.nom === usagerFictif.nom
  useTitre('Vous (étape 3 sur 6)')

  const nomManquant = !demandeur.nom.trim()
  const emailManquant = !demandeur.email.trim()
  const emailInvalide = !emailManquant && !/^\S+@\S+\.\S+$/.test(demandeur.email.trim())
  const raison =
    nomManquant && emailManquant
      ? 'Renseignez votre nom et votre e-mail, ou connectez-vous, pour continuer.'
      : nomManquant
        ? 'Renseignez votre nom et prénom pour continuer.'
        : emailManquant
          ? 'Renseignez votre e-mail pour continuer : la mairie vous répond par ce biais.'
          : emailInvalide
            ? "L'adresse e-mail semble incomplète (exemple : nom@domaine.fr)."
            : null

  const changer = (champ) => (e) => update({ demandeur: { ...demandeur, [champ]: e.target.value } })

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <section className="min-w-0 space-y-4">
        <h1 className="text-2xl font-semibold">Vous</h1>
        <Card>
          {connecte ? (
            <p className="font-medium" role="status">
              Connecté en tant que {usagerFictif.nom}
            </p>
          ) : (
            <Button variant="outline" onClick={() => update({ demandeur: usagerFictif, profil: 'Habitant' })}>
              Se connecter
            </Button>
          )}
        </Card>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="h-px flex-1 bg-slate-300" aria-hidden="true" />
          Ou remplissez une seule fois
          <span className="h-px flex-1 bg-slate-300" aria-hidden="true" />
        </div>
        <Card className="space-y-4">
          <Select label="Profil" options={profils} value={demande.profil} onChange={(e) => update({ profil: e.target.value })} />
          <Input label="Nom et prénom" autoComplete="name" required value={demandeur.nom} onChange={changer('nom')} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="E-mail" type="email" autoComplete="email" required value={demandeur.email} onChange={changer('email')} />
            <Input label="Téléphone" type="tel" autoComplete="tel" value={demandeur.telephone} onChange={changer('telephone')} />
          </div>
        </Card>
      </section>
      <RecapDemande suivant="/reservation/evenement" libelle="Continuer" disabled={Boolean(raison)} raison={raison} />
    </div>
  )
}
