import imageCompression from 'browser-image-compression'

export interface OptimizedImageVersions {
  thumbnail: File
  medium: File
  large: File
  original?: File
}

export interface CompressionOptions {
  thumbnail: {
    maxSizeMB: 0.03 // 30KB
    maxWidthOrHeight: 200
    useWebWorker: true
    fileType: 'webp'
    quality: 0.85
  }
  medium: {
    maxSizeMB: 0.15 // 150KB - Balanced for previews
    maxWidthOrHeight: 800
    useWebWorker: true
    fileType: 'webp'
    quality: 0.80
  }
  large: {
    maxSizeMB: 0.4 // 400KB - Balanced for full screen (Sharp enough without being huge)
    maxWidthOrHeight: 1600 // Full HDish
    useWebWorker: true
    fileType: 'webp'
    quality: 0.85
  }
}

/**
 * Otimiza uma imagem criando múltiplas versões (thumbnail, medium, large)
 * com compressão inteligente e conversão para WebP
 */
export async function optimizeImage(
  file: File,
  index: number = 0
): Promise<OptimizedImageVersions> {
  if (!file || !(file instanceof File)) {
    throw new Error('Arquivo inválido fornecido')
  }

  // Verificar se é uma imagem
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo deve ser uma imagem')
  }

  const options: CompressionOptions = {
    thumbnail: {
      maxSizeMB: 0.03,
      maxWidthOrHeight: 200,
      useWebWorker: true,
      fileType: 'webp',
      quality: 0.85
    },
    medium: {
      maxSizeMB: 0.15,
      maxWidthOrHeight: 800,
      useWebWorker: true,
      fileType: 'webp',
      quality: 0.80
    },
    large: {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'webp',
      quality: 0.85
    }
  }

  try {
    // Gerar timestamp para nomes únicos
    const timestamp = Date.now()

    // Comprimir em paralelo para melhor performance
    const [thumbnailFile, mediumFile, largeFile] = await Promise.all([
      imageCompression(file, options.thumbnail),
      imageCompression(file, options.medium),
      imageCompression(file, options.large)
    ])

    // Renomear os arquivos após compressão
    const renamedFiles = [
      new File([thumbnailFile], `thumb_${index}_${timestamp}.webp`, { type: 'image/webp' }),
      new File([mediumFile], `medium_${index}_${timestamp}.webp`, { type: 'image/webp' }),
      new File([largeFile], `large_${index}_${timestamp}.webp`, { type: 'image/webp' })
    ]

    const [renamedThumbnail, renamedMedium, renamedLarge] = renamedFiles


    return {
      thumbnail: renamedThumbnail,
      medium: renamedMedium,
      large: renamedLarge,
      // Não enviamos mais o original, forçamos o uso do WebP otimizado (large)
      original: undefined
    }

  } catch (error) {
    console.error('Erro ao otimizar imagem:', error)
    throw new Error(`Falha na otimização da imagem: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

/**
 * Estima o tamanho total após otimização
 */
export function estimateOptimizedSize(originalSize: number): {
  estimated: number
  savings: number
  savingsPercentage: number
} {
  // Estimativa baseada nas configurações de compressão
  const estimatedThumb = Math.min(30 * 1024, originalSize * 0.1)
  const estimatedMedium = Math.min(150 * 1024, originalSize * 0.4)
  const estimatedLarge = Math.min(400 * 1024, originalSize * 0.7)

  const estimated = estimatedThumb + estimatedMedium + estimatedLarge
  const savings = originalSize - estimated
  const savingsPercentage = (savings / originalSize) * 100

  return {
    estimated: Math.max(estimated, 0),
    savings: Math.max(savings, 0),
    savingsPercentage: Math.max(savingsPercentage, 0)
  }
}

/**
 * Converte bytes para formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * Cria preview URL de uma versão otimizada
 */
export function createOptimizedPreview(file: File): string {
  return URL.createObjectURL(file)
}