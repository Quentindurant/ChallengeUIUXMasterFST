import { useEffect } from 'react'

// Titre de l'onglet du navigateur : « Page · Lacroix-Falgarde ».
export default function useTitre(titre) {
  useEffect(() => {
    document.title = `${titre} · Lacroix-Falgarde`
  }, [titre])
}
