import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CreditCard, CardFeature } from '~/types/credit-card';

// Initialize the Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface QueryResult {
  query: string;
  filteredCards: CreditCard[];
  explanation: string;
  confidence: number;
}

export interface CardSummary {
  cardId: string;
  summary: string;
  keyBenefits: string[];
  bestFor: string[];
  warnings?: string[];
}

export interface ComparisonResult {
  cards: CreditCard[];
  comparison: {
    pros: Record<string, string[]>;
    cons: Record<string, string[]>;
    bestFor: Record<string, string>;
    recommendation: string;
  };
}

class GeminiService {
  private async generateResponse(prompt: string, maxRetries = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error(`Gemini API attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw new Error('Failed to generate AI response after multiple attempts');
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error('Unexpected error in generateResponse');
  }

  async processNaturalLanguageQuery(
    query: string,
    cards: CreditCard[],
    features: CardFeature[]
  ): Promise<QueryResult> {
    const prompt = `
As a credit card expert, analyze this user query and filter the most relevant credit cards.

User Query: "${query}"

Available Credit Cards:
${cards.map(card => `
- ${card.cardName}
  - Type: ${card.cardType}
  - Best For: ${card.bestFor}
  - Joining Fee: ${card.joiningFee}
  - Annual Fee: ${card.annualFee}
  - Reward Rate: ${card.rewardRate}
  - Employment: ${card.employmentType}
  - Min Income: ₹${card.minMonthlyIncome}
  - Rating: ${card.overAllRating}/5
  - Features: ${features.filter(f => f.cardID === card.cardID).map(f => f.heading).join(', ')}
`).join('\n')}

Please analyze the query and return a JSON response with:
1. An array of cardIDs that best match the query criteria
2. A confidence score (0-100) for the match quality
3. A clear explanation of why these cards were selected
4. Maximum 10 cards in the result

Format your response as valid JSON:
{
  "cardIds": ["card-id-1", "card-id-2"],
  "confidence": 85,
  "explanation": "I selected these cards because..."
}
`;

    try {
      const response = await this.generateResponse(prompt);
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      const filteredCards = cards.filter(card => 
        parsed.cardIds.includes(card.cardID)
      );

      return {
        query,
        filteredCards,
        explanation: parsed.explanation || 'Cards selected based on your criteria.',
        confidence: Math.min(100, Math.max(0, parsed.confidence || 70))
      };
    } catch (error) {
      console.error('Error processing natural language query:', error);
      
      // Fallback: Simple keyword matching
      const keywords = query.toLowerCase().split(' ');
      const fallbackCards = cards.filter(card => {
        const cardText = `${card.cardName} ${card.bestFor} ${card.cardType}`.toLowerCase();
        const cardFeatures = features
          .filter(f => f.cardID === card.cardID)
          .map(f => f.heading.toLowerCase())
          .join(' ');
        
        return keywords.some(keyword => 
          cardText.includes(keyword) || cardFeatures.includes(keyword)
        );
      }).slice(0, 10);

      return {
        query,
        filteredCards: fallbackCards,
        explanation: 'Found cards matching your search terms. AI analysis temporarily unavailable.',
        confidence: 60
      };
    }
  }

  async generateCardSummary(
    card: CreditCard,
    features: CardFeature[]
  ): Promise<CardSummary> {
    const cardFeatures = features.filter(f => f.cardID === card.cardID);
    
    const prompt = `
Create a concise, helpful summary for this credit card:

Card: ${card.cardName}
Type: ${card.cardType}
Best For: ${card.bestFor}
Joining Fee: ${card.joiningFee}
Annual Fee: ${card.annualFee}
Reward Rate: ${card.rewardRate}
Employment Required: ${card.employmentType}
Minimum Income: ₹${card.minMonthlyIncome}/month
Rating: ${card.overAllRating}/5 (${card.statsCount} reviews)
Features: ${cardFeatures.map(f => f.heading).join(', ')}

Please provide a JSON response with:
1. A 2-3 sentence summary highlighting the card's main value proposition
2. Top 3-5 key benefits as bullet points
3. What type of users this card is best for (2-3 categories)
4. Any important warnings or limitations (if applicable)

Format as valid JSON:
{
  "summary": "Brief overview...",
  "keyBenefits": ["Benefit 1", "Benefit 2"],
  "bestFor": ["User type 1", "User type 2"],
  "warnings": ["Warning 1"] // optional
}
`;

    try {
      const response = await this.generateResponse(prompt);
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      return {
        cardId: card.cardID,
        summary: parsed.summary || `${card.cardName} offers ${card.rewardRate} rewards and is best for ${card.bestFor.toLowerCase()}.`,
        keyBenefits: parsed.keyBenefits || cardFeatures.slice(0, 5).map(f => f.heading),
        bestFor: parsed.bestFor || [card.bestFor],
        warnings: parsed.warnings || undefined
      };
    } catch (error) {
      console.error('Error generating card summary:', error);
      
      // Fallback summary
      return {
        cardId: card.cardID,
        summary: `${card.cardName} is a ${card.cardType.toLowerCase()} offering ${card.rewardRate} rewards. Best suited for ${card.bestFor.toLowerCase()} with a minimum income of ₹${card.minMonthlyIncome.toLocaleString()}.`,
        keyBenefits: cardFeatures.slice(0, 5).map(f => f.heading),
        bestFor: [card.bestFor],
      };
    }
  }

  async compareCards(
    cards: CreditCard[],
    features: CardFeature[]
  ): Promise<ComparisonResult> {
    if (cards.length < 2) {
      throw new Error('At least 2 cards required for comparison');
    }

    const cardsWithFeatures = cards.map(card => ({
      ...card,
      features: features.filter(f => f.cardID === card.cardID).map(f => f.heading)
    }));

    const prompt = `
Compare these credit cards and provide a detailed analysis:

${cardsWithFeatures.map((card, index) => `
Card ${index + 1}: ${card.cardName}
- Type: ${card.cardType}
- Joining Fee: ${card.joiningFee}
- Annual Fee: ${card.annualFee}
- Reward Rate: ${card.rewardRate}
- Rating: ${card.overAllRating}/5
- Min Income: ₹${card.minMonthlyIncome}
- Features: ${card.features.join(', ')}
`).join('\n')}

Provide a comprehensive comparison as JSON:
{
  "pros": {
    "Card Name 1": ["Pro 1", "Pro 2"],
    "Card Name 2": ["Pro 1", "Pro 2"]
  },
  "cons": {
    "Card Name 1": ["Con 1", "Con 2"],
    "Card Name 2": ["Con 1", "Con 2"]
  },
  "bestFor": {
    "Card Name 1": "Best for category/user type",
    "Card Name 2": "Best for category/user type"
  },
  "recommendation": "Overall recommendation with reasoning (2-3 sentences)"
}
`;

    try {
      const response = await this.generateResponse(prompt);
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);
      
      return {
        cards,
        comparison: {
          pros: parsed.pros || {},
          cons: parsed.cons || {},
          bestFor: parsed.bestFor || {},
          recommendation: parsed.recommendation || 'Both cards have their merits. Choose based on your spending patterns and preferences.'
        }
      };
    } catch (error) {
      console.error('Error comparing cards:', error);
      
      // Fallback comparison
      const fallbackComparison = {
        pros: {} as Record<string, string[]>,
        cons: {} as Record<string, string[]>,
        bestFor: {} as Record<string, string>,
        recommendation: 'Compare the fees, rewards, and features to choose the best card for your needs.'
      };

      cards.forEach(card => {
        fallbackComparison.pros[card.cardName] = [
          `${card.rewardRate} reward rate`,
          `Rated ${card.overAllRating}/5 by users`
        ];
        fallbackComparison.cons[card.cardName] = [
          `₹${card.joiningFee.split('|')[0]?.trim()} joining fee`
        ];
        fallbackComparison.bestFor[card.cardName] = card.bestFor;
      });

      return {
        cards,
        comparison: fallbackComparison
      };
    }
  }

  async generateChatResponse(
    message: string,
    context: {
      cards: CreditCard[];
      features: CardFeature[];
      previousMessages?: ChatMessage[];
    }
  ): Promise<string> {
    const contextInfo = context.previousMessages 
      ? context.previousMessages.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    const prompt = `
You are a helpful credit card advisor for Indian users. Provide personalized advice based on the available credit cards.

Previous conversation context:
${contextInfo}

Current user message: "${message}"

Available credit cards:
${context.cards.slice(0, 20).map(card => `
- ${card.cardName}: ${card.bestFor}, ${card.rewardRate} rewards, ₹${card.minMonthlyIncome} min income
`).join('')}

Provide a helpful, conversational response. Be specific about card recommendations when relevant.
Keep responses concise but informative (2-4 sentences max).
`;

    try {
      const response = await this.generateResponse(prompt);
      return response.trim();
    } catch (error) {
      console.error('Error generating chat response:', error);
      return 'I apologize, but I\'m having trouble processing your request right now. Please try asking about specific card features or requirements, and I\'ll do my best to help you find the right credit card.';
    }
  }

  // Utility method to extract keywords from natural language queries
  extractKeywords(query: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'show', 'me', 'find', 'get', 'best', 'good', 'cards', 'card', 'credit'];
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .filter(word => /^[a-zA-Z]+$/.test(word));
  }

  // Method to suggest queries based on available cards
  generateSuggestedQueries(cards: CreditCard[], features: CardFeature[]): string[] {
    const uniqueFeatures = [...new Set(features.map(f => f.heading))];
    const uniqueBestFor = [...new Set(cards.map(c => c.bestFor))];
    
    const suggestions = [
      'Show me cards with no annual fee',
      'Best travel credit cards with lounge access',
      'Cards with high cashback on fuel and dining',
      'Premium cards for high income earners',
      'Best first credit card for beginners',
      ...uniqueFeatures.slice(0, 3).map(feature => `Cards with ${feature.toLowerCase()}`),
      ...uniqueBestFor.slice(0, 3).map(category => `Best cards for ${category.toLowerCase()}`),
    ];

    return suggestions.slice(0, 8);
  }
}

export const geminiService = new GeminiService();