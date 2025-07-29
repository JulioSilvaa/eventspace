import { supabase } from '@/lib/supabase'
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

export async function uploadAdImages(
  adId: string, 
  images: Array<{id: string, file: File, preview: string}>
): Promise<UploadedImage[]> {
  if (!images || images.length === 0) {
    return []
  }
  
  const uploadedImages: UploadedImage[] = []
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const fileExt = image.file.name.split('.').pop()
    const fileName = `${adId}-${i}-${Date.now()}.${fileExt}`
    const filePath = fileName
    
    // Validar arquivo
    if (!image.file || !(image.file instanceof File)) {
      throw new Error(`Arquivo inválido na posição ${i + 1}`)
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Uploading image ${i + 1}:`, {
        fileName,
        fileType: image.file.type,
        fileSize: image.file.size,
        filePath
      })
    }
    
    try {
      // Upload para o Storage (usando bucket existente 'ad-images')  
      // Usar o arquivo File diretamente em vez de ArrayBuffer
      const { error: uploadError } = await supabase.storage
        .from('ad-images')
        .upload(filePath, image.file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        console.error('Erro no upload da imagem:', uploadError)
        if (uploadError.message?.includes('Bucket not found')) {
          throw new Error('Bucket de armazenamento não configurado. Entre em contato com o suporte.')
        }
        throw new Error(`Erro ao fazer upload da imagem ${i + 1}: ${uploadError.message}`)
      }
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath)
      
      uploadedImages.push({
        url: urlData.publicUrl,
        display_order: i
      })
      
    } catch (error) {
      console.error(`Erro ao processar imagem ${i + 1}:`, error)
      throw error
    }
  }
  
  return uploadedImages
}

export async function uploadOptimizedAdImages(
  adId: string,
  optimizedImages: Array<{id: string, optimized: OptimizedImageVersions, display_order: number}>
): Promise<UploadedImageVersions[]> {
  if (!optimizedImages || optimizedImages.length === 0) {
    return []
  }

  const uploadedVersions: UploadedImageVersions[] = []

  for (let i = 0; i < optimizedImages.length; i++) {
    const { optimized, display_order } = optimizedImages[i]
    const timestamp = Date.now()
    
    try {
      // Upload de cada versão em paralelo para melhor performance
      const uploadPromises = [
        // Thumbnail
        supabase.storage
          .from('ad-images')
          .upload(`${adId}/thumb_${display_order}_${timestamp}.webp`, optimized.thumbnail, {
            cacheControl: '31536000', // 1 ano de cache
            upsert: false
          }),
        
        // Medium
        supabase.storage
          .from('ad-images')
          .upload(`${adId}/medium_${display_order}_${timestamp}.webp`, optimized.medium, {
            cacheControl: '31536000',
            upsert: false
          }),
        
        // Large
        supabase.storage
          .from('ad-images')
          .upload(`${adId}/large_${display_order}_${timestamp}.webp`, optimized.large, {
            cacheControl: '31536000',
            upsert: false
          })
      ]

      // Upload original apenas se existir
      if (optimized.original) {
        const originalExt = optimized.original.name.split('.').pop() || 'jpg'
        uploadPromises.push(
          supabase.storage
            .from('ad-images')
            .upload(`${adId}/original_${display_order}_${timestamp}.${originalExt}`, optimized.original, {
              cacheControl: '31536000',
              upsert: false
            })
        )
      }

      const uploadResults = await Promise.all(uploadPromises)

      // Verificar erros de upload
      for (const result of uploadResults) {
        if (result.error) {
          console.error('Erro no upload:', result.error)
          throw new Error(`Erro no upload: ${result.error.message}`)
        }
      }

      // Obter URLs públicas
      const thumbnailUrl = supabase.storage
        .from('ad-images')
        .getPublicUrl(`${adId}/thumb_${display_order}_${timestamp}.webp`).data.publicUrl

      const mediumUrl = supabase.storage
        .from('ad-images')
        .getPublicUrl(`${adId}/medium_${display_order}_${timestamp}.webp`).data.publicUrl

      const largeUrl = supabase.storage
        .from('ad-images')
        .getPublicUrl(`${adId}/large_${display_order}_${timestamp}.webp`).data.publicUrl

      let originalUrl: string | undefined
      if (optimized.original) {
        const originalExt = optimized.original.name.split('.').pop() || 'jpg'
        originalUrl = supabase.storage
          .from('ad-images')
          .getPublicUrl(`${adId}/original_${display_order}_${timestamp}.${originalExt}`).data.publicUrl
      }

      uploadedVersions.push({
        thumbnail_url: thumbnailUrl,
        medium_url: mediumUrl,
        large_url: largeUrl,
        original_url: originalUrl,
        display_order
      })

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Imagem otimizada ${i + 1} enviada com sucesso`)
      }

    } catch (error) {
      console.error(`Erro ao processar imagem otimizada ${i + 1}:`, error)
      throw error
    }
  }

  return uploadedVersions
}

export async function saveImageRecords(
  adId: string, 
  uploadedImages: UploadedImage[]
): Promise<void> {
  const imageRecords = uploadedImages.map(image => ({
    listing_id: adId,
    image_url: image.url,
    display_order: image.display_order
  }))
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Tentando salvar registros de imagem:', imageRecords)
  }

  const { error, data } = await supabase
    .from('listing_images')
    .insert(imageRecords)
    .select()
  
  if (error) {
    console.error('Erro ao salvar registros de imagem:', error)
    throw new Error(`Erro ao salvar imagens no banco de dados: ${error.message}`)
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Registros de imagem salvos com sucesso:', data)
  }
}

export async function deleteAdImages(adId: string): Promise<void> {
  // Buscar imagens existentes
  const { data: existingImages } = await supabase
    .from('listing_images')
    .select('image_url')
    .eq('listing_id', adId)
  
  if (existingImages && existingImages.length > 0) {
    // Deletar arquivos do storage
    const filePaths = existingImages.map(img => {
      const url = new URL(img.image_url)
      return url.pathname.split('/').pop()
    }).filter(Boolean)
    
    if (filePaths.length > 0) {
      await supabase.storage
        .from('ad-images')
        .remove(filePaths as string[])
    }
    
    // Deletar registros do banco
    await supabase
      .from('listing_images')
      .delete()
      .eq('listing_id', adId)
  }
}

export async function deleteSpecificAdImages(imageIds: string[]): Promise<void> {
  if (!imageIds || imageIds.length === 0) {
    return
  }

  // Buscar URLs das imagens a serem deletadas
  const { data: imagesToDelete } = await supabase
    .from('listing_images')
    .select('image_url')
    .in('id', imageIds)
  
  if (imagesToDelete && imagesToDelete.length > 0) {
    // Deletar arquivos do storage
    const filePaths = imagesToDelete.map(img => {
      const url = new URL(img.image_url)
      return url.pathname.split('/').pop()
    }).filter(Boolean)
    
    if (filePaths.length > 0) {
      await supabase.storage
        .from('ad-images')
        .remove(filePaths as string[])
    }
    
    // Deletar registros do banco
    await supabase
      .from('listing_images')
      .delete()
      .in('id', imageIds)
  }
}