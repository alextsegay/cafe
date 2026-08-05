import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const updateMenuItemSchema = z.object({
  name: z.string().min(1).optional(),
  nameAm: z.string().optional(),
  description: z.string().optional(),
  descriptionAm: z.string().optional(),
  price: z.number().positive().optional(),
  image: z.string().url().optional().or(z.literal('')),
  popular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  available: z.boolean().optional(),
  ingredients: z.string().optional(),
  ingredientsAm: z.string().optional(),
  categoryId: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const validated = updateMenuItemSchema.parse(data)

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name: validated.name,
        nameAm: validated.nameAm,
        description: validated.description,
        descriptionAm: validated.descriptionAm,
        price: validated.price,
        image: validated.image,
        popular: validated.popular,
        isNew: validated.isNew,
        available: validated.available,
        ingredients: validated.ingredients,
        ingredientsAm: validated.ingredientsAm,
        categoryId: validated.categoryId,
      },
      include: { category: true },
    })

    return NextResponse.json(item)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Update menu item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.menuItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
