import { useState, useEffect } from 'react'
import { ArrowLeft, Trophy } from 'lucide-react'
import { Character, TierList } from '../lib/supabase'
import { TierListService } from '../services/tierListService'

interface ComparisonViewProps {
  tierList: TierList
  onBack: () => void
  onShowTierList: () => void
}

interface ComparisonPair {
  char1: Character
  char2: Character
}

export function ComparisonView({ tierList, onBack, onShowTierList }: ComparisonViewProps) {
  const [allCharacters, setAllCharacters] = useState<Character[]>([])
  const [currentPair, setCurrentPair] = useState<ComparisonPair | null>(null)
  const [remainingPairs, setRemainingPairs] = useState<ComparisonPair[]>([])
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)
  const [comparisonCount, setComparisonCount] = useState(0)
  const [totalComparisons, setTotalComparisons] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    loadCharactersAndGeneratePairs()
  }, [tierList.id])

  const loadCharactersAndGeneratePairs = async () => {
    try {
      setLoading(true)
      const characters = await TierListService.getCharacters(tierList.id)
      setAllCharacters(characters)
      
      if (characters.length < 2) {
        setIsComplete(true)
        setLoading(false)
        return
      }

      // Generate all possible unique pairs
      const pairs: ComparisonPair[] = []
      for (let i = 0; i < characters.length; i++) {
        for (let j = i + 1; j < characters.length; j++) {
          pairs.push({
            char1: characters[i],
            char2: characters[j]
          })
        }
      }

      // Shuffle pairs for random order
      const shuffledPairs = pairs.sort(() => Math.random() - 0.5)
      
      setRemainingPairs(shuffledPairs)
      setTotalComparisons(shuffledPairs.length)
      setCurrentPair(shuffledPairs[0] || null)
      setComparisonCount(0)
      setIsComplete(shuffledPairs.length === 0)
    } catch (error) {
      console.error('Failed to load characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChoice = async (winnerId: string, loserId: string) => {
    if (!currentPair || comparing) return

    try {
      setComparing(true)
      await TierListService.recordComparison(tierList.id, winnerId, loserId)
      
      const newComparisonCount = comparisonCount + 1
      setComparisonCount(newComparisonCount)
      
      // Remove current pair and move to next
      const newRemainingPairs = remainingPairs.slice(1)
      setRemainingPairs(newRemainingPairs)
      
      if (newRemainingPairs.length === 0) {
        setIsComplete(true)
        setCurrentPair(null)
      } else {
        setCurrentPair(newRemainingPairs[0])
      }
    } catch (error) {
      console.error('Failed to record comparison:', error)
    } finally {
      setComparing(false)
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
          <p className="mt-4 text-gray-600">Loading characters...</p>
        </div>
      </div>
    )
  }

  if (allCharacters.length < 2) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Not enough characters for comparison
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Battle Complete!</h2>
            <p className="text-gray-600 mb-4">
              All {totalComparisons} comparisons finished. Your tier list is ready!
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={onShowTierList}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Final Tier List
            </button>
            <button
              onClick={onBack}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPair) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">No more comparisons available</p>
          <button
            onClick={onShowTierList}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            View Tier List
          </button>
        </div>
      </div>
    )
  }

  const { char1, char2 } = currentPair
  const progressPercentage = (comparisonCount / totalComparisons) * 100

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="text-center flex-1 mx-4">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">{tierList.name}</h1>
            <p className="text-sm text-gray-600">
              {comparisonCount} / {totalComparisons} battles
            </p>
          </div>

          <button
            onClick={onShowTierList}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            View List
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Who's Better?</h2>
            <p className="text-gray-600">Tap your preferred character</p>
          </div>

          {/* VS Section */}
          <div className="relative">
            {/* Characters */}
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              {/* Character 1 */}
              <div
                onClick={() => !comparing && handleChoice(char1.id, char2.id)}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  comparing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getImageSrc(char1.image_url)}
                    alt={char1.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }}
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center truncate">
                    {char1.name}
                  </h3>
                </div>
              </div>

              {/* Character 2 */}
              <div
                onClick={() => !comparing && handleChoice(char2.id, char1.id)}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  comparing ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={getImageSrc(char2.image_url)}
                    alt={char2.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }}
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 text-center truncate">
                    {char2.name}
                  </h3>
                </div>
              </div>
            </div>

            {/* VS Badge */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-gray-900 text-white rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-sm sm:text-lg font-bold shadow-lg">
                VS
              </div>
            </div>
          </div>

          {/* Loading State */}
          {comparing && (
            <div className="text-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Recording your choice...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}