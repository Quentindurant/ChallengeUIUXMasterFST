import { useEffect, useState } from 'react'
import RecapDemande from '../../components/RecapDemande.jsx'
import Card from '../../components/ui/Card.jsx'
import { focusRing } from '../../components/ui/styles.js'
import { useDemande } from '../../context/DemandeContext.jsx'
import useTitre from '../../hooks/useTitre.js'
import { joursIndisponibles, salles } from '../../data/mock.js'

const joursSemaine = [
  { court: 'L', long: 'lundi' },
  { court: 'M', long: 'mardi' },
  { court: 'M', long: 'mercredi' },
  { court: 'J', long: 'jeudi' },
  { court: 'V', long: 'vendredi' },
  { court: 'S', long: 'samedi' },
  { court: 'D', long: 'dimanche' },
]

const deuxChiffres = (n) => String(n).padStart(2, '0')

// 'AAAA-MM-JJ' en heure locale : toISOString() décalerait la date selon le fuseau.
const versChaine = (annee, mois, jour) => `${annee}-${deuxChiffres(mois + 1)}-${deuxChiffres(jour)}`

function aujourdhui() {
  const d = new Date()
  return versChaine(d.getFullYear(), d.getMonth(), d.getDate())
}

function Calendrier({ selection, onChoisir }) {
  // Sans date choisie (champ vidé dans la recherche), le calendrier s'ouvre sur le mois en cours.
  const [annee, moisSel] = (selection || aujourdhui()).split('-').map(Number)
  const [vue, setVue] = useState({ annee, mois: moisSel - 1 })

  const nomMois = new Date(vue.annee, vue.mois, 1).toLocaleDateString('fr-FR', { month: 'long' })
  const titre = `${nomMois.charAt(0).toUpperCase()}${nomMois.slice(1)} ${vue.annee}`
  const nbJours = new Date(vue.annee, vue.mois + 1, 0).getDate()
  // getDay() : 0 = dimanche ; on décale pour commencer la semaine le lundi.
  const decalage = (new Date(vue.annee, vue.mois, 1).getDay() + 6) % 7
  const today = aujourdhui()

  const changerMois = (delta) =>
    setVue(({ annee: a, mois: m }) => {
      const d = new Date(a, m + delta, 1)
      return { annee: d.getFullYear(), mois: d.getMonth() }
    })

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => changerMois(-1)} aria-label="Mois précédent" className={`rounded px-2 py-1 hover:bg-slate-100 ${focusRing}`}>
          ‹
        </button>
        <h2 className="text-base font-semibold" aria-live="polite">{titre}</h2>
        <button type="button" onClick={() => changerMois(1)} aria-label="Mois suivant" className={`rounded px-2 py-1 hover:bg-slate-100 ${focusRing}`}>
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {joursSemaine.map((j) => (
          <abbr key={j.long} title={j.long} className="py-1 text-xs font-medium text-slate-600 no-underline">
            {j.court}
          </abbr>
        ))}
        {Array.from({ length: decalage }, (_, i) => <span key={`vide-${i}`} />)}
        {Array.from({ length: nbJours }, (_, i) => {
          const jour = i + 1
          const date = versChaine(vue.annee, vue.mois, jour)
          const indisponible = joursIndisponibles.includes(date) || date < today
          const choisi = date === selection
          const etat = indisponible ? 'indisponible' : choisi ? 'sélectionné' : 'disponible'
          return (
            <button
              key={date}
              type="button"
              disabled={indisponible}
              onClick={() => onChoisir(date)}
              aria-label={`${jour} ${nomMois} ${vue.annee}, ${etat}`}
              aria-pressed={choisi}
              className={`rounded py-2 text-sm ${focusRing} ${
                indisponible
                  ? 'cursor-not-allowed bg-slate-100 text-slate-500 line-through'
                  : choisi
                    ? 'bg-yellow-300 font-semibold text-slate-900'
                    : 'hover:bg-slate-100'
              }`}
            >
              {jour}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

export default function Salle() {
  const { demande, update } = useDemande()
  const salle = salles.find((s) => s.id === demande.salleId)
  useTitre('Salle (étape 1 sur 6)')

  const dateIndisponible = demande.date && (joursIndisponibles.includes(demande.date) || demande.date < aujourdhui())
  const raison = !salle
    ? 'Choisissez une salle pour continuer.'
    : !demande.date
      ? 'Choisissez une date dans le calendrier pour continuer.'
      : dateIndisponible
        ? "Cette date n'est pas disponible : choisissez-en une autre dans le calendrier."
        : null

  useEffect(() => {
    if (!demande.salleId) update({ salleId: 'foyer-rural' })
  }, [demande.salleId, update])

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <section className="min-w-0 space-y-4">
        {salle && (
          <>
            <h1 className="text-2xl font-semibold">{salle.nom}</h1>
            <div className="flex h-40 items-center justify-center rounded-lg bg-slate-200 text-sm text-slate-600" role="img" aria-label={`Illustration de la salle ${salle.nom}`}>
              Photo de la salle
            </div>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>Équipements : {salle.equipements.join(', ') || 'aucun'}</li>
              <li>Capacité : {salle.capacite} personnes</li>
              <li>Tarif : {salle.tarif} € la journée</li>
            </ul>
          </>
        )}
        <Calendrier selection={demande.date} onChoisir={(date) => update({ date })} />
      </section>
      <RecapDemande suivant="/reservation/materiel" libelle="Continuer" disabled={Boolean(raison)} raison={raison} />
    </div>
  )
}
