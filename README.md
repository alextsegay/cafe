# Premium Café Digital Menu Platform

A modern, premium digital menu platform for cafés built with Next.js 14, React, TypeScript, Prisma, and MySQL.

## Features

### Public Website
- 🌟 Beautiful landing page with hero section, about, featured menu, gallery, testimonials, and contact
- 📱 Fully responsive design (mobile-first)
- 🎨 Premium UI with glassmorphism, animations, and elegant typography
- 🌓 Dark/Light mode
- 🌐 Bilingual support (English/Amharic)

### Digital Menu
- 📷 Large food photography
- 🔍 Real-time search
- 🏷️ Sticky category navigation
- ✨ Popular, New, and Daily Special badges
- 📋 Detailed item modal with ingredients
- 📲 QR code access for customers
- 📶 PWA with offline caching

### Admin Dashboard
- 🔐 Secure authentication
- 📊 Dashboard with statistics
- 🍽️ Full CRUD for menu items
- 📁 Category management with drag-to-reorder
- 🖼️ Gallery management
- ⚙️ Settings (branding, colors, hours, social links)
- 📱 QR code generator (PNG, SVG, Print)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: MySQL
- **Auth**: JWT with HTTP-only cookies
- **UI**: Framer Motion, Lucide Icons
- **PWA**: Service Worker, Web App Manifest

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd cafe
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database URL:
```
DATABASE_URL="mysql://user:password@localhost:3306/cafe_db"
JWT_SECRET="your-super-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database (MySQL requires creating the database first):
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cafe_db;"
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Default Admin Credentials

- **Email**: admin@cafemenu.com
- **Password**: admin123

⚠️ Change these credentials in production!

## Project Structure

```
cafe/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── api/             # API routes
│   │   └── menu/            # Public menu pages
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── landing/         # Landing page components
│   │   ├── menu/            # Menu components
│   │   └── shared/          # Shared components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and helpers
│   └── types/               # TypeScript types
├── prisma/                  # Prisma schema and seed
├── public/                  # Static assets
└── ...
```

## API Endpoints

### Auth
- `POST /api/auth` - Login/Logout/Register
- `GET /api/auth/me` - Get current user

### Menu
- `GET /api/menu` - List all menu items
- `POST /api/menu` - Create menu item
- `GET /api/menu/[id]` - Get menu item
- `PUT /api/menu/[id]` - Update menu item
- `DELETE /api/menu/[id]` - Delete menu item

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Gallery
- `GET /api/gallery` - List all images
- `POST /api/gallery` - Add image
- `PUT /api/gallery/[id]` - Update image
- `DELETE /api/gallery/[id]` - Delete image

### Settings
- `GET /api/cafe` - Get café settings
- `PUT /api/cafe` - Update café settings

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy!

### Manual

```bash
npm run build
npm start
```

## License

MIT License
