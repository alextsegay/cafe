import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const updateAccountSchema = z.object({
  bankName: z.string().min(1).max(120).optional(),
  accountName: z.string().min(1).max(200).optional(),
  accountNumber: z.string().min(1).max(100).optional(),
  branch: z.string().max(120).nullable().optional(),
  qrData: z.string().max(2000).nullable().optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

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
    const validated = updateAccountSchema.parse(data)

    const account = await prisma.bankAccount.update({
      where: { id },
      data: {
        bankName: validated.bankName,
        accountName: validated.accountName,
        accountNumber: validated.accountNumber,
        branch: validated.branch,
        qrData: validated.qrData,
        visible: validated.visible,
        order: validated.order,
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Update bank account error:', error)
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
    await prisma.bankAccount.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete bank account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
