export type HoneyCategory = 
  | 'wszystkie'
  | 'wiosenne'
  | 'letnie'
  | 'lesne-spadz'
  | 'z-dodatkami'
  | 'zestawy';

export type ConsistencyType = 'kremowany' | 'patoka' | 'krupiec';

export type FlavorIntensity = 'lagodny' | 'sredni' | 'wyrazisty';

export type Gramature = '250g' | '450g' | '500g' | '900g' | '1000g' | string;

export interface HoneySizeOption {
  weightGrams: number;
  label: string;
  pricePln: number;
  inStock: boolean;
}

export interface SensoryProfile {
  sweetness: number;
  acidity: number;
  intensity: number;
  crystallization: number;
}

export interface ProductReview {
  id: string | number;
  author: string;
  city?: string;
  rating: number;
  date: string;
  title?: string;
  text?: string;
  content?: string;
  verified: boolean;
}

export interface TasteProfile {
  sweetness: number;
  acidity: number;
  aroma: number;
  crystallization: string;
  color: string;
}

export interface LabAnalysis {
  lotNumber?: string;
  waterContent?: string;
  diastaseNumber?: string;
  hmf?: string;
  conductivity?: string;
}

export interface DetailedUsage {
  recommendedDose?: string;
  culinaryIdeas?: string[];
}

export interface HoneyProduct {
  id: string;
  wooId?: number;
  name: string;
  botanicalName: string;
  subtitle: string;
  category: HoneyCategory;
  description: string;
  harvestYear: number;
  harvestMonth: string;
  batchNumber: string;
  apiaryLocation: string;
  dominantPollenPercentage: number;
  dominantPlant: string;
  waterContentPercentage: number;
  consistency: ConsistencyType;
  flavorIntensity: FlavorIntensity;
  flavorNotes: string[];
  recommendedUse: string[];
  sensoryProfile: SensoryProfile;
  colorHex: string;
  colorName: string;
  sizes: HoneySizeOption[];
  imageUrl: string;
  videoUrl?: string;
  rating: number;
  reviewsCount: number;
  isBestseller?: boolean;
  isNewHarvest?: boolean;
  isLimitedBatch?: boolean;

  // Opcjonalne rozszerzone pola dla wzbogaconej prezentacji
  tagline?: string;
  botanicalSource?: string;
  region?: string;
  badge?: string;
  images?: string[];
  tasteProfile?: TasteProfile;
  healthBenefits?: string[];
  pairing?: string;
  labAnalysis?: LabAnalysis;
  detailedUsage?: DetailedUsage;
  customerReviews?: ProductReview[];
  prices?: Record<string, number>;
  longDescription?: string;
  tastingNotes?: string[];
}

export interface CartItem {
  product: HoneyProduct;
  selectedWeightGrams?: number;
  weightGrams?: number;
  pricePln: number;
  quantity: number;
  subscriptionInterval?: number;
}

export type HealthIntentFilter = 'wszystkie' | 'odpornosc' | 'lagodne' | 'koneser' | 'prezent';

export interface FilterState {
  category: HoneyCategory;
  healthIntent?: HealthIntentFilter;
  consistency: string;
  intensity: string;
  searchQuery: string;
  flavorNote?: string | null;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'harvest';
}

