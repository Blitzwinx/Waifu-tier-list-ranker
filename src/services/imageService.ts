import { supabase } from '../lib/supabase'

export class ImageService {
  private static readonly BUCKET_NAME = 'images'

  /**
   * Upload an image file to Supabase Storage
   * @param file The image file to upload
   * @param folder Optional folder path (e.g., 'characters', 'thumbnails')
   * @returns Promise<string> The public URL of the uploaded image
   */
  static async uploadImage(file: File, folder: string = ''): Promise<string> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error(`Failed to upload image: ${error.message}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path)

      return urlData.publicUrl
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    }
  }

  /**
   * Delete an image from Supabase Storage
   * @param imageUrl The public URL of the image to delete
   */
  static async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === this.BUCKET_NAME)
      
      if (bucketIndex === -1) {
        console.warn('Invalid image URL format:', imageUrl)
        return
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/')

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        // Don't throw error for delete failures as it's not critical
      }
    } catch (error) {
      console.error('Image deletion failed:', error)
      // Don't throw error for delete failures as it's not critical
    }
  }

  /**
   * Check if storage bucket exists and is accessible
   */
  static async checkStorageAccess(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 })

      return !error
    } catch (error) {
      console.error('Storage access check failed:', error)
      return false
    }
  }
}