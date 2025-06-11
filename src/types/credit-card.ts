export interface CreditCard {
  cardIssuerName: string | null;
  cardLogo: string | null;
  cardIssuerID: string | null;
  issuerImage: string;
  issuerSlug: string;
  isFeatured: number;
  cardCount: number | null;
  publish: number;
  cardID: string;
  cardName: string;
  cardImage: string;
  joiningFee: string;
  annualFee: string;
  minMonthlyIncome: number;
  annualPercentageRate: string;
  cardType: string;
  employmentType: string;
  networkType: string | null;
  urlSlug: string;
  overAllRating: number;
  statsCount: number;
  datecreated: string;
  rewardPoints: string | null;
  bestFor: string;
  totalCards: number | null;
  rewardRate: string;
  referralLink: string | null;
}

export interface CardFeature {
  cardFeatureID: string | null;
  cardID: string;
  serialNumber: number | null;
  heading: string;
  description: string | null;
}

export interface CreditCardApiResponse {
  thisCard: any | null;
  issuerList: any | null;
  cardType: any | null;
  cardFeature: any | null;
  networkType: any | null;
  joiningFee: any | null;
  employmentType: any | null;
  faqdetails: any | null;
  seoDetail: any | null;
  pageCount: number;
  page: number;
  cardCount: number;
  totalCardCount: number;
  cardIssuer: CreditCard[];
  cardFeatureList: CardFeature[];
  statistics: any | null;
  thisIssuer: any | null;
  cardIssuerId: any | null;
  referralLink: any | null;
  finedineuser: any | null;
  premiumuser: any | null;
  mode: any | null;
  leads: any | null;
  cardLeads: any | null;
  seoSchemas: any | null;
}

export interface FilterOptions {
  sortby: string;
  privileges: string;
  emptype: string;
  incomeRange: string;
  page: number;
}

export interface AppliedFilter {
  type: 'sortby' | 'privileges' | 'emptype' | 'incomeRange';
  value: string;
  label: string;
}