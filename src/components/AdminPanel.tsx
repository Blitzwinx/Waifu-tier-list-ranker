import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import { TierList, Character } from '../lib/supabase'
import { TierListService } from '../services/tierListService'

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [tierLists, setTierLists] = useState<TierList[]>([])
  const [selectedTierList, setSelectedTierList] = useState<TierList | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTierList, setEditingTierList] = useState<string | null>(null)
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null)
  const [newTierList, setNewTierList] = useState({ name: '', description: '', thumbnailUrl: '', makerName: '' })
  const [newCharacter, setNewCharacter] = useState({ name: '', imageUrl: '' })
  const [showNewTierListForm, setShowNewTierListForm] = useState(false)
  const [showNewCharacterForm, setShowNewCharacterForm] = useState(false)

  useEffect(() => {
    loadTierLists()
  }, [])

  useEffect(() => {
    if (selectedTierList) {
      loadCharacters(selectedTierList.id)
    }
  }, [selectedTierList])

  const loadTierLists = async () => {
    try {
      setLoading(true)
      const lists = await TierListService.getTierLists()
      setTierLists(lists)
      if (lists.length > 0 && !selectedTierList) {
        setSelectedTierList(lists[0])
      }
    } catch (error) {
      console.error('Failed to load tier lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCharacters = async (tierListId: string) => {
    try {
      const chars = await TierListService.getCharacters(tierListId)
      setCharacters(chars)
    } catch (error) {
      console.error('Failed to load characters:', error)
    }
  }

  const handleCreateTierList = async () => {
    if (!newTierList.name.trim()) return

    try {
      const created = await TierListService.createTierList(
        newTierList.name,
        newTierList.description,
        newTierList.thumbnailUrl,
        newTierList.makerName
      )
      setTierLists([created, ...tierLists])
      setNewTierList({ name: '', description: '', thumbnailUrl: '', makerName: '' })
      setShowNewTierListForm(false)
      setSelectedTierList(created)
    } catch (error) {
      console.error('Failed to create tier list:', error)
    }
  }

  const handleUpdateTierList = async (id: string, updates: Partial<TierList>) => {
    try {
      const updated = await TierListService.updateTierList(id, updates)
      setTierLists(tierLists.map(tl => tl.id === id ? updated : tl))
      if (selectedTierList?.id === id) {
        setSelectedTierList(updated)
      }
      setEditingTierList(null)
    } catch (error) {
      console.error('Failed to update tier list:', error)
    }
  }

  const handleDeleteTierList = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tier list?')) return

    try {
      await TierListService.deleteTierList(id)
      setTierLists(tierLists.filter(tl => tl.id !== id))
      if (selectedTierList?.id === id) {
        setSelectedTierList(tierLists.find(tl => tl.id !== id) || null)
      }
    } catch (error) {
      console.error('Failed to delete tier list:', error)
    }
  }

  const handleCreateCharacter = async () => {
    if (!newCharacter.name.trim() || !selectedTierList) return

    try {
      const created = await TierListService.addCharacter(
        selectedTierList.id,
        newCharacter.name,
        newCharacter.imageUrl
      )
      setCharacters([...characters, created])
      setNewCharacter({ name: '', imageUrl: '' })
      setShowNewCharacterForm(false)
    } catch (error) {
      console.error('Failed to create character:', error)
    }
  }

  const handleUpdateCharacter = async (id: string, updates: Partial<Character>) => {
    try {
      const updated = await TierListService.updateCharacter(id, updates)
      setCharacters(characters.map(c => c.id === id ? updated : c))
      setEditingCharacter(null)
    } catch (error) {
      console.error('Failed to update character:', error)
    }
  }

  const handleDeleteCharacter = async (id: string) => {
    if (!confirm('Are you sure you want to delete this character?')) return

    try {
      await TierListService.deleteCharacter(id)
      setCharacters(characters.filter(c => c.id !== id))
    } catch (error) {
      console.error('Failed to delete character:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Tier Lists Management */}
          <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tier Lists</h2>
              <button
                onClick={() => setShowNewTierListForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Tier List
              </button>
            </div>

            {/* New Tier List Form */}
            {showNewTierListForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">Create New Tier List</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tier List Name"
                    value={newTierList.name}
                    onChange={(e) => setNewTierList({ ...newTierList, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newTierList.description}
                    onChange={(e) => setNewTierList({ ...newTierList, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Maker Name (optional)"
                    value={newTierList.makerName}
                    onChange={(e) => setNewTierList({ ...newTierList, makerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="url"
                    placeholder="Thumbnail Image URL (optional)"
                    value={newTierList.thumbnailUrl}
                    onChange={(e) => setNewTierList({ ...newTierList, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateTierList}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Save size={16} />
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewTierListForm(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tier Lists */}
            <div className="space-y-3">
              {tierLists.map((tierList) => (
                <div
                  key={tierList.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTierList?.id === tierList.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTierList(tierList)}
                >
                  {editingTierList === tierList.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={tierList.name}
                        onBlur={(e) => handleUpdateTierList(tierList.id, { name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        defaultValue={tierList.description}
                        onBlur={(e) => handleUpdateTierList(tierList.id, { description: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="text"
                        defaultValue={tierList.maker_name}
                        placeholder="Maker Name"
                        onBlur={(e) => handleUpdateTierList(tierList.id, { makerName: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                      <input
                        type="url"
                        defaultValue={tierList.thumbnail_url}
                        placeholder="Thumbnail URL"
                        onBlur={(e) => handleUpdateTierList(tierList.id, { thumbnailUrl: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{tierList.name}</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingTierList(tierList.id)
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTierList(tierList.id)
                            }}
                            className="p-1 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{tierList.description}</p>
                      {tierList.maker_name && (
                        <p className="text-xs text-gray-400">by {tierList.maker_name}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Characters Management */}
          <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Characters
                {selectedTierList && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({selectedTierList.name})
                  </span>
                )}
              </h2>
              {selectedTierList && (
                <button
                  onClick={() => setShowNewCharacterForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={20} />
                  Add Character
                </button>
              )}
            </div>

            {!selectedTierList ? (
              <p className="text-gray-600">Select a tier list to manage characters</p>
            ) : (
              <>
                {/* New Character Form */}
                {showNewCharacterForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-3">Add New Character</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Character Name"
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <input
                        type="url"
                        placeholder="Image URL (optional)"
                        value={newCharacter.imageUrl}
                        onChange={(e) => setNewCharacter({ ...newCharacter, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateCharacter}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Save size={16} />
                          Add
                        </button>
                        <button
                          onClick={() => setShowNewCharacterForm(false)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Characters List */}
                <div className="space-y-3">
                  {characters.map((character) => (
                    <div key={character.id} className="p-4 border border-gray-200 rounded-lg">
                      {editingCharacter === character.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={character.name}
                            onBlur={(e) => handleUpdateCharacter(character.id, { name: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                          <input
                            type="url"
                            defaultValue={character.image_url}
                            onBlur={(e) => handleUpdateCharacter(character.id, { image_url: e.target.value })}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={character.image_url || 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'}
                              alt={character.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'
                              }}
                            />
                            <div>
                              <h4 className="font-semibold">{character.name}</h4>
                              <p className="text-sm text-gray-600">Ready for battle</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingCharacter(character.id)}
                              className="p-1 text-gray-500 hover:text-blue-600"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCharacter(character.id)}
                              className="p-1 text-gray-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {characters.length === 0 && (
                  <p className="text-gray-600 text-center py-8">No characters in this tier list</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}