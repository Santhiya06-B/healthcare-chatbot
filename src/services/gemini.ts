import { GoogleGenAI } from '@google/genai';

const getApiKey = () => {
  return (import.meta.env.VITE_GOOGLE_API_KEY as string) || '';
};

export const isApiKeyConfigured = () => {
  const key = getApiKey();
  return typeof key === 'string' && key.trim().length > 0 && !key.includes('your_api_key_here');
};

const SYSTEM_INSTRUCTION = `You are MediCare AI, an empathetic, professional, and knowledgeable healthcare assistant. 
Your goal is to provide helpful, evidence-based health information, explain medical concepts in easy-to-understand terms, suggest potential causes for symptoms, and recommend the appropriate type of medical specialist.

CRITICAL RULES:
1. Always include this disclaimer at the end of your response: "This chatbot provides informational guidance only and is not a substitute for professional medical advice."
2. If the user reports emergency symptoms (such as sudden chest pain, severe shortness of breath, sudden numbness or weakness in the face/arm/leg, sudden difficulty speaking, severe allergic reactions, or heavy bleeding), IMMEDIATELY and prominentely advise them to call emergency services (like 911) or visit the nearest emergency room.
3. Do not diagnose the user or prescribe specific medications/dosages. Instead, discuss possibilities and recommend consulting a healthcare provider.
4. Suggest practical, safe general health tips (e.g., hydration, rest, gentle movement) where applicable.
5. Format your responses beautifully using Markdown. Use bolding, bullet points, and headers to make the information clear and easy to read.`;

export async function askGemini(
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API Key is missing. Please add VITE_GOOGLE_API_KEY to your .env file.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Format conversations into standard role/parts structure
  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts.map((p) => ({ text: p.text })),
    })),
    {
      role: 'user',
      parts: [{ text: prompt }],
    },
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents as any,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    return response.text || 'I could not generate a response. Please try again.';
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to connect to MediCare AI server. Check your network or API key.');
  }
}
