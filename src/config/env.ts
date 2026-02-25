const getBackendUrl = (): string => {
  const envUrl = import.meta.env.VITE_BACKEND_URL
  
  if (envUrl) {
    return envUrl.trim().replace(/\/$/, '')
  }
  
  return 'https://appmob-back.onrender.com'
}

export const BACKEND_URL = getBackendUrl()
