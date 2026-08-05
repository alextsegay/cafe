import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameAm: z.string().optional(),
  description: z.string().optional(),
  descriptionAm: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  image: z.string().url().optional().or(z.literal('')),
  popular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  available: z.boolean().optional(),
  ingredients: z.string().optional(),
  ingredientsAm: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: [{ popular: 'desc' }, { isNew: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const validated = createMenuItemSchema.parse(data)

    const item = await prisma.menuItem.create({
      data: {
        name: validated.name,
        nameAm: validated.nameAm || null,
        description: validated.description || null,
        descriptionAm: validated.descriptionAm || null,
        price: validated.price,
        image: validated.image || null,
        popular: validated.popular || false,
        isNew: validated.isNew || false,
        available: validated.available !== false,
        ingredients: validated.ingredients || null,
        ingredientsAm: validated.ingredientsAm || null,
        categoryId: validated.categoryId,
      },
      include: { category: true },
    })

    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Create menu item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
