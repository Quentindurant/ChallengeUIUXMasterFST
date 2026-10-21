import { Link, useNavigate } from 'react-router'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import { focusRing } from '../components/ui/styles.js'
import useTitre from '../hooks/useTitre.js'

// Icônes SVG inline (trait 24×24), décoratives.
const Icone = ({ children, className = 'size-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
)

const encarts = [
  {
    titre: 'Disponibilités en temps réel',
    texte: 'Voyez tout de suite les salles libres à la date choisie.',
    icone: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" /></>,
  },
  {
    titre: 'Plus de PDF à imprimer',
    texte: 'La demande et les pièces justificatives se font en ligne.',
    icone: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></>,
  },
  {
    titre: 'Réponse par e-mail',
    texte: 'La mairie vous répond directement, sans vous déplacer.',
    icone: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  },
]

export default function Accueil() {
  const navigate = useNavigate()
  useTitre('Accueil')

  return (
    <section className="space-y-8">
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div>
          <h1 className="mb-3 text-2xl font-semibold">Réserver une salle ou du matériel</h1>
          <p className="mb-6 text-slate-600">
            Salles municipales et matériel de Lacroix-Falgarde, en quelques étapes et sans paperasse.
          </p>
          <div className="mb-4 flex flex-wrap gap-3">
            <Button onClick={() => navigate('/recherche')}>Réserver une salle</Button>
            <Button variant="outline" onClick={() => navigate('/reservation/materiel')}>Emprunter du matériel</Button>
          </div>
          <Link to="/mes-demandes" className={`rounded text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900 ${focusRing}`}>
            Suivre ma demande
          </Link>
        </div>

        <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-slate-200 text-slate-600">
          <Icone className="size-24">
            <path d="M3 21h18M5 21V10l7-5 7 5v11" />
            <path d="M10 21v-5h4v5M9 12h.01M15 12h.01" />
          </Icone>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {encarts.map((e) => (
          <Card key={e.titre}>
            <div className="mb-2 text-slate-700"><Icone>{e.icone}</Icone></div>
            <h2 className="mb-1 text-base font-semibold">{e.titre}</h2>
            <p className="text-slate-600">{e.texte}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
