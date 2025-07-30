import imageCompression from 'browser-image-compression'

export interface OptimizedImageVersions {
  thumbnail: File
  medium: File
  large: File
  original?: File
}

export interface CompressionOptions {
  thumbnail: {
    maxSizeMB: 0.025 // 25KB
    maxWidthOrHeight: 150
    useWebWorker: true
    fileType: 'webp'
    quality: 0.85
  }
  medium: {
    maxSizeMB: 0.08 // 80KB
    maxWidthOrHeight: 600
    useWebWorker: true
    fileType: 'webp'
    quality: 0.8
  }
  large: {
    maxSizeMB: 0.2 // 200KB
    maxWidthOrHeight: 1200
    useWebWorker: true
    fileType: 'webp'
    quality: 0.75
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
      maxSizeMB: 0.025,
      maxWidthOrHeight: 150,
      useWebWorker: true,
      fileType: 'webp',
      quality: 0.85
    },
    medium: {
      maxSizeMB: 0.08,
      maxWidthOrHeight: 600,
      useWebWorker: true,
      fileType: 'webp',
      quality: 0.8
    },
    large: {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      fileType: 'webp',
      quality: 0.75
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
      // Manter original apenas se for necessário (muito grande)
      original: file.size > 2 * 1024 * 1024 ? file : undefined // >2MB
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
  const estimatedThumb = Math.min(25 * 1024, originalSize * 0.1) // ~25KB ou 10% do original
  const estimatedMedium = Math.min(80 * 1024, originalSize * 0.3) // ~80KB ou 30% do original  
  const estimatedLarge = Math.min(200 * 1024, originalSize * 0.5) // ~200KB ou 50% do original
  
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