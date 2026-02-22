
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TrendingArticle } from "../types";

const MAX_RETRIES = 1;
const INITIAL_RETRY_DELAY = 1000;

let trendsCache: { data: TrendingArticle[], timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; 

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callWithRetry = async <T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error.message?.toLowerCase() || "";
    const isQuotaError = error.status === 429 || errorMsg.includes('429') || errorMsg.includes('quota');
    
    if (isQuotaError) throw new Error("QUOTA_EXCEEDED");
    if (retries > 0 && (error.status === 500 || errorMsg.includes('500'))) {
      await sleep(INITIAL_RETRY_DELAY);
      return callWithRetry(fn, retries - 1);
    }
    throw error;
  }
};

// High-quality, verified news-themed Unsplash IDs for guaranteed loading
const NEWS_PHOTO_IDS = [
  "1504711432869-efd5571694b9", // Newspaper desk
  "1495020689067-958852a7765e", // Journalism typing
  "1585829365294-110034a761e8", // News studio
  "1516321497487-e288fb19713f", // Digital verification
  "1451187580459-43490279c0fa", // Global data network
  "1526628953301-3e589a6a1bae", // Analytics screen
  "1485827404703-89b55fcc595e", // AI/Robotics news
  "1508921340878-ba53e1f016ec"  // Mobile news reading
];

const getSecureNewsImage = (index?: number) => {
  const id = index !== undefined ? NEWS_PHOTO_IDS[index % NEWS_PHOTO_IDS.length] : NEWS_PHOTO_IDS[Math.floor(Math.random() * NEWS_PHOTO_IDS.length)];
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=95&w=1920&h=1080`;
};

export const analyzeNewsArticle = async (title: string, content: string): Promise<AnalysisResult> => {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform high-fidelity forensic analysis for news authenticity. 
      Use Google Search to verify claims and check for corroborating or debunking sources.
      
      TITLE: ${title}
      BODY: ${content.substring(0, 3000)}

      Analyze linguistic patterns and simulate a neural forensic sweep. 
      Output exactly 12 tokens in 'lstmProof.sequence'. 
      Provide realistic gate values (0.0-1.0) and weights.
      In 'visualMetadata', provide a 'suggestedPhotoQuery' reflecting the core subject.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            category: { type: Type.STRING },
            summary: { type: Type.STRING },
            visualMetadata: {
              type: Type.OBJECT,
              properties: {
                suggestedPhotoQuery: { type: Type.STRING },
                imageClarityScore: { type: Type.NUMBER }
              },
              required: ["suggestedPhotoQuery"]
            },
            linguisticPatterns: {
              type: Type.OBJECT,
              properties: {
                clickbaitFactor: { type: Type.NUMBER },
                emotionalIntensity: { type: Type.NUMBER },
                biasScore: { type: Type.NUMBER },
                sourceReliability: { type: Type.NUMBER }
              }
            },
            visualIndicators: {
              type: Type.OBJECT,
              properties: {
                batteryLevel: { type: Type.NUMBER },
                signalStrength: { type: Type.NUMBER }
              }
            },
            lstmProof: {
              type: Type.OBJECT,
              properties: {
                sequence: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      token: { type: Type.STRING },
                      forgetGate: { type: Type.NUMBER },
                      inputGate: { type: Type.NUMBER },
                      outputGate: { type: Type.NUMBER },
                      cellState: { type: Type.NUMBER },
                      hiddenState: { type: Type.NUMBER },
                      weight: { type: Type.NUMBER }
                    }
                  }
                },
                lossFunction: { type: Type.STRING },
                learningRate: { type: Type.NUMBER },
                epochsToConverge: { type: Type.NUMBER },
                finalGradient: { type: Type.NUMBER }
              }
            },
            evidencePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedResources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              }
            },
            timelineData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  mentionCount: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["score", "category", "summary", "lstmProof", "visualIndicators", "evidencePoints", "suggestedResources", "visualMetadata"]
        }
      }
    });

    const parsed = JSON.parse(response.text) as AnalysisResult;
    // Map the result to a guaranteed loading image
    parsed.imageUrl = getSecureNewsImage();
    return parsed;
  });
};

export const getTrendingNews = async (): Promise<TrendingArticle[]> => {
  const now = Date.now();
  if (trendsCache && (now - trendsCache.timestamp < CACHE_DURATION)) {
    return trendsCache.data;
  }

  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate 8 realistic current global news headlines and descriptions. Use REAL, FAKE, and CONTROVERSIAL labels.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              source: { type: Type.STRING },
              category: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING }
            }
          }
        }
      }
    });

    const raw = JSON.parse(response.text) as any[];
    const result = raw.map((item, idx) => ({
      ...item,
      imageUrl: getSecureNewsImage(idx)
    }));

    trendsCache = { data: result, timestamp: now };
    return result;
  });
};
