# Skillrush

Skillrush is an interactive web platform for tactical lineups and plays, built with Next.js, TypeScript, Tailwind CSS and Supabase.

## Features

- ✅ **Next.js (App Router)** - Fast SSR/SSG and modern routing
- ⚛️ **React 18** - Modern React with hooks and functional components
- 📘 **TypeScript** - Full type safety and better developer experience
- 🎨 **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- 🎯 **Custom Hooks** - Reusable scroll animation and other utility hooks
- 📦 **Component Structure** - Well-organized component architecture with pages and sections
- 🎭 **Error Boundaries** - Graceful error handling throughout the app
- 📱 **Responsive Design** - Mobile-first approach with Tailwind breakpoints

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd React_Template

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── pages/           # Full-page components
│   ├── Hero.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ...
├── types/               # TypeScript type definitions
├── services/            # API calls and utilities
├── hooks/               # Custom React hooks
├── constants/           # Constant values and design tokens
└── App.tsx             # Main app component

public/                 # Static assets
dist/                   # Production build output
```

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```ini
# API Configuration
VITE_API_URL=https://api.example.com

# Optional: Other service endpoints
VITE_SERVICE_KEY=your_key_here
```

Environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Design System

### Colors

All brand colors are defined in `src/constants/ui.ts`:

```typescript
import { COLORS } from '@/constants/ui';

COLORS.primary        // Brand primary color
COLORS.primaryDark    // Hover state
COLORS.neutral[50-900] // Neutral palette
COLORS.success        // Status colors
COLORS.warning
COLORS.error
COLORS.info
```

### Spacing & Typography

```typescript
import { SPACING, TYPOGRAPHY } from '@/constants/ui';

SPACING.xs, SPACING.sm, SPACING.md, // ... lg, xl, 2xl, 3xl
TYPOGRAPHY.fontFamily.sans
TYPOGRAPHY.fontSize.base
```

## Component Examples

### Data-Fetching Component

```tsx
import { useState, useEffect } from 'react';

export default function MyComponent() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(/* ... */);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return <section>{/* render data */}</section>;
}
```

### Scroll Animation Hook

```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function Section() {
  const { elementRef, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      Animated content
    </div>
  );
}
```

## State Management

This template uses **React Hooks only** for state management:

- **Page-level state** in `App.tsx`
- **Component-level state** with `useState` and `useEffect`
- **Custom hooks** for reusable logic
- **No Redux, Context API, or other state libraries** (keep it simple!)

## Styling

- **Tailwind CSS** for all styling (no CSS modules or styled-components)
- Design tokens in `src/constants/ui.ts`
- Mobile-first responsive design
- Utility classes for rapid development

## Icons

Uses **lucide-react** for icons:

```tsx
import { ArrowLeft, Heart, Menu, X } from 'lucide-react';

<ArrowLeft size={20} />
```

## Building for Production

```bash
npm run build
```

This creates an optimized `dist/` folder ready for deployment.

## Deployment

The `dist/` folder can be deployed to any static hosting:
- Netlify
- Vercel
- CloudFlare Pages
- GitHub Pages
- Traditional web servers

## Browser Support

- Modern browsers with ES2020 support
- Chrome, Firefox, Safari, Edge (latest versions)

## License

MIT

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

---

**Ready to build something great!** 🚀
