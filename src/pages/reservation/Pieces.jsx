import { useEffect, useRef } from 'react'
import RecapDemande from '../../components/RecapDemande.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Checkbox from '../../components/ui/Checkbox.jsx'
import { focusRing } from '../../components/ui/styles.js'
import { useDemande } from '../../context/DemandeContext.jsx'
import useTitre from '../../hooks/useTitre.js'
import { piecesRequises } from '../../data/mock.js'

// Le tracé n'est pas dans la demande (seulement signee: bool) : on le garde ici pour le redessiner au retour sur l'étape.
let traceSignature = null

function ZoneDepot({ piece, onFichier }) {
  const fichierRef = useRef(null)
  const photoRef = useRef(null)
  const choisir = (e) => {
    const fichier = e.target.files?.[0]
    if (fichier) onFichier(fichier.name)
    e.target.value = ''
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 p-3">
      <input ref={fichierRef} type="file" className="hidden" onChange={choisir} aria-label={`${piece.nom} : fichier`} />
      <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={choisir} aria-label={`${piece.nom} : photo`} />
      <Button variant="outline" onClick={() => fichierRef.current.click()}>Choisir un fichier</Button>
      <Button variant="outline" onClick={() => photoRef.current.click()}>Prendre une photo</Button>
    </div>
  )
}

function Signature({ signee, onChange }) {
  const canvasRef = useRef(null)
  const enCours = useRef(false)

  useEffect(() => {
    if (!signee || !traceSignature) return
    const img = new Image()
    img.onload = () => canvasRef.current?.getContext('2d').drawImage(img, 0, 0)
    img.src = traceSignature
    // Redessin uniquement au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const position = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return [((e.clientX - rect.left) * canvas.width) / rect.width, ((e.clientY - rect.top) * canvas.height) / rect.height]
  }

  const commencer = (e) => {
    const ctx = canvasRef.current.getContext('2d')
    canvasRef.current.setPointerCapture(e.pointerId)
    enCours.current = true
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f172a'
    ctx.beginPath()
    ctx.moveTo(...position(e))
  }

  const tracer = (e) => {
    if (!enCours.current) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(...position(e))
    ctx.stroke()
  }

  const terminer = () => {
    if (!enCours.current) return
    enCours.current = false
    traceSignature = canvasRef.current.toDataURL()
    if (!signee) onChange(true)
  }

  const effacer = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    traceSignature = null
    onChange(false)
  }

  return (
    <div>
      <p id="aide-signature" className="mb-1 text-sm font-medium text-slate-700">Signature</p>
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        aria-describedby="aide-signature"
        className="h-40 w-full cursor-crosshair touch-none rounded-md border-2 border-dashed border-slate-300 bg-white"
        onPointerDown={commencer}
        onPointerMove={tracer}
        onPointerUp={terminer}
        onPointerCancel={terminer}
      />
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-slate-600">{signee ? 'Signature enregistrée.' : 'Signez avec la souris ou le doigt.'}</p>
        <Button variant="outline" onClick={effacer}>Effacer</Button>
      </div>
    </div>
  )
}

export default function Pieces() {
  const { demande, update } = useDemande()
  const { buvette } = demande
  useTitre('Pièces justificatives (étape 5 sur 6)')

  const fichierDe = (id) => demande.pieces.find((p) => p.id === id)?.fichier
  const deposer = (id, fichier) => update({ pieces: [...demande.pieces.filter((p) => p.id !== id), { id, fichier }] })
  const retirer = (id) => update({ pieces: demande.pieces.filter((p) => p.id !== id) })
  const changerBuvette = (champ, valeur) => update({ buvette: { ...buvette, [champ]: valeur } })

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <section className="min-w-0 space-y-4">
        <h1 className="text-2xl font-semibold">Pièces justificatives</h1>
        <Card as="ul" className="divide-y divide-slate-200 p-0">
          {piecesRequises.map((piece) => {
            const fichier = fichierDe(piece.id)
            return (
              <li key={piece.id} className="p-4">
                <div className="flex items-center gap-3">
                  {fichier ? (
                    <svg viewBox="0 0 20 20" className="size-5 shrink-0 text-green-600" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="size-5 shrink-0 rounded-full border-2 border-slate-300" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{piece.nom}</p>
                    <p className={`truncate text-xs ${fichier ? 'text-green-700' : 'text-slate-600'}`}>
                      {fichier ?? 'À fournir'}
                    </p>
                  </div>
                  {fichier && (
                    <button type="button" onClick={() => retirer(piece.id)} className={`rounded text-xs text-slate-600 underline hover:text-slate-900 ${focusRing}`}>
                      Retirer
                    </button>
                  )}
                </div>
                {!fichier && <ZoneDepot piece={piece} onFichier={(nom) => deposer(piece.id, nom)} />}
              </li>
            )
          })}
        </Card>

        {demande.evenement.buvette && (
          <Card className="space-y-4">
            <h2 className="text-base font-semibold">Buvette</h2>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Checkbox
                label="J'ai lu les conditions d'acceptation de la buvette"
                checked={buvette.conditions}
                onChange={(e) => changerBuvette('conditions', e.target.checked)}
              />
              <a
                href="https://www.lacroixfalgarde.fr/files/associations/2019/Debits-de-boissons-temporaires.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded text-sm text-primary underline hover:text-primary-dark ${focusRing}`}
              >
                Consulter le formulaire (PDF)
                <span className="sr-only">, s'ouvre dans un nouvel onglet</span>
              </a>
            </div>
            <Signature signee={buvette.signee} onChange={(v) => changerBuvette('signee', v)} />
          </Card>
        )}
      </section>
      <RecapDemande suivant="/reservation/envoi" libelle="Continuer" afficherPieces />
    </div>
  )
}
