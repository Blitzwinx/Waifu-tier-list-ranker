import { supabase } from '../lib/supabase'
import { TierList, Character, Comparison } from '../lib/supabase'
import { calculateElo } from '../utils/eloRating'

export class TierListService {
  /**
   * Get all tier lists
   */
  static async getTierLists(): Promise<TierList[]> {
    const { data, error } = await supabase
      .from('tier_lists')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Get characters for a specific tier list
   */
  static async getCharacters(tierListId: string): Promise<Character[]> {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('tier_list_id', tierListId)
      .order('elo_rating', { ascending: false })

    if (error) throw error
    return data || []
  }

  /**
   * Create a new tier list
   */
  static async createTierList(
    name: string, 
    description: string = '', 
    thumbnailUrl: string = '', 
    makerName: string = ''
  ): Promise<TierList> {
    const { data, error } = await supabase
      .from('tier_lists')
      .insert({ name, description, thumbnail_url: thumbnailUrl, maker_name: makerName })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update tier list
   */
  static async updateTierList(id: string, updates: Partial<TierList>): Promise<TierList> {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {}
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'thumbnailUrl') {
        dbUpdates.thumbnail_url = value
      } else if (key === 'makerName') {
        dbUpdates.maker_name = value
      } else {
        dbUpdates[key] = value
      }
    })

    const { data, error } = await supabase
      .from('tier_lists')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete tier list
   */
  static async deleteTierList(id: string): Promise<void> {
    const { error } = await supabase
      .from('tier_lists')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Add a character to a tier list
   */
  static async addCharacter(
    tierListId: string,
    name: string,
    imageUrl: string = ''
  ): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .insert({
        tier_list_id: tierListId,
        name,
        image_url: imageUrl,
        elo_rating: 1400,
        total_comparisons: 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Update a character
   */
  static async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Delete a character
   */
  static async deleteCharacter(id: string): Promise<void> {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Record a comparison result and update Elo ratings
   */
  static async recordComparison(
    tierListId: string,
    winnerId: string,
    loserId: string
  ): Promise<void> {
    // Get current ratings
    const { data: characters, error: fetchError } = await supabase
      .from('characters')
      .select('id, elo_rating, total_comparisons')
      .in('id', [winnerId, loserId])

    if (fetchError) throw fetchError

    const winner = characters?.find(c => c.id === winnerId)
    const loser = characters?.find(c => c.id === loserId)

    if (!winner || !loser) throw new Error('Characters not found')

    // Calculate new Elo ratings
    const eloResult = calculateElo(winner.elo_rating, loser.elo_rating)

    // Update both characters' ratings and comparison counts
    const { error: updateError } = await supabase.rpc('update_character_ratings', {
      winner_id: winnerId,
      loser_id: loserId,
      new_winner_rating: eloResult.winner.newRating,
      new_loser_rating: eloResult.loser.newRating
    })

    if (updateError) {
      // Fallback to individual updates if RPC doesn't exist
      await Promise.all([
        supabase
          .from('characters')
          .update({
            elo_rating: eloResult.winner.newRating,
            total_comparisons: winner.total_comparisons + 1
          })
          .eq('id', winnerId),
        supabase
          .from('characters')
          .update({
            elo_rating: eloResult.loser.newRating,
            total_comparisons: loser.total_comparisons + 1
          })
          .eq('id', loserId)
      ])
    }

    // Record the comparison
    const { error: comparisonError } = await supabase
      .from('comparisons')
      .insert({
        tier_list_id: tierListId,
        character1_id: winnerId,
        character2_id: loserId,
        winner_id: winnerId
      })

    if (comparisonError) throw comparisonError
  }

  /**
   * Get all possible character pairs for systematic comparison
   */
  static async getAllPairs(tierListId: string): Promise<Array<[Character, Character]>> {
    const characters = await this.getCharacters(tierListId)
    
    if (characters.length < 2) return []

    const pairs: Array<[Character, Character]> = []
    for (let i = 0; i < characters.length; i++) {
      for (let j = i + 1; j < characters.length; j++) {
        pairs.push([characters[i], characters[j]])
      }
    }
    
    return pairs
  }
}