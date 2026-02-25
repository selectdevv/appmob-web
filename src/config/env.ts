const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL
  
  if (!envUrl) {
    throw new Error('VITE_BACKEND_URL não está configurada no arquivo .env')
  }
  
  return envUrl.trim().replace(/\/$/, '')
}

export const BACKEND_URL = getBackendUrl()
