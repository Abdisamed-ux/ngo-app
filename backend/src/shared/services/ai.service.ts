// src/shared/services/ai.service.ts
import { UrgencyLevel } from '@prisma/client';

export interface AIAnalysisResult {
  urgencyScore: number; // 1-100
  suggestedUrgency: UrgencyLevel;
  summary: string;
}

/**
 * Mock AI Service that uses keyword heuristics to simulate an LLM analyzing the description.
 * In a real-world scenario, this would call OpenAI or Google Gemini.
 */
export const analyzeAidRequest = async (description: string): Promise<AIAnalysisResult> => {
  const text = description.toLowerCase();
  
  // Keyword dictionaries
  const criticalKeywords = ['emergency', 'starving', 'die', 'dying', 'urgent medical', 'homeless', 'disaster', 'immediate', 'life threatening', 'surgery'];
  const highKeywords = ['sick', 'ill', 'hospital', 'injury', 'eviction', 'no food', 'hungry', 'pain', 'disease'];
  const mediumKeywords = ['rent', 'bills', 'school', 'tuition', 'debts', 'unemployed', 'jobless', 'repair'];
  const lowKeywords = ['business', 'startup', 'travel', 'event', 'wedding', 'clothing', 'shoes'];

  // Score base
  let score = 30; // Base score
  let matchCategory: UrgencyLevel = 'LOW';

  // Check critical
  if (criticalKeywords.some(kw => text.includes(kw))) {
    score = Math.floor(Math.random() * 15) + 85; // 85-100
    matchCategory = 'CRITICAL';
  } else if (highKeywords.some(kw => text.includes(kw))) {
    score = Math.floor(Math.random() * 15) + 70; // 70-84
    matchCategory = 'HIGH';
  } else if (mediumKeywords.some(kw => text.includes(kw))) {
    score = Math.floor(Math.random() * 20) + 40; // 40-59
    matchCategory = 'MEDIUM';
  } else if (lowKeywords.some(kw => text.includes(kw))) {
    score = Math.floor(Math.random() * 20) + 10; // 10-29
    matchCategory = 'LOW';
  }

  // Generate a mock summary
  let summary = '';
  switch (matchCategory) {
    case 'CRITICAL':
      summary = '🤖 AI Summary: This request indicates a severe emergency requiring immediate intervention. Keywords suggest immediate risk to life or shelter.';
      break;
    case 'HIGH':
      summary = '🤖 AI Summary: High priority case. Beneficiary is experiencing significant distress (e.g., medical or food insecurity) but not immediately life-threatening.';
      break;
    case 'MEDIUM':
      summary = '🤖 AI Summary: Moderate priority. The request is primarily financial (e.g., rent, utilities, or education) without immediate physical danger.';
      break;
    case 'LOW':
      summary = '🤖 AI Summary: Low priority. The request appears to be for secondary needs, business, or lifestyle assistance rather than survival.';
      break;
  }

  // Simulate network delay of an LLM call (1.5 seconds)
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    urgencyScore: score,
    suggestedUrgency: matchCategory,
    summary,
  };
};
