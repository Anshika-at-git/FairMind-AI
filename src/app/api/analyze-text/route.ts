import { NextResponse } from 'next/server';
import { ai } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const prompt = `Analyze the following text for potential bias (gender, racial, socioeconomic, cultural, occupational stereotype, etc.).
    
Text: "${text}"

Respond in pure JSON format with the following structure:
{
  "bias_detected": boolean,
  "bias_type": "gender" | "racial" | "socioeconomic" | "cultural" | "occupational" | "none",
  "confidence": number (0-100),
  "explanation": "Short human-readable explanation of why it is biased or why it is fair",
  "highlighted_text": "The specific phrase that is problematic (if any)",
  "suggested_fix": "An unbiased rewritten version of the text"
}`;

    // Fallback response for missing API key or demo purposes
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found. Using mock response.");
      return NextResponse.json({
        bias_detected: true,
        bias_type: "gender",
        confidence: 85,
        explanation: "The text implies that 'strong men' are the only demographic capable of being successful corporate leaders, which is a gender stereotype.",
        highlighted_text: "strong men who know how to command a room",
        suggested_fix: "The best leaders in the corporate world are strong individuals who know how to command a room."
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    const result = JSON.parse(resultText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in analyze-text:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
