import { useNavigate } from 'react-router'
import { useDemande } from '../context/DemandeContext.jsx'
import { profils, salles } from '../data/mock.js'
import useTitre from '../hooks/useTitre.js'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Select from '../components/ui/Select.jsx'

export default function Recherche() {
  const { demande, update } = useDemande()
  const navigate = useNavigate()
  useTitre('Rechercher une salle')

  // Filtrage en direct : le bouton « Rechercher » est purement visuel.
  const participants = Number(demande.participants) || 0
  const resultats = salles.filter((s) => s.capacite >= participants)

  const voir = (salleId) => {
    update({ salleId })
    navigate('/reservation/salle')
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">Rechercher une salle</h1>
      <div className="grid gap-6 md:grid-cols-[18rem_1fr]">
        <Card as="form" aria-label="Votre recherche" className="space-y-4 self-start" onSubmit={(e) => e.preventDefault()}>
          <Input label="Date" type="date" value={demande.date} onChange={(e) => update({ date: e.target.value })} />
          <Input
            label="Nombre de participants"
            type="number"
            min="1"
            value={demande.participants}
            onChange={(e) => update({ participants: e.target.value === '' ? '' : Number(e.target.value) })}
          />
          <Select label="Profil" options={profils} value={demande.profil} onChange={(e) => update({ profil: e.target.value })} />
          <Button type="submit" full>Rechercher</Button>
        </Card>

        <div className="min-w-0">
          <h2 className="mb-3 text-base font-semibold">
            {resultats.length} salle{resultats.length > 1 ? 's' : ''} disponible{resultats.length > 1 ? 's' : ''}
          </h2>
          {resultats.length === 0 ? (
            <Card className="text-slate-600">Aucune salle ne peut accueillir {participants} personnes.</Card>
          ) : (
            <ul className="space-y-3">
              {resultats.map((s) => (
                <li key={s.id}>
                  <Card className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{s.nom}</h3>
                      <p className="text-slate-600">{s.capacite} pers. · {s.tarif} €</p>
                    </div>
                    <Button variant="outline" onClick={() => voir(s.id)} aria-label={`Voir ${s.nom}`}>Voir</Button>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
