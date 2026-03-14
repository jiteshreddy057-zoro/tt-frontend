import { GoogleGenAI } from '@google/genai';

const getAI = () => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) throw new Error('VITE_GEMINI_API_KEY is not set. Please add it to your .env file.');
    return new GoogleGenAI({ apiKey: key });
};

/**
 * AI Translation Assistant – refines a translation, explains grammar nuances,
 * and suggests more idiomatic alternatives.
 */
export async function refineTranslation({ sourceText, translatedText, sourceLang, targetLang }) {
    const ai = getAI();
    const prompt = `You are a world-class multilingual linguist. A user translated the following text:

SOURCE (${sourceLang}): "${sourceText}"
TRANSLATION (${targetLang}): "${translatedText}"

Please provide:
1. **Accuracy Check** – Is the translation accurate? Note any errors.
2. **Alternative Phrasing** – Suggest a more natural or idiomatic translation if applicable.
3. **Grammar Notes** – Briefly explain one or two key grammar rules used.

Keep your response concise (under 200 words). Use markdown formatting.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    });
    return response.text;
}

/**
 * AI Document Summarizer – summarizes long text into key bullet points.
 */
export async function summarizeText(text) {
    const ai = getAI();
    const prompt = `You are a precise document summariser. Summarize the following text into 3-5 concise bullet points that capture the key information. If the text is very short, just provide a one-line summary.

TEXT:
"""
${text}
"""

Provide only the summary, no preamble. Use markdown bullet points.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    });
    return response.text;
}
