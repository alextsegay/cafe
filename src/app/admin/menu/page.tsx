'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Loader2, X, Coffee } from 'lucide-react'
import { Button, Input, Modal, Select, Toggle, Badge } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import type { MenuItem, Category } from '@/types'

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    nameAm: '',
    description: '',
    descriptionAm: '',
    price: '',
    image: '',
    popular: false,
    isNew: false,
    available: true,
    ingredients: '',
    ingredientsAm: '',
    categoryId: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/categories'),
      ])
      
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json()
        setItems(itemsData)
      }
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.nameAm?.toLowerCase().includes(search.toLowerCase())
  )

  const openModal = (item?: MenuItem) => {
    setImageFile(null)
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        nameAm: item.nameAm || '',
        description: item.description || '',
        descriptionAm: item.descriptionAm || '',
        price: item.price.toString(),
        image: item.image || '',
        popular: item.popular,
        isNew: item.isNew,
        available: item.available,
        ingredients: item.ingredients || '',
        ingredientsAm: item.ingredientsAm || '',
        categoryId: item.categoryId,
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: '',
        nameAm: '',
        description: '',
        descriptionAm: '',
        price: '',
        image: '',
        popular: false,
        isNew: false,
        available: true,
        ingredients: '',
        ingredientsAm: '',
        categoryId: categories[0]?.id || '',
      })
    }
    setShowModal(true)
  }

  const handleImageUpload = async () => {
    if (!imageFile) return formData.image

    const uploadFormData = new FormData()
    uploadFormData.append('file', imageFile)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    })

    if (res.ok) {
      const data = await res.json()
      return data.url
    }
    return formData.image
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const imageUrl = await handleImageUpload()
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu'
      const method = editingItem ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: imageUrl,
        }),
      })

      if (res.ok) {
        await fetchData()
        setShowModal(false)
      } else {
        const data = await res.json()
        const errorMsg = typeof data.error === 'string'
          ? data.error
          : Array.isArray(data.error)
          ? data.error.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('\n')
          : 'Failed to save'
        alert(errorMsg)
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchData()
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, available: !item.available }),
      })
      await fetchData()
    } catch (error) {
      alert('An error occurred')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Manage your café's menu items</p>
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search menu items..."
          className="pl-12"
        />
      </div>

      {/* Menu Items Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold">Item</th>
                <th className="text-left p-4 font-semibold hidden md:table-cell">Category</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold hidden lg:table-cell">Status</th>
                <th className="text-right p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl text-amber-600">
                            <Coffee className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground md:hidden">{item.category?.name}</p>
                        <div className="flex gap-1 mt-1">
                          {item.popular && <Badge variant="popular" size="sm">Popular</Badge>}
                          {item.isNew && <Badge variant="new" size="sm">New</Badge>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm">{item.category?.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold">{formatPrice(item.price)}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <button
                      onClick={() => handleToggleAvailable(item)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        item.available
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {item.available ? (
                        <>
                          <Eye className="w-3 h-3" /> Available
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> Hidden
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No menu items found</p>
            <Button variant="outline" onClick={() => openModal()} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add your first item
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name (English)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Name (Amharic)"
              value={formData.nameAm}
              onChange={(e) => setFormData({ ...formData, nameAm: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {formData.image && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image src={formData.image} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Description (English)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Description (Amharic)</label>
              <textarea
                value={formData.descriptionAm}
                onChange={(e) => setFormData({ ...formData, descriptionAm: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                rows={3}
              />
            </div>
          </div>

          <Input
            label="Ingredients (English)"
            value={formData.ingredients}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-4">
            <Toggle
              checked={formData.popular}
              onChange={(checked) => setFormData({ ...formData, popular: checked })}
              label="Popular"
            />
            <Toggle
              checked={formData.isNew}
              onChange={(checked) => setFormData({ ...formData, isNew: checked })}
              label="New"
            />
            <Toggle
              checked={formData.available}
              onChange={(checked) => setFormData({ ...formData, available: checked })}
              label="Available"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
