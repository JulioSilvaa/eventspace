import { apiClient } from '@/lib/api-client'
import { type OptimizedImageVersions } from './imageOptimizationService'

export interface UploadedImage {
  url: string
  display_order: number
}

export interface UploadedImageVersions {
  thumbnail_url: string
  medium_url: string
  large_url: string
  original_url?: string
  display_order: number
}

interface UploadResponse {
  message: string
  images: Array<{
    thumbnail: string
    medium: string
    large: string
    metadata?: {
      originalSize: number
      compressedSize: number
      format: string
      width: number
      height: number
    }
  }>
}

export async function uploadAdImages(
  adId: string,
  images: Array<{ id: string, file: File, preview: string }>
): Promise<UploadedImage[]> {
  if (!images || images.length === 0) {
    return []
  }

  const files = images.map(img => img.file)

  const { data, error } = await apiClient.uploadFiles<UploadResponse>(
    '/api/upload/images',
    files,
    { spaceId: adId }
  )

  if (error) {
    console.error('Erro no upload da imagem:', error)
    throw new Error(`Erro ao fazer upload das imagens: ${error.message}`)
  }

  if (!data?.images) {
    return []
  }

  return data.images.map((img, index) => ({
    url: img.medium || img.large || img.thumbnail,
    display_order: index
  }))
}

export async function uploadOptimizedAdImages(
  adId: string,
  optimizedImages: Array<{ id: string, optimized: OptimizedImageVersions, display_order: number }>
): Promise<UploadedImageVersions[]> {
  if (!optimizedImages || optimizedImages.length === 0) {
    return []
  }

  // The API handles optimization, so we just upload the original files
  const files: File[] = []

  for (const { optimized } of optimizedImages) {
    // Always use the optimized large version (WebP) as the main file
    if (optimized.large) {
      // Rename to ensure extension is correct if it was lost (though optimization service handles it)
      const blob = optimized.large.slice(0, optimized.large.size, 'image/webp')
      files.push(new File([blob], optimized.large.name, { type: 'image/webp' }))
    } else if (optimized.original) {
      // Fallback only if large is missing (should not happen with new logic)
      files.push(optimized.original)
    }
  }

  if (files.length === 0) {
    return []
  }

  const { data, error } = await apiClient.uploadFiles<UploadResponse>(
    '/api/upload/images',
    files,
    { spaceId: adId }
  )

  if (error) {
    console.error('Erro no upload das imagens otimizadas:', error)
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }

  if (!data?.images) {
    return []
  }

  return data.images.map((img, index) => ({
    thumbnail_url: img.thumbnail,
    medium_url: img.medium,
    large_url: img.large,
    display_order: optimizedImages[index]?.display_order || index
  }))
}

export async function saveImageRecords(
  _adId: string,
  _uploadedImages: UploadedImage[]
): Promise<void> {
  // The API handles saving image records automatically during space creation/update
  // This function is kept for API compatibility but does nothing
  // console.log('Image records are saved automatically by the API')
}

export async function deleteAdImages(_adId: string): Promise<void> {
  // Delete all images for an ad
  // The API handles this during space deletion
  // console.log(`Deleting images for ad ${adId} - handled by API`)
}

export async function deleteSpecificAdImages(imageIds: string[]): Promise<void> {
  if (!imageIds || imageIds.length === 0) {
    return
  }

  // Delete specific images by filename
  for (const imageId of imageIds) {
    try {
      await apiClient.delete(`/api/upload/images/${imageId}`)
    } catch (error) {
      console.error(`Erro ao deletar imagem ${imageId}:`, error)
    }
  }
}