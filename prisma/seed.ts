import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import config from '../src/lib/config'

const prisma = new PrismaClient()

async function main() {
  // Never seed with the default password in production.
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is required before seeding in production')
  }

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

  // Create categories
  const categories = [
    { name: 'Coffee', nameAm: 'ቡና', icon: 'coffee' },
    { name: 'Tea', nameAm: 'ሻይ', icon: 'cup-soda' },
    { name: 'Breakfast', nameAm: 'የማታ ምሳ', icon: 'croissant' },
    { name: 'Desserts', nameAm: 'ጣፋጭ ምግቦች', icon: 'cake-slice' },
    { name: 'Fresh Juices', nameAm: 'አዲስ ጭማቂዎች', icon: 'glass-water' },
    { name: 'Smoothies', nameAm: 'ስሞዚዎች', icon: 'blender' },
    { name: 'Snacks', nameAm: 'ቅርጥብስቦች', icon: 'cookie' },
  ]

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    await prisma.category.upsert({
      where: { id: `cat-${i}` },
      update: {},
      create: {
        id: `cat-${i}`,
        name: cat.name,
        nameAm: cat.nameAm,
        icon: cat.icon,
        order: i,
      },
    })
  }

  // Create sample menu items
  const menuItems = [
    {
      name: 'Espresso',
      nameAm: 'ኢስፕረሶ',
      description: 'Rich and bold single shot of pure coffee essence',
      descriptionAm: 'ጥራት ያለው እና ጠንካራ የቡና መርጫ',
      price: 3.50,
      categoryId: 'cat-0',
      popular: true,
    },
    {
      name: 'Cappuccino',
      nameAm: 'ካፑቺኖ',
      description: 'Perfect balance of espresso, steamed milk, and foam',
      descriptionAm: 'የቡና፣ የሚያበስል ወተት እና ቅልጥፍና ፍፁም ሚዛን',
      price: 5.00,
      categoryId: 'cat-0',
      popular: true,
    },
    {
      name: 'Latte',
      nameAm: 'ላትስ',
      description: 'Smooth espresso with creamy steamed milk',
      descriptionAm: 'ለስላሳ ቡና ከክረምት ወተት ጋር',
      price: 4.50,
      categoryId: 'cat-0',
    },
    {
      name: 'Green Tea',
      nameAm: 'ነጭ ሻይ',
      description: 'Premium Japanese green tea with calming aroma',
      descriptionAm: 'የጃፓን ልዩ ነጭ ሻይ ከሰላም ሰጪ ሽታ',
      price: 4.00,
      categoryId: 'cat-1',
    },
    {
      name: 'Earl Grey',
      nameAm: 'አርል ግሪ',
      description: 'Classic bergamot-infused black tea',
      descriptionAm: 'ክላሲክ ቤርጌሞት የተሞላ ጨው ሻይ',
      price: 3.50,
      categoryId: 'cat-1',
    },
    {
      name: 'Avocado Toast',
      nameAm: 'አቮካዶ ቶስት',
      description: 'Sourdough toast topped with fresh avocado and poached eggs',
      descriptionAm: 'ሱርዶ ቶስት ከአዲስ አቮካዶ እና የተቀላቀሉ እንቁላሎች',
      price: 12.00,
      categoryId: 'cat-2',
      popular: true,
      isNew: true,
    },
    {
      name: 'Pancakes',
      nameAm: 'ፓንኬይኮች',
      description: 'Fluffy buttermilk pancakes with maple syrup and berries',
      descriptionAm: 'ለስላሳ ቡትርሚልክ ፓንኬይኮች ከሜፕል ሽሮፕ እና ቤሪዎች',
      price: 10.00,
      categoryId: 'cat-2',
    },
    {
      name: 'Chocolate Cake',
      nameAm: 'ቸኮለት ኬሽ',
      description: 'Decadent triple-layer chocolate cake with ganache',
      descriptionAm: 'ከጋናች ጋር የሶስት ሽፋን ቸኮለት ኬሽ',
      price: 8.00,
      categoryId: 'cat-3',
      popular: true,
    },
    {
      name: 'Cheesecake',
      nameAm: 'ቺዝኬይክ',
      description: 'New York style cheesecake with berry compote',
      descriptionAm: 'የኒው ዮርክ ስታይል ቺዝኬይክ ከቤሪ ኮምፖት',
      price: 7.50,
      categoryId: 'cat-3',
    },
    {
      name: 'Fresh Orange Juice',
      nameAm: 'አዲስ ብርቱካንማ',
      description: 'Freshly squeezed orange juice, no added sugar',
      descriptionAm: 'አዲስ የተጨመቀ ብርቱካንማ ጭማቂ፣ የተጨመረ ስኳር የለም',
      price: 5.00,
      categoryId: 'cat-4',
    },
    {
      name: 'Berry Smoothie',
      nameAm: 'ቤሪ ስሞዚ',
      description: 'Mixed berries blended with yogurt and honey',
      descriptionAm: 'የተቀላቀሉ ቤሪዎች ከዮግርት እና ማር ጋር የተቀላቀሉ',
      price: 7.00,
      categoryId: 'cat-5',
      isNew: true,
    },
    {
      name: 'Croissant',
      nameAm: 'ክሮዋሳን',
      description: 'Buttery, flaky French croissant',
      descriptionAm: 'ቡትር የበለፀገ ፈረንሳዊ ክሮዋሳን',
      price: 4.00,
      categoryId: 'cat-6',
      popular: true,
    },
  ]

  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i]
    await prisma.menuItem.upsert({
      where: { id: `menu-${i}` },
      update: {},
      create: {
        id: `menu-${i}`,
        ...item,
      },
    })
  }

  // Create sample gallery images
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
      update: {},
      create: {
        id: `gallery-${i}`,
        image: galleryImages[i],
        order: i,
      },
    })
  }

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
