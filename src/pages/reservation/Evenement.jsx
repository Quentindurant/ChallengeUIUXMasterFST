import RecapDemande from '../../components/RecapDemande.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Radio from '../../components/ui/Radio.jsx'
import Select from '../../components/ui/Select.jsx'
import Textarea from '../../components/ui/Textarea.jsx'
import { useDemande } from '../../context/DemandeContext.jsx'
import useTitre from '../../hooks/useTitre.js'
import { salles } from '../../data/mock.js'

const typesEvenement = ['Fête familiale', 'Anniversaire', 'Réunion', 'Assemblée générale', 'Spectacle', 'Autre']

export default function Evenement() {
  const { demande, update } = useDemande()
  const { evenement } = demande
  useTitre('Événement (étape 4 sur 6)')
  const salle = salles.find((s) => s.id === demande.salleId)
  const tropDeMonde = salle && demande.participants > salle.capacite

  const changer = (champ, valeur) => update({ evenement: { ...evenement, [champ]: valeur } })

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <section className="min-w-0 space-y-4">
        <h1 className="text-2xl font-semibold">Votre événement</h1>
        <Card className="space-y-4">
          <Select
            label="Type d'événement"
            options={[{ value: '', label: 'Choisir…' }, ...typesEvenement]}
            value={evenement.type}
            onChange={(e) => changer('type', e.target.value)}
          />
          <div>
            <Input
              label="Participants"
              type="number"
              min={1}
              value={demande.participants}
              onChange={(e) => update({ participants: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              aria-describedby={tropDeMonde ? 'alerte-capacite' : undefined}
            />
            {tropDeMonde && (
              <p id="alerte-capacite" role="alert" className="mt-1 text-xs font-medium text-red-700">
                La salle {salle.nom} accueille {salle.capacite} personnes maximum.
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Heure de début" type="time" value={evenement.debut} onChange={(e) => changer('debut', e.target.value)} />
            <Input label="Heure de fin" type="time" value={evenement.fin} onChange={(e) => changer('fin', e.target.value)} />
          </div>
          <Textarea label="Description" value={evenement.description} onChange={(e) => changer('description', e.target.value)} />
        </Card>
        <Card as="fieldset" aria-describedby="aide-buvette">
          <legend className="float-left mb-2 w-full font-semibold">Buvette ?</legend>
          <div className="clear-left flex gap-6">
            <Radio name="buvette" label="Oui" checked={evenement.buvette === true} onChange={() => changer('buvette', true)} />
            <Radio name="buvette" label="Non" checked={evenement.buvette === false} onChange={() => changer('buvette', false)} />
          </div>
          <p id="aide-buvette" className="mt-2 text-xs text-slate-600">
            Avec buvette, des pièces supplémentaires vous seront demandées.
          </p>
        </Card>
      </section>
      <RecapDemande suivant="/reservation/pieces" libelle="Continuer" />
    </div>
  )
}
