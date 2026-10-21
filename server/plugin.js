// Branche l'API sur le serveur de dev et sur « vite preview ».
// Import différé : « vite build » n'ouvre jamais la base.
export function pluginApi() {
  const monter = async (serveur) => {
    const { api } = await import('./api.js')
    serveur.middlewares.use('/api', api)
  }
  return { name: 'api-sqlite', configureServer: monter, configurePreviewServer: monter }
}
