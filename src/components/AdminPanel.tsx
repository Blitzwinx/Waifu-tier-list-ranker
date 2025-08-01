import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Palette } from 'lucide-react'
import { TierList, Character, TierLabel } from '../lib/supabase'
import { TierListService } from '../services/tierListService'
import { ImageService } from '../services/imageService'

import { ImageUpload } from './ImageUpload'

interface AdminPanelProps {
  onBack: () => void
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [tierLists, setTierLists] = useState<TierList[]>([])
  const [selectedTierList, setSelectedTierList] = useState<TierList | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [tierLabels, setTierLabels] = useState<TierLabel[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTierList, setEditingTierList] = useState<string | null>(null)
  const [editingCharacter, setEditingCharacter] = useState<string | null>(null)
  const [editingTierLabels, setEditingTierLabels] = useState(false)
  const [newTierList, setNewTierList] = useState({ name: '', description: '', thumbnailUrl: '', makerName: '' })
  const [newCharacter, setNewCharacter] = useState({ name: '', imageUrl: '' })
  const [showNewTierListForm, setShowNewTierListForm] = useState(false)
  const [showNewCharacterForm, setShowNewCharacterForm] = useState(false)
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    loadTierLists()
    checkStorageAccess()
  }, [])

  useEffect(() => {
    if (selectedTierList) {
      loadTierListData(selectedTierList.id)
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

  const checkStorageAccess = async () => {
    try {
      const isReady = await ImageService.checkStorageAccess()
      setStorageReady(isReady)
      if (!isReady) {
        console.warn('Supabase Storage not accessible. Please check your setup.')
      }
    } catch (error) {
      console.error('Storage access check failed:', error)
      setStorageReady(false)
    }
  }

  const loadTierListData = async (tierListId: string) => {
    try {
      const [chars, labels] = await Promise.all([
        TierListService.getCharacters(tierListId),
        TierListService.getTierLabels(tierListId)
      ])
      setCharacters(chars)
      setTierLabels(labels)
    } catch (error) {
      console.error('Failed to load tier list data:', error)
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
      
      const updated = await TierListService.updateTierList(id, dbUpdates)
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
      // Get tier list data to delete associated images
      const tierListToDelete = tierLists.find(tl => tl.id === id)
      
      await TierListService.deleteTierList(id)
      setTierLists(tierLists.filter(tl => tl.id !== id))
      if (selectedTierList?.id === id) {
        setSelectedTierList(tierLists.find(tl => tl.id !== id) || null)
      }
      
      // Clean up thumbnail image if it exists
      if (tierListToDelete?.thumbnail_url) {
        ImageService.deleteImage(tierListToDelete.thumbnail_url).catch(console.error)
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
      // Get character data to delete associated image
      const characterToDelete = characters.find(c => c.id === id)
      
      await TierListService.deleteCharacter(id)
      setCharacters(characters.filter(c => c.id !== id))
      
      // Clean up character image if it exists
      if (characterToDelete?.image_url) {
        ImageService.deleteImage(characterToDelete.image_url).catch(console.error)
      }
    } catch (error) {
      console.error('Failed to delete character:', error)
    }
  }

  const handleUpdateTierLabel = async (tierPosition: number, label: string, colorClass: string) => {
    if (!selectedTierList) return

    try {
      await TierListService.updateTierLabel(selectedTierList.id, tierPosition, label, colorClass)
      const updatedLabels = tierLabels.map(tl => 
        tl.tier_position === tierPosition 
          ? { ...tl, label, color_class: colorClass }
          : tl
      )
      setTierLabels(updatedLabels)
    } catch (error) {
      console.error('Failed to update tier label:', error)
    }
  }

  // Predefined color options for tier labels
  const colorOptions = [
    { name: 'Red-Pink', class: 'bg-gradient-to-r from-red-500 to-pink-600 text-white' },
    { name: 'Orange-Yellow', class: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' },
    { name: 'Green-Emerald', class: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' },
    { name: 'Blue-Cyan', class: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' },
    { name: 'Purple-Indigo', class: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white' },
    { name: 'Gray-Slate', class: 'bg-gradient-to-r from-gray-600 to-slate-700 text-white' },
    { name: 'Teal-Blue', class: 'bg-gradient-to-r from-teal-500 to-blue-600 text-white' },
    { name: 'Pink-Purple', class: 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' },
    { name: 'Yellow-Orange', class: 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' },
    { name: 'Emerald-Teal', class: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' }
  ]
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
    <div className="min-h-screen bg-neomorphism py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-neomorphism rounded-xl font-medium"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-neomorphism">Admin Panel</h1>
          <div></div>
        </div>

        {!storageReady && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              <strong>Storage Warning:</strong> Supabase Storage may not be properly configured. 
              Image uploads might not work correctly. Please check your Supabase setup.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Tier Lists Management */}
          <div className="neomorphism rounded-2xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neomorphism">Tier Lists</h2>
              <button
                onClick={() => setShowNewTierListForm(true)}
                className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-blue-700 rounded-xl font-medium"
              >
                <Plus size={20} />
                Add Tier List
              </button>
            </div>

            {/* New Tier List Form */}
            {showNewTierListForm && (
              <div className="mb-6 p-4 neomorphism-inset rounded-xl">
                <h3 className="font-semibold mb-3">Create New Tier List</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Tier List Name"
                    value={newTierList.name}
                    onChange={(e) => setNewTierList({ ...newTierList, name: e.target.value })}
                    className="w-full px-3 py-2 neomorphism-inset rounded-xl focus:outline-none text-neomorphism"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newTierList.description}
                    onChange={(e) => setNewTierList({ ...newTierList, description: e.target.value })}
                    className="w-full px-3 py-2 neomorphism-inset rounded-xl focus:outline-none text-neomorphism"
                  />
                  <input
                    type="text"
                    placeholder="Maker Name (optional)"
                    value={newTierList.makerName}
                    onChange={(e) => setNewTierList({ ...newTierList, makerName: e.target.value })}
                    className="w-full px-3 py-2 neomorphism-inset rounded-xl focus:outline-none text-neomorphism"
                  />
                  <div>
                    <label className="block text-sm font-medium text-neomorphism mb-2">
                      Thumbnail Image
                    </label>
                    <ImageUpload
                      onImageSelect={(imageUrl) => setNewTierList({ ...newTierList, thumbnailUrl: imageUrl })}
                      currentImage={newTierList.thumbnailUrl}
                      placeholder="Upload thumbnail"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateTierList}
                      className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-green-700 rounded-xl font-medium"
                    >
                      <Save size={16} />
                      Create
                    </button>
                    <button
                      onClick={() => setShowNewTierListForm(false)}
                      className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-gray-700 rounded-xl font-medium"
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
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    selectedTierList?.id === tierList.id
                      ? 'neomorphism-inset'
                      : 'neomorphism-small neomorphism-hover'
                  }`}
                  onClick={() => setSelectedTierList(tierList)}
                >
                  {editingTierList === tierList.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={tierList.name}
                        onBlur={(e) => handleUpdateTierList(tierList.id, { name: e.target.value })}
                        className="w-full px-2 py-1 neomorphism-inset rounded-lg focus:outline-none text-neomorphism"
                      />
                      <input
                        type="text"
                        defaultValue={tierList.description}
                        onBlur={(e) => handleUpdateTierList(tierList.id, { description: e.target.value })}
                        className="w-full px-2 py-1 neomorphism-inset rounded-lg focus:outline-none text-neomorphism"
                      />
                      <input
                        type="text"
                        defaultValue={tierList.maker_name}
                        placeholder="Maker Name"
                        onBlur={(e) => handleUpdateTierList(tierList.id, { maker_name: e.target.value })}
                        className="w-full px-2 py-1 neomorphism-inset rounded-lg focus:outline-none text-neomorphism"
                      />
                      <ImageUpload
                        onImageSelect={(imageUrl) => handleUpdateTierList(tierList.id, { thumbnail_url: imageUrl })}
                        currentImage={tierList.thumbnail_url}
                        placeholder="Update thumbnail"
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
                            className="p-1 text-gray-600 hover:text-blue-700"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTierList(tierList.id)
                            }}
                            className="p-1 text-gray-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{tierList.description}</p>
                      {tierList.maker_name && (
                        <p className="text-xs text-gray-500">by {tierList.maker_name}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Characters Management */}
          <div className="neomorphism rounded-2xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neomorphism">
                Characters
                {selectedTierList && (
                  <span className="text-lg font-normal text-gray-700 ml-2">
                    ({selectedTierList.name})
                  </span>
                )}
              </h2>
              {selectedTierList && (
                <button
                  onClick={() => setShowNewCharacterForm(true)}
                  className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-green-700 rounded-xl font-medium"
                >
                  <Plus size={20} />
                  Add Character
                </button>
              )}
            </div>

            {!selectedTierList ? (
              <p className="text-gray-700">Select a tier list to manage characters</p>
            ) : (
              <>
                {/* New Character Form */}
                {showNewCharacterForm && (
                  <div className="mb-6 p-4 neomorphism-inset rounded-xl">
                    <h3 className="font-semibold mb-3">Add New Character</h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Character Name"
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                        className="w-full px-3 py-2 neomorphism-inset rounded-xl focus:outline-none text-neomorphism"
                      />
                      <div>
                        <label className="block text-sm font-medium text-neomorphism mb-2">
                          Character Image
                        </label>
                        <ImageUpload
                          onImageSelect={(imageUrl) => setNewCharacter({ ...newCharacter, imageUrl })}
                          currentImage={newCharacter.imageUrl}
                          placeholder="Upload character image"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateCharacter}
                          className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-green-700 rounded-xl font-medium"
                        >
                          <Save size={16} />
                          Add
                        </button>
                        <button
                          onClick={() => setShowNewCharacterForm(false)}
                          className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-gray-700 rounded-xl font-medium"
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
                    <div key={character.id} className="p-4 neomorphism-small rounded-xl">
                      {editingCharacter === character.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            defaultValue={character.name}
                            onBlur={(e) => handleUpdateCharacter(character.id, { name: e.target.value })}
                            className="w-full px-2 py-1 neomorphism-inset rounded-lg focus:outline-none text-neomorphism"
                          />
                          <ImageUpload
                            onImageSelect={(imageUrl) => handleUpdateCharacter(character.id, { image_url: imageUrl })}
                            currentImage={character.image_url}
                            placeholder="Update character image"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={character.image_url || 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'}
                              alt={character.name}
                              className="w-12 h-12 rounded-xl object-cover neomorphism-small"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'https://images.pexels.com/photos/6153354/pexels-photo-6153354.jpeg?auto=compress&cs=tinysrgb&w=400'
                              }}
                            />
                            <div>
                              <h4 className="font-semibold">{character.name}</h4>
                              <p className="text-sm text-gray-700">Ready for battle</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingCharacter(character.id)}
                              className="p-1 text-gray-600 hover:text-blue-700"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCharacter(character.id)}
                              className="p-1 text-gray-600 hover:text-red-700"
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
                  <p className="text-gray-700 text-center py-8">No characters in this tier list</p>
                )}
              </>
            )}
          </div>

          {/* Tier Labels Management */}
          <div className="neomorphism rounded-2xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neomorphism">
                Tier Labels
                {selectedTierList && (
                  <span className="text-lg font-normal text-gray-700 ml-2">
                    ({selectedTierList.name})
                  </span>
                )}
              </h2>
              {selectedTierList && (
                <button
                  onClick={() => setEditingTierLabels(!editingTierLabels)}
                  className="flex items-center gap-2 px-4 py-2 neomorphism-small neomorphism-hover text-purple-700 rounded-xl font-medium"
                >
                  <Palette size={20} />
                  {editingTierLabels ? 'Done' : 'Edit'}
                </button>
              )}
            </div>
            {!selectedTierList ? (
              <p className="text-gray-700">Select a tier list to manage tier labels</p>
            ) : (
              <div className="space-y-3">
                {tierLabels.map((tierLabel) => (
                  <div key={tierLabel.id} className="p-4 neomorphism-small rounded-xl">
                    {editingTierLabels ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          defaultValue={tierLabel.label}
                          onBlur={(e) => handleUpdateTierLabel(tierLabel.tier_position, e.target.value, tierLabel.color_class)}
                          className="w-full px-3 py-2 neomorphism-inset rounded-xl focus:outline-none text-neomorphism font-semibold"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => handleUpdateTierLabel(tierLabel.tier_position, tierLabel.label, color.class)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${color.class} ${
                                tierLabel.color_class === color.class ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                              }`}
                            >
                              {color.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`px-4 py-2 rounded-xl font-bold ${tierLabel.color_class}`}>
                            {tierLabel.label}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}