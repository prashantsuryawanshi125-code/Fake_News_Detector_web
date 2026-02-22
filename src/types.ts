
export type NewsCategory = 'REAL' | 'FAKE' | 'MISLEADING' | 'SATIRE' | 'UNVERIFIED';

export interface LSTMStep {
  token: string;
  forgetGate: number;
  inputGate: number;
  outputGate: number;
  cellState: number;
  hiddenState: number;
  weight: number;
}

export interface AnalysisResult {
  score: number;
  category: NewsCategory;
  summary: string;
  imageUrl?: string;
  visualMetadata: {
    suggestedPhotoQuery: string;
    imageClarityScore: number;
  };
  linguisticPatterns: {
    clickbaitFactor: number;
    emotionalIntensity: number;
    biasScore: number;
    sourceReliability: number;
  };
  visualIndicators: {
    batteryLevel: number;
    signalStrength: number;
  };
  lstmProof: {
    sequence: LSTMStep[];
    lossFunction: string;
    learningRate: number;
    epochsToConverge: number;
    finalGradient: number;
  };
  evidencePoints: string[];
  suggestedResources: { title: string; url: string }[];
  timelineData: { date: string; mentionCount: number }[];
}

export interface UserProfile {
  id: string;
  rank: string;
  lastLogin: string;
  totalScans: number;
  accuracyRating: number;
  membershipDate: string;
}

export interface DatasetMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: {
    tp: number;
    fp: number;
    tn: number;
    fn: number;
  };
}

export interface DatasetArticle {
  id: string;
  title: string;
  content: string;
  label: 'REAL' | 'FAKE';
}

export interface User {
  username: string;
  isLoggedIn: boolean;
  profile?: UserProfile;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
  result: AnalysisResult;
}

export interface TrendingArticle {
  id: string;
  title: string;
  source: string;
  category: string;
  timestamp: string;
  imageUrl: string;
  description: string;
  type: 'REAL' | 'FAKE' | 'CONTROVERSIAL';
}
