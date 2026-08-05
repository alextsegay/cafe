export interface Cafe {
  id: string
  name: string
  slug: string
  logo: string | null
  heroImage: string | null
  address: string | null
  phone: string | null
  email: string | null
  primaryColor: string
  secondaryColor: string
  language: string
  openingHours: OpeningHours | null
  socialLinks: SocialLinks | null
  dailySpecial: DailySpecial | null
  createdAt: Date
  updatedAt: Date
}

export interface OpeningHours {
  monday: { open: string; close: string }
  tuesday: { open: string; close: string }
  wednesday: { open: string; close: string }
  thursday: { open: string; close: string }
  friday: { open: string; close: string }
  saturday: { open: string; close: string }
  sunday: { open: string; close: string }
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
}

export interface DailySpecial {
  name: string
  description: string
  price: number
  image?: string
}

export interface Category {
  id: string
  name: string
  nameAm: string | null
  icon: string | null
  order: number
  menuItems?: MenuItem[]
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  name: string
  nameAm: string | null
  description: string | null
  descriptionAm: string | null
  price: number
  image: string | null
  popular: boolean
  isNew: boolean
  available: boolean
  ingredients: string | null
  ingredientsAm: string | null
  categoryId: string
  category?: Category
  createdAt: Date
  updatedAt: Date
}

export interface Gallery {
  id: string
  image: string
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface MenuStats {
  totalItems: number
  categories: number
  hiddenItems: number
  galleryImages: number
}
