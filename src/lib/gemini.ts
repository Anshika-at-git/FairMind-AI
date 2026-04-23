import { GoogleGenAI } from '@google/genai';

// Initialize the GenAI client
// Automatically uses process.env.GEMINI_API_KEY
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

// Function to analyze bias
export async function analyzeTextBias(text: string) {
  const prompt = `
You are an AI fairness auditor.

Analyze the following text for bias.

Return ONLY valid JSON:
{
  "bias_detected": true/false,
  "bias_type": "",
  "confidence": number (0-100),
  "explanation": "",
  "highlighted_text": "",
  "suggested_fix": ""
}

Text: "${text}"
`;

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  
  const response = result.text;

  // Extract JSON safely
  if (!response) return null;
  const match = response.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : null;
}