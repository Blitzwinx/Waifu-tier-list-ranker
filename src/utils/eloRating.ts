import { Character } from '../lib/supabase'

/**
 * Elo Rating System Implementation
 * Used to calculate character rankings based on head-to-head comparisons
 */

export interface EloResult {
  winner: {
    oldRating: number
    newRating: number
    change: number
  }
  loser: {
    oldRating: number
    newRating: number
    change: number
  }
}

/**
 * Calculate new Elo ratings after a comparison
 * @param winnerRating Current rating of the winner
 * @param loserRating Current rating of the loser
 * @param kFactor K-factor (rating volatility, typically 32 for new players, 16 for established)
 * @returns New ratings for both characters
 */
export function calculateElo(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): EloResult {
  // Calculate expected scores
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400))
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400))

  // Calculate new ratings
  const newWinnerRating = Math.round(winnerRating + kFactor * (1 - expectedWinner))
  const newLoserRating = Math.round(loserRating + kFactor * (0 - expectedLoser))

  return {
    winner: {
      oldRating: winnerRating,
      newRating: newWinnerRating,
      change: newWinnerRating - winnerRating
    },
    loser: {
      oldRating: loserRating,
      newRating: newLoserRating,
      change: newLoserRating - loserRating
    }
  }
}

/**
 * Distribute characters across all tiers (S to F) based on their Elo ratings
 * Ensures no tier is empty by distributing characters proportionally
 * @param characters Array of characters sorted by Elo rating (highest first)
 * @returns Object with characters distributed across all tiers
 */
export function distributeCharactersAcrossTiers(characters: Character[]): Record<string, Character[]> {
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F']
  const result: Record<string, Character[]> = {
    S: [], A: [], B: [], C: [], D: [], F: []
  }

  if (characters.length === 0) return result

  // Sort characters by Elo rating (highest first), then by total comparisons for tie-breaking
  const sortedCharacters = [...characters].sort((a, b) => {
    if (b.elo_rating !== a.elo_rating) {
      return b.elo_rating - a.elo_rating
    }
    // If ratings are equal, sort by total comparisons (more battles = more reliable rating)
    return b.total_comparisons - a.total_comparisons
  })

  // Calculate how many characters should be in each tier
  const totalChars = sortedCharacters.length
  const basePerTier = Math.floor(totalChars / 6)
  const remainder = totalChars % 6

  // Distribute characters ensuring each tier gets at least one (if possible)
  let currentIndex = 0
  
  tiers.forEach((tier, tierIndex) => {
    // Calculate how many characters this tier should get
    let charsForThisTier = basePerTier
    
    // Distribute remainder characters to higher tiers first
    if (tierIndex < remainder) {
      charsForThisTier += 1
    }
    
    // Ensure at least 1 character per tier if we have enough characters
    if (charsForThisTier === 0 && currentIndex < totalChars) {
      charsForThisTier = 1
    }
    
    // Add characters to this tier
    for (let i = 0; i < charsForThisTier && currentIndex < totalChars; i++) {
      result[tier].push(sortedCharacters[currentIndex])
      currentIndex++
    }
  })

  return result
}

/**
 * Convert Elo rating to tier letter
 * @param rating Elo rating
 * @returns Tier letter (S, A, B, C, D, F)
 */
export function eloToTier(rating: number): string {
  if (rating >= 1800) return 'S'
  if (rating >= 1600) return 'A'
  if (rating >= 1400) return 'B'
  if (rating >= 1200) return 'C'
  if (rating >= 1000) return 'D'
  return 'F'
}

/**
 * Get default tier colors (fallback)
 * @param tierPosition Tier position (0-5)
 * @returns CSS color class
 */
export function getDefaultTierColor(tierPosition: number): string {
  switch (tierPosition) {
    case 0: return 'bg-gradient-to-r from-red-500 to-pink-600 text-white' // S-Tier
    case 1: return 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' // A-Tier
    case 2: return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' // B-Tier
    case 3: return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' // C-Tier
    case 4: return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' // D-Tier
    case 5: return 'bg-gradient-to-r from-gray-600 to-slate-700 text-white' // F-Tier
    default: return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
  }
}