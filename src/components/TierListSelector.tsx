import { useState, useEffect } from 'react'
import { Settings, Play } from 'lucide-react'
import { TierList } from '../lib/supabase'
import { TierListService } from '../services/tierListService'

interface TierListSelectorProps {
  onSelectTierList: (tierList: TierList) => void
  onShowAdmin: () => void
}

export function TierListSelector({ onSelectTierList, onShowAdmin }: TierListSelectorProps) {
  const [tierLists, setTierLists] = useState<TierList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTierLists()
  }, [])

  const loadTierLists = async () => {
    try {
      setLoading(true)
      const lists = await TierListService.getTierLists()
      setTierLists(lists)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tier lists')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tier lists...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadTierLists}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neomorphism">
      {/* Header */}
      <div className="bg-neomorphism px-4 py-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-neomorphism mb-2">
            Waifu Tier List Maker
          </h1>
          <p className="text-base sm:text-lg text-gray-700">
            Choose your tier list and start ranking your favorite characters
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Admin Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={onShowAdmin}
            className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-neomorphism rounded-xl font-medium text-sm"
          >
            <Settings size={16} />
            Make Your Own
          </button>
        </div>

        {/* Tier Lists Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {tierLists.map((tierList) => (
            <div
              key={tierList.id}
              onClick={() => onSelectTierList(tierList)}
              className="neomorphism neomorphism-hover rounded-2xl cursor-pointer overflow-hidden"
            >
              {/* Thumbnail placeholder */}
              <div className="h-32 sm:h-40 overflow-hidden">
                {tierList.thumbnail_url ? (
                  <img
                    src={tierList.thumbnail_url}
                    alt={tierList.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${tierList.thumbnail_url ? 'hidden' : ''}`}>
                  <div className="text-white text-center">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {tierList.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-xs sm:text-sm opacity-80">Thumbnail</div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-neomorphism mb-2 line-clamp-2">
                  {tierList.name}
                </h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 line-clamp-2">
                  {tierList.description || 'No description available'}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-xs sm:text-sm text-gray-500">
                    {tierList.maker_name && (
                      <div className="text-gray-500 mb-1">by {tierList.maker_name}</div>
                    )}
                    <div>{new Date(tierList.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="w-8 h-8 neomorphism-small rounded-full flex items-center justify-center">
                    <Play size={14} className="text-blue-700 ml-0.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tierLists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700 mb-4">No tier lists found</p>
            <button
              onClick={onShowAdmin}
              className="px-6 py-3 neomorphism neomorphism-hover text-neomorphism rounded-xl font-medium"
            >
              Create Your First Tier List
            </button>
          </div>
        )}
      </div>
    </div>
  )
}