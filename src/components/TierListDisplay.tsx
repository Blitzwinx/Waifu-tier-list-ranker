import { useState, useEffect } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { Character, TierList } from '../lib/supabase'
import { TierListService } from '../services/tierListService'
import { distributeCharactersAcrossTiers, getTierColor } from '../utils/eloRating'

interface TierListDisplayProps {
  tierList: TierList
  onBack: () => void
  onCompare: () => void
}

export function TierListDisplay({ tierList, onBack, onCompare }: TierListDisplayProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCharacters()
  }, [tierList.id])

  const loadCharacters = async () => {
    try {
      setLoading(true)
      const chars = await TierListService.getCharacters(tierList.id)
      setCharacters(chars)
    } catch (error) {
      console.error('Failed to load characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageSrc = (imageUrl: string) => {
    return imageUrl || 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tier list...</p>
        </div>
      </div>
    )
  }

  const tiersData = distributeCharactersAcrossTiers(characters)

  return (
    <div className="min-h-screen bg-neomorphism">
      {/* Header */}
      <div className="bg-neomorphism px-4 py-4 neomorphism-inset">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 neomorphism-small neomorphism-hover text-neomorphism rounded-xl text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="text-center flex-1 mx-4">
            <h1 className="text-lg sm:text-2xl font-bold text-neomorphism">{tierList.name}</h1>
            <p className="text-sm text-gray-700">{characters.length} characters ranked</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadCharacters}
              className="flex items-center gap-2 px-3 py-2 neomorphism-small neomorphism-hover text-neomorphism rounded-xl text-sm font-medium"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onCompare}
              className="px-3 py-2 neomorphism-small neomorphism-hover text-blue-700 rounded-xl text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Tier List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {Object.entries(tiersData).map(([tier, tierCharacters]) => (
            <div key={tier} className="neomorphism rounded-2xl overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                {/* Tier Label */}
                <div className={`w-full sm:w-20 flex items-center justify-center py-4 sm:py-8 ${getTierColor(tier)}`}>
                  <span className="text-2xl sm:text-4xl font-bold">{tier}</span>
                </div>

                {/* Characters in Tier */}
                <div className="flex-1 p-4">
                  {tierCharacters.length === 0 ? (
                    <div className="h-16 sm:h-20 flex items-center justify-center text-gray-500">
                      No characters in this tier
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 sm:gap-4">
                      {tierCharacters.map((character) => (
                        <div
                          key={character.id}
                          className="relative group cursor-pointer"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 neomorphism-small rounded-xl overflow-hidden transition-transform group-hover:scale-110">
                            <img
                              src={getImageSrc(character.image_url)}
                              alt={character.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'
                              }}
                            />
                          </div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <div className="neomorphism text-neomorphism text-xs rounded-xl px-3 py-2 whitespace-nowrap shadow-lg">
                              <div className="font-semibold">{character.name}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {characters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700 mb-4">No characters found in this tier list</p>
            <button
              onClick={onBack}
              className="px-6 py-3 neomorphism neomorphism-hover text-neomorphism rounded-xl font-medium"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}