import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const createAccountSchema = z.object({
  bankName: z.string().min(1, 'Bank name is required').max(120),
  accountName: z.string().min(1, 'Account name is required').max(200),
  accountNumber: z.string().min(1, 'Account number is required').max(100),
  branch: z.string().max(120).nullable().optional(),
  qrImage: z.string().max(2000).nullable().optional(),
  visible: z.boolean().optional(),
  order: z.number().int().optional(),
})

export async function GET(request: Request) {
  try {
    // Admins see everything (including hidden accounts); the public API
    // only ever returns visible accounts.
    const user = await getCurrentUser()
    const accounts = await prisma.bankAccount.findMany({
      where: user ? undefined : { visible: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Fetch bank accounts error:', error)
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
    const validated = createAccountSchema.parse(data)

    const maxOrder = await prisma.bankAccount.aggregate({ _max: { order: true } })

    const account = await prisma.bankAccount.create({
      data: {
        bankName: validated.bankName,
        accountName: validated.accountName,
        accountNumber: validated.accountNumber,
        branch: validated.branch || null,
        qrImage: validated.qrImage || null,
        visible: validated.visible !== false,
        order: validated.order ?? (maxOrder._max.order ?? -1) + 1,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Create bank account error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
