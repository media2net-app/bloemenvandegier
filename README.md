# Bloemen van De Gier - Next.js E-commerce

Moderne rebuild van de WordPress/WooCommerce webshop in Next.js 14.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (to be implemented)
- **Forms**: React Hook Form + Zod (to be implemented)
- **E-commerce**: WooCommerce REST API (to be implemented)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your WooCommerce API credentials in `.env.local`:
```env
NEXT_PUBLIC_WC_URL=https://www.bloemenvandegier.nl
NEXT_PUBLIC_WC_CONSUMER_KEY=your_consumer_key
NEXT_PUBLIC_WC_CONSUMER_SECRET=your_consumer_secret
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/app                 - Next.js App Router pages
/components          - React components
  /ui                - Base UI components (Button, Card, Badge)
  /layout            - Layout components (Header, Footer, Navigation)
  /homepage          - Homepage specific components
  /product           - Product related components
  /cart              - Cart components
  /shared            - Shared utility components
/lib                 - Utilities, hooks, and API clients
  /woocommerce       - WooCommerce integration (to be implemented)
  /cart              - Cart state management
  /utils             - General utilities
  /types             - TypeScript type definitions
/public              - Static assets
```

## Features

### ✅ Implemented
- Modern homepage with hero section
- Product grid with cards
- Category navigation
- Trust bar with key selling points
- Responsive header and footer
- Mobile menu
- Cart state management (Zustand)
- TypeScript setup
- Tailwind CSS styling

### 🚧 To be implemented
- WooCommerce API integration
- Product detail pages
- Category pages
- Search functionality
- Cart drawer/page
- Checkout flow
- User account pages
- Product reviews
- Wishlist functionality

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Environment Variables

See `.env.example` for required variables.

## Notes

- Currently using mock data for products
- WooCommerce integration needs to be connected
- Images are using placeholders - replace with actual product images
- Cart functionality is set up but needs API integration for checkout
