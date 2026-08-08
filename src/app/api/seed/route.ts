import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import config from '@/lib/config'

// Protect this endpoint with a secret key to prevent unauthorized seeding in production.
// Set SEED_SECRET in your Vercel environment variables, then call:
//   GET /api/seed?secret=YOUR_SEED_SECRET
const SEED_SECRET = process.env.SEED_SECRET

export async function GET(request: Request) {
  // Guard: require secret if SEED_SECRET env var is set
  if (SEED_SECRET) {
    const { searchParams } = new URL(request.url)
    const provided = searchParams.get('secret')
    if (provided !== SEED_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash(config.admin.password, 10)

    await prisma.user.upsert({
      where: { email: config.admin.email },
      update: {},
      create: {
        email: config.admin.email,
        password: hashedPassword,
        name: config.admin.name,
        role: 'admin',
      },
    })

    // Create default cafe
    await prisma.cafe.upsert({
      where: { slug: config.cafe.slug },
      update: {},
      create: {
        name: config.cafe.name,
        slug: config.cafe.slug,
        address: config.cafe.address,
        phone: config.cafe.phone,
        email: config.cafe.email,
        tagline: config.cafe.tagline,
        primaryColor: config.cafe.primaryColor,
        secondaryColor: config.cafe.secondaryColor,
        language: config.cafe.language,
        aboutTitle: config.cafe.aboutTitle,
        aboutDescription: config.cafe.aboutDescription,
        openingHours: config.openingHours,
        socialLinks: config.socialLinks,
      },
    })

    // Create categories — use stable IDs so re-seeding never causes conflicts
    const categories = [
      { id: 'cat-0', name: 'Coffee',       nameAm: 'ቡና',            icon: 'coffee' },
      { id: 'cat-1', name: 'Tea',          nameAm: 'ሻይ',            icon: 'cup-soda' },
      { id: 'cat-2', name: 'Breakfast',    nameAm: 'የማታ ምሳ',       icon: 'croissant' },
      { id: 'cat-3', name: 'Desserts',     nameAm: 'ጣፋጭ ምግቦች',    icon: 'cake-slice' },
      { id: 'cat-4', name: 'Fresh Juices', nameAm: 'አዲስ ጭማቂዎች',   icon: 'glass-water' },
      { id: 'cat-5', name: 'Smoothies',    nameAm: 'ስሞዚዎች',        icon: 'blender' },
      { id: 'cat-6', name: 'Snacks',       nameAm: 'ቅርጥብስቦች',     icon: 'cookie' },
    ]

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i]
      await prisma.category.upsert({
        where: { id: cat.id },
        update: { name: cat.name, nameAm: cat.nameAm, icon: cat.icon, order: i },
        create: { id: cat.id, name: cat.name, nameAm: cat.nameAm, icon: cat.icon, order: i },
      })
    }

    // Create sample menu items — use stable IDs so re-seeding is idempotent
    const menuItems = [
      {
        id: 'menu-0',
        name: 'Espresso',        nameAm: 'ኢስፕረሶ',
        description: 'Rich and bold single shot of pure coffee essence',
        descriptionAm: 'ጥራት ያለው እና ጠንካራ የቡና መርጫ',
        price: 3.50, categoryId: 'cat-0', popular: true,
      },
      {
        id: 'menu-1',
        name: 'Cappuccino',      nameAm: 'ካፑቺኖ',
        description: 'Perfect balance of espresso, steamed milk, and foam',
        descriptionAm: 'የቡና፣ የሚያበስል ወተት እና ቅልጥፍና ፍፁም ሚዛን',
        price: 5.00, categoryId: 'cat-0', popular: true,
      },
      {
        id: 'menu-2',
        name: 'Latte',           nameAm: 'ላትስ',
        description: 'Smooth espresso with creamy steamed milk',
        descriptionAm: 'ለስላሳ ቡና ከክረምት ወተት ጋር',
        price: 4.50, categoryId: 'cat-0',
      },
      {
        id: 'menu-3',
        name: 'Green Tea',       nameAm: 'ነጭ ሻይ',
        description: 'Premium Japanese green tea with calming aroma',
        descriptionAm: 'የጃፓን ልዩ ነጭ ሻይ ከሰላም ሰጪ ሽታ',
        price: 4.00, categoryId: 'cat-1',
      },
      {
        id: 'menu-4',
        name: 'Earl Grey',       nameAm: 'አርል ግሪ',
        description: 'Classic bergamot-infused black tea',
        descriptionAm: 'ክላሲክ ቤርጌሞት የተሞላ ጨው ሻይ',
        price: 3.50, categoryId: 'cat-1',
      },
      {
        id: 'menu-5',
        name: 'Avocado Toast',   nameAm: 'አቮካዶ ቶስት',
        description: 'Sourdough toast topped with fresh avocado and poached eggs',
        descriptionAm: 'ሱርዶ ቶስት ከአዲስ አቮካዶ እና የተቀላቀሉ እንቁላሎች',
        price: 12.00, categoryId: 'cat-2', popular: true, isNew: true,
      },
      {
        id: 'menu-6',
        name: 'Pancakes',        nameAm: 'ፓንኬይኮች',
        description: 'Fluffy buttermilk pancakes with maple syrup and berries',
        descriptionAm: 'ለስላሳ ቡትርሚልክ ፓንኬይኮች ከሜፕል ሽሮፕ እና ቤሪዎች',
        price: 10.00, categoryId: 'cat-2',
      },
      {
        id: 'menu-7',
        name: 'Chocolate Cake',  nameAm: 'ቸኮለት ኬሽ',
        description: 'Decadent triple-layer chocolate cake with ganache',
        descriptionAm: 'ከጋናች ጋር የሶስት ሽፋን ቸኮለት ኬሽ',
        price: 8.00, categoryId: 'cat-3', popular: true,
      },
      {
        id: 'menu-8',
        name: 'Cheesecake',      nameAm: 'ቺዝኬይክ',
        description: 'New York style cheesecake with berry compote',
        descriptionAm: 'የኒው ዮርክ ስታይል ቺዝኬይክ ከቤሪ ኮምፖት',
        price: 7.50, categoryId: 'cat-3',
      },
      {
        id: 'menu-9',
        name: 'Fresh Orange Juice', nameAm: 'አዲስ ብርቱካንማ',
        description: 'Freshly squeezed orange juice, no added sugar',
        descriptionAm: 'አዲስ የተጨመቀ ብርቱካንማ ጭማቂ፣ የተጨመረ ስኳር የለም',
        price: 5.00, categoryId: 'cat-4',
      },
      {
        id: 'menu-10',
        name: 'Berry Smoothie',  nameAm: 'ቤሪ ስሞዚ',
        description: 'Mixed berries blended with yogurt and honey',
        descriptionAm: 'የተቀላቀሉ ቤሪዎች ከዮግርት እና ማር ጋር የተቀላቀሉ',
        price: 7.00, categoryId: 'cat-5', isNew: true,
      },
      {
        id: 'menu-11',
        name: 'Croissant',       nameAm: 'ክሮዋሳን',
        description: 'Buttery, flaky French croissant',
        descriptionAm: 'ቡትር የበለፀገ ፈረንሳዊ ክሮዋሳን',
        price: 4.00, categoryId: 'cat-6', popular: true,
      },
    ]

    for (const item of menuItems) {
      const { id, ...data } = item
      await prisma.menuItem.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      })
    }

    // Create sample gallery images — stable IDs, safe to re-run
    const galleryImages = [
      process.env.NEXT_PUBLIC_GALLERY_IMAGE_1 || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      process.env.NEXT_PUBLIC_GALLERY_IMAGE_2 || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
      process.env.NEXT_PUBLIC_GALLERY_IMAGE_3 || 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800',
      process.env.NEXT_PUBLIC_GALLERY_IMAGE_4 || 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=800',
      process.env.NEXT_PUBLIC_GALLERY_IMAGE_5 || 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=800',
      process.env.NEXT_PUBLIC_GALLERY_IMAGE_6 || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    ]

    for (let i = 0; i < galleryImages.length; i++) {
      await prisma.gallery.upsert({
        where: { id: `gallery-${i}` },
        update: { image: galleryImages[i], order: i },
        create: { id: `gallery-${i}`, image: galleryImages[i], order: i },
      })
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully!' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}