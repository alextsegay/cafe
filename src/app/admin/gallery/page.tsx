'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react'
import { Button, Input, Modal } from '@/components/ui'
import type { Gallery } from '@/types'

export default function GalleryPage() {
  const [images, setImages] = useState<Gallery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchGallery()
  }, [])

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery')
      if (res.ok) {
        const data = await res.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      let imageUrl = newImageUrl

      if (imageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append('file', imageFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        })

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.url
        }
      }

      if (!imageUrl.trim()) {
        setIsSubmitting(false)
        return
      }

      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      })

      if (res.ok) {
        await fetchGallery()
        setNewImageUrl('')
        setImageFile(null)
        setShowModal(false)
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchGallery()
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
          <h1 className="font-display text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground mt-1">Showcase your café's ambiance</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-2xl overflow-hidden glass"
          >
            <Image
              src={image.image}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <button
                onClick={() => handleDelete(image.id)}
                className="p-3 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Order Badge */}
            <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-black/50 text-white text-xs flex items-center gap-1">
              <GripVertical className="w-3 h-3" />
              {image.order}
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 glass rounded-2xl">
          <p className="text-muted-foreground">No gallery images yet</p>
          <Button variant="outline" onClick={() => setShowModal(true)} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add your first image
          </Button>
        </div>
      )}

      {/* Add Image Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Gallery Image"
      >
        <form onSubmit={handleAddImage} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {newImageUrl && (
              <p className="text-sm text-muted-foreground">Or enter a URL:</p>
            )}
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              Add Image
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
