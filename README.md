# 🚀 AI-Powered Credit Card Discovery Platform

A modern, intelligent credit card comparison platform built with **Next.js 14**, **TypeScript**, and **Google's Gemini AI**. Features glassmorphism design, natural language search, and AI-powered recommendations.

## ✨ Key Features

### 🤖 AI-Powered Discovery
- **Natural Language Queries**: Ask questions like "Show me cards with lounge access and high cashback on fuel"
- **Smart Recommendations**: AI analyzes card features to suggest the best matches
- **Intelligent Filtering**: Context-aware search that understands user intent
- **Confidence Scoring**: AI provides confidence levels for each recommendation

### 💬 Conversational Interface
- **AI Chat Assistant**: Interactive chat for personalized credit card advice
- **Context-Aware Responses**: Maintains conversation history for better recommendations
- **Suggested Queries**: Smart suggestions based on available cards and features
- **Real-time Processing**: Instant responses with typing indicators

### 📊 Intelligent Comparison
- **Side-by-Side Analysis**: Compare up to 3 cards with AI-generated insights
- **Pros & Cons Analysis**: AI-powered evaluation of each card's strengths and weaknesses
- **Best Use Cases**: Recommendations for optimal card usage scenarios
- **Feature Mapping**: Detailed comparison of benefits and features

### 🎨 Modern Design
- **Glassmorphism UI**: Beautiful glass-effect design with backdrop blur
- **Dark/Light Mode**: Seamless theme switching with optimized colors
- **Responsive Layout**: Mobile-first design that works on all devices
- **Smooth Animations**: Engaging micro-interactions and transitions

### 🔍 Advanced Search
- **Multi-Modal Search**: Traditional filters + AI search in one interface
- **Recent Searches**: Quick access to previous queries
- **Auto-Complete**: Smart suggestions as you type
- **Search History**: Persistent search history across sessions

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **Lucide React** - Beautiful icons

### AI & Backend
- **Google Gemini AI** - Natural language processing and recommendations
- **@google/generative-ai** - Official Gemini SDK
- **Custom AI Service** - Intelligent query processing and card analysis

### Design System
- **Glassmorphism Components** - Custom glass-effect components
- **Responsive Grid** - Adaptive layouts for all screen sizes
- **Animation System** - Custom keyframes and transitions
- **Theme Support** - Complete dark/light mode implementation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/bun
- Google Gemini API Key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd credible
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
bun install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Add your Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 AI Features Deep Dive

### Natural Language Processing
The platform uses Google's Gemini AI to process natural language queries:

```typescript
// Example: Processing user queries
const result = await geminiService.processNaturalLanguageQuery(
  "Best travel cards under ₹5000 annual fee",
  cards,
  features
);
```

### Smart Card Summaries
AI generates personalized summaries for each credit card:
- **Key Benefits**: Top 3-5 advantages
- **Best For**: Ideal user profiles
- **Important Notes**: Warnings and considerations
- **Confidence Scores**: AI confidence in recommendations

### Intelligent Comparisons
Side-by-side card analysis with AI insights:
- **Automated Pros/Cons**: AI-generated advantage analysis
- **Use Case Recommendations**: Best scenarios for each card
- **Feature Mapping**: Detailed benefit comparisons
- **Winner Recommendations**: AI-powered final recommendations

## 📱 Component Architecture

```
src/
├── components/
│   ├── ai-chat/                 # AI-powered components
│   │   ├── ChatInterface.tsx    # Conversational AI chat
│   │   ├── SearchInterface.tsx  # Natural language search
│   │   ├── CardSummary.tsx      # AI-generated summaries
│   │   └── CardComparison.tsx   # Smart comparisons
│   ├── credit-cards/            # Card display components
│   │   ├── CreditCardItem.tsx   # Individual card with AI summary
│   │   └── CreditCardGrid.tsx   # Responsive card grid
│   ├── filters/                 # Traditional filtering
│   │   ├── SelectFilter.tsx     # Custom dropdown components
│   │   ├── AppliedFilters.tsx   # Active filter display
│   │   └── FilterContainer.tsx  # Filter management
│   └── ui/                      # Reusable UI components
├── lib/
│   ├── ai/                      # AI service layer
│   │   └── gemini-service.ts    # Gemini AI integration
│   └── glassmorphism.ts         # Design system utilities
└── types/
    └── credit-card.ts           # TypeScript definitions
```

## 🔧 AI Service Configuration

The platform includes a comprehensive AI service layer:

### Query Processing
```typescript
interface QueryResult {
  query: string;
  filteredCards: CreditCard[];
  explanation: string;
  confidence: number;
}
```

### Card Analysis
```typescript
interface CardSummary {
  cardId: string;
  summary: string;
  keyBenefits: string[];
  bestFor: string[];
  warnings?: string[];
}
```

### Comparison Engine
```typescript
interface ComparisonResult {
  cards: CreditCard[];
  comparison: {
    pros: Record<string, string[]>;
    cons: Record<string, string[]>;
    bestFor: Record<string, string>;
    recommendation: string;
  };
}
```

## 🎨 Design System

### Glassmorphism Utilities
```typescript
// Built-in glass effects
glassmorphism.card      // Card containers
glassmorphism.button    // Interactive buttons
glassmorphism.nav       // Navigation bars
glassmorphism.modal     // Modal dialogs

// Gradient backgrounds
glassGradients.primary   // Blue to purple
glassGradients.secondary // Cyan to green
glassGradients.card     // Subtle card gradient
```

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Adaptive Components**: Components that scale beautifully
- **Touch-Friendly**: Large touch targets and smooth interactions

## 🚀 Deployment

### Environment Setup
```env
# Required for AI features
GEMINI_API_KEY="your-gemini-api-key"
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"

# Database (if using)
DATABASE_URL="your-database-url"
```

### Build Commands
```bash
# Production build
npm run build

# Start production server
npm start

# Development with hot reload
npm run dev
```

## 📊 Performance Features

- **Lazy Loading**: Images and components load on demand
- **Memoization**: Optimized re-renders with React.memo
- **Skeleton Screens**: Beautiful loading states
- **Error Boundaries**: Graceful error handling
- **Progressive Enhancement**: Works without JavaScript

## 🔮 Future Enhancements

- [ ] **Advanced ML Models**: Custom credit card recommendation models
- [ ] **Voice Search**: Voice-powered queries
- [ ] **Personalization**: User preference learning
- [ ] **Real-time Data**: Live credit card offers and rates
- [ ] **Mobile App**: React Native companion app
- [ ] **API Integration**: Real bank API connections

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@credible.com
- Documentation: [Link to docs]

---

**Built with ❤️ using Next.js, TypeScript, and Google Gemini AI**

*Experience the future of credit card discovery - where AI meets beautiful design.*
