import RecapDemande from '../../components/RecapDemande.jsx'
import Card from '../../components/ui/Card.jsx'
import Checkbox from '../../components/ui/Checkbox.jsx'
import { focusRing } from '../../components/ui/styles.js'
import { useDemande } from '../../context/DemandeContext.jsx'
import useTitre from '../../hooks/useTitre.js'
import { materiel, options } from '../../data/mock.js'

const boutonQuantite = `flex size-8 items-center justify-center rounded-md border border-slate-300 bg-white hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

export default function Materiel() {
  const { demande, update } = useDemande()
  useTitre('Matériel (étape 2 sur 6)')

  const changerQuantite = (m, n) => {
    const borne = Math.min(m.stock, Math.max(0, Number.isNaN(n) ? 0 : n))
    update({ materiel: { ...demande.materiel, [m.id]: borne } })
  }

  const basculerOption = (id) =>
    update({
      options: demande.options.includes(id) ? demande.options.filter((o) => o !== id) : [...demande.options, id],
    })

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <section className="min-w-0 space-y-4">
        <h1 className="text-2xl font-semibold">Matériel disponible</h1>
        <Card as="ul" className="divide-y divide-slate-200 p-0">
          {materiel.map((m) => {
            const quantite = demande.materiel[m.id] || 0
            const champId = `quantite-${m.id}`
            return (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <label htmlFor={champId} className="font-medium">
                    {m.nom} ({m.stock} dispo)
                  </label>
                  {m.prixJour > 0 && <p className="text-slate-600">{m.prixJour} € / jour</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={boutonQuantite}
                    onClick={() => changerQuantite(m, quantite - 1)}
                    disabled={quantite <= 0}
                    aria-label={`Retirer un élément : ${m.nom.toLowerCase()}`}
                  >
                    −
                  </button>
                  <input
                    id={champId}
                    type="number"
                    min={0}
                    max={m.stock}
                    value={quantite}
                    onChange={(e) => changerQuantite(m, parseInt(e.target.value, 10))}
                    className={`w-16 rounded-md border border-slate-300 px-2 py-1 text-center ${focusRing}`}
                  />
                  <button
                    type="button"
                    className={boutonQuantite}
                    onClick={() => changerQuantite(m, quantite + 1)}
                    disabled={quantite >= m.stock}
                    aria-label={`Ajouter un élément : ${m.nom.toLowerCase()}`}
                  >
                    +
                  </button>
                </div>
              </li>
            )
          })}
        </Card>
        <fieldset>
          <legend className="mb-2 font-semibold">Options</legend>
          <div className="flex flex-wrap gap-4">
            {options.map((o) => (
              <Checkbox key={o.id} label={o.nom} checked={demande.options.includes(o.id)} onChange={() => basculerOption(o.id)} />
            ))}
          </div>
        </fieldset>
      </section>
      <RecapDemande suivant="/reservation/vous" libelle="Continuer" />
    </div>
  )
}
