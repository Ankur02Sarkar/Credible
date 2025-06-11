# Credit Cards Component - Redesigned

A modern, glassmorphism-styled credit card listing component built with Next.js, TypeScript, and Tailwind CSS v4.

## ✨ Features

### 🎨 Design & UI
- **Glassmorphism Design**: Beautiful glass-like effects with backdrop blur and transparency
- **Dark/Light Mode Support**: Seamless theme switching with optimized colors
- **Responsive Layout**: Mobile-first design that works on all screen sizes
- **Smooth Animations**: Engaging micro-interactions and transitions
- **Accessible Components**: WCAG compliant with proper focus management

### 🔧 Functionality
- **Dynamic Filtering**: Real-time search with multiple filter options
- **Applied Filters Display**: Visual representation of active filters with easy removal
- **Infinite Loading**: Load more cards with pagination support
- **Error Handling**: Comprehensive error boundaries with graceful fallbacks
- **Loading States**: Skeleton screens and loading indicators
- **Rating System**: Interactive star ratings with review counts

### 📱 Components Architecture

```
src/
├── components/
│   ├── credit-cards/
│   │   ├── CreditCardItem.tsx      # Individual card component
│   │   ├── CreditCardGrid.tsx      # Cards grid with layout controls
│   │   └── index.ts                # Component exports
│   ├── filters/
│   │   ├── SelectFilter.tsx        # Custom select with search
│   │   ├── AppliedFilters.tsx      # Active filters display
│   │   ├── FilterContainer.tsx     # Main filter container
│   │   └── index.ts                # Filter exports
│   └── ui/
│       ├── rating-stars.tsx        # Star rating components
│       ├── loading-skeleton.tsx    # Loading states
│       ├── error-boundary.tsx      # Error handling
│       └── button.tsx              # Base button component
├── lib/
│   └── glassmorphism.ts           # Utility classes and styles
├── types/
│   └── credit-card.ts             # TypeScript interfaces
└── styles/
    └── globals.css                # Custom animations and styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Next.js 14+
- Tailwind CSS v4
- TypeScript

### Installation
```bash
npm install
# or
yarn install
# or
bun install
```

### Usage

```tsx
import { FilterContainer } from "~/components/filters";
import { CreditCardGrid } from "~/components/credit-cards";

export default function CreditCardsPage() {
  const [filters, setFilters] = useState<FilterOptions>({
    sortby: "",
    privileges: "",
    emptype: "",
    incomeRange: "",
    page: 0,
  });

  return (
    <div>
      <FilterContainer
        filters={filters}
        onFiltersChange={setFilters}
      />
      
      <CreditCardGrid
        cards={cards}
        features={features}
        loading={loading}
        error={error}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        loadingMore={loadingMore}
      />
    </div>
  );
}
```

## 🎯 API Integration

### Expected API Response Format

```typescript
interface CreditCardApiResponse {
  pageCount: number;
  page: number;
  cardCount: number;
  totalCardCount: number;
  cardIssuer: CreditCard[];
  cardFeatureList: CardFeature[];
  // ... other fields
}
```

### Filter Options

```typescript
interface FilterOptions {
  sortby: string;           // "joining-fee(low-high)", "most-viewed", etc.
  privileges: string;       // "EMI Benefit", "Travel Benefit", etc.
  emptype: string;         // "Salaried", "Self Employed", etc.
  incomeRange: string;     // "50000-100000", etc.
  page: number;            // Pagination
}
```

## 🎨 Customization

### Glassmorphism Utilities

The `glassmorphism.ts` utility provides pre-built classes:

```typescript
import { glassmorphism, glassGradients } from "~/lib/glassmorphism";

// Usage
<div className={cn(
  glassmorphism.card,
  glassGradients.primary,
  "additional-classes"
)}>
  Content
</div>
```

### Available Glass Effects
- `glassmorphism.card` - Card containers
- `glassmorphism.button` - Interactive buttons
- `glassmorphism.input` - Form inputs
- `glassmorphism.nav` - Navigation bars
- `glassmorphism.modal` - Modal dialogs

### Gradient Backgrounds
- `glassGradients.primary` - Blue to purple
- `glassGradients.secondary` - Cyan to green
- `glassGradients.accent` - Orange to pink
- `glassGradients.card` - Subtle card gradient

## 🔧 Configuration

### Theme Support
The component supports both light and dark modes through CSS custom properties:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  /* ... other variables */
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  /* ... other variables */
}
```

### Responsive Breakpoints
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+

## 🔍 Features Breakdown

### CreditCardItem Component
- **Card Image**: Responsive with error handling
- **Rating Display**: Star ratings with review counts
- **Feature Tags**: Visual representation of card benefits
- **Financial Details**: Joining fee, annual fee, APR, reward rate
- **Responsive Design**: Adapts to mobile and desktop

### FilterContainer Component
- **Select Filters**: Custom dropdown with search functionality
- **Applied Filters**: Visual chips showing active filters
- **Clear All**: One-click filter reset
- **Real-time Updates**: Immediate API calls on filter changes

### CreditCardGrid Component
- **Grid/List View**: Toggle between layout modes
- **Loading States**: Skeleton screens during data fetch
- **Error Handling**: Graceful error displays with retry options
- **Infinite Scroll**: Load more functionality
- **Empty States**: Helpful messages when no results

## 🎭 Animations

### Built-in Animations
- `animate-float` - Floating effect
- `animate-glow` - Glowing borders
- `animate-shimmer` - Loading shimmer
- `animate-pulse-glow` - Pulsing glow effect
- `animate-fade-in` - Fade in transition
- `animate-bounce-subtle` - Subtle bounce

### Custom Keyframes
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

## 🚦 Error Handling

### Error Boundaries
- Component-level error boundaries
- Graceful fallback components
- Development vs production error displays
- Retry functionality

### Error Types
- Network errors
- API response errors
- Component render errors
- Image loading errors

## 📱 Accessibility

### Features
- Keyboard navigation
- Screen reader support
- Focus management
- ARIA labels
- Color contrast compliance
- Reduced motion support

### Best Practices
- Semantic HTML
- Proper heading hierarchy
- Alternative text for images
- Loading states announcements

## 🔧 Performance

### Optimizations
- Image lazy loading
- Component code splitting
- Memoized components
- Efficient re-renders
- Bundle size optimization

### Metrics
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## 🧪 Testing

### Test Coverage
- Unit tests for components
- Integration tests for API calls
- Accessibility tests
- Visual regression tests

### Running Tests
```bash
npm test
npm run test:coverage
npm run test:a11y
```

## 🚀 Deployment

### Environment Variables
```env
NEXT_PUBLIC_API_URL=your-api-url
NEXT_PUBLIC_IMAGE_DOMAIN=your-image-domain
```

### Build Commands
```bash
npm run build
npm start
```

## 📈 Future Enhancements

### Planned Features
- [ ] Advanced filtering with date ranges
- [ ] Comparison mode for multiple cards
- [ ] Favorites functionality
- [ ] Social sharing
- [ ] Print-friendly views
- [ ] Export to PDF
- [ ] Card recommendation engine

### Performance Improvements
- [ ] Virtual scrolling for large datasets
- [ ] Service worker for offline support
- [ ] Image optimization with next/image
- [ ] Bundle splitting optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@credible.com or create an issue in the repository.

---

*Built with ❤️ using Next.js, TypeScript, and Tailwind CSS*