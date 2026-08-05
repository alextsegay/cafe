'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, GripVertical, Loader2, Coffee, Utensils } from 'lucide-react'
import { Button, Input, Modal } from '@/components/ui'
import type { Category } from '@/types'

const iconOptions = [
  { value: 'coffee', label: 'Coffee', icon: Coffee },
  { value: 'cup-soda', label: 'Tea', icon: Utensils },
  { value: 'croissant', label: 'Breakfast', icon: Coffee },
  { value: 'cake-slice', label: 'Desserts', icon: Utensils },
  { value: 'glass-water', label: 'Juices', icon: Coffee },
  { value: 'blender', label: 'Smoothies', icon: Coffee },
  { value: 'cookie', label: 'Snacks', icon: Utensils },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<(Category & { _count: { menuItems: number } })[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    nameAm: '',
    icon: 'coffee',
    order: 0,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        nameAm: category.nameAm || '',
        icon: category.icon || 'coffee',
        order: category.order,
      })
    } else {
      setEditingCategory(null)
      setFormData({
        name: '',
        nameAm: '',
        icon: 'coffee',
        order: categories.length,
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchCategories()
        setShowModal(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id)
    if (category && category._count.menuItems > 0) {
      alert('Cannot delete category with menu items. Please move or delete the items first.')
      return
    }

    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete')
      }
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
          <h1 className="font-display text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground mt-1">Organize your menu into categories</p>
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const iconOption = iconOptions.find(i => i.value === category.icon)
          const IconComponent = iconOption?.icon || Coffee

          return (
            <div
              key={category.id}
              className="glass rounded-2xl p-6 card-hover"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 flex items-center justify-center">
                    <IconComponent className="w-7 h-7 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                    {category.nameAm && (
                      <p className="text-sm text-muted-foreground">{category.nameAm}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {category._count.menuItems} items
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => openModal(category)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 glass rounded-2xl">
          <Coffee className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-muted-foreground mt-4">No categories yet</p>
          <Button variant="outline" onClick={() => openModal()} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Create your first category
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
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

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: option.value })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    formData.icon === option.value
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-xs">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Display Order"
            type="number"
            min="0"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          />

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
