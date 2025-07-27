import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { ImageService } from '../services/imageService'

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void
  currentImage?: string
  placeholder?: string
}

export function ImageUpload({ onImageSelect, currentImage, placeholder = "Upload image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentImage || '')
  const [error, setError] = useState<string>('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError('')
    
    try {
      // Upload to Supabase Storage
      const imageUrl = await ImageService.uploadImage(file, 'uploads')
      setPreview(imageUrl)
      onImageSelect(imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      setError(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onImageSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024 // 5MB
  })

  const clearImage = () => {
    setPreview('')
    onImageSelect('')
    setError('')
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 shadow-inner' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={uploading} />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                clearImage()
              }}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600">Uploading to storage...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                  {isDragActive ? (
                    <Upload className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isDragActive ? 'Drop image here' : placeholder}
                </p>
                <p className="text-xs text-gray-500">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}