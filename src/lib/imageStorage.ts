const MAX_IMAGE_DIMENSION = 1280
const IMAGE_QUALITY = 0.78

const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Nao foi possivel processar a imagem.'))
    }

    image.src = objectUrl
  })
}

const getScaledDimensions = (width: number, height: number) => {
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height))

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export const convertImageFileToDataUrl = async (file: File): Promise<string> => {
  const image = await loadImageFromFile(file)
  const { width, height } = getScaledDimensions(image.width, image.height)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Nao foi possivel processar a imagem.')
  }

  context.drawImage(image, 0, 0, width, height)

  return canvas.toDataURL('image/jpeg', IMAGE_QUALITY)
}

export const isStorageQuotaExceededError = (error: unknown): boolean => {
  if (!(error instanceof DOMException)) {
    return false
  }

  return (
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    error.code === 22 ||
    error.code === 1014
  )
}
