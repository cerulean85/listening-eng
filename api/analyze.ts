import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed (POST required)" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY environment variable is missing on Vercel. Please check Vercel Project Settings > Environment Variables.",
    });
  }

  try {
    const { text } = req.body || {};
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const systemPrompt = `You are an expert American English pronunciation coach and phonetician for Korean speakers.
Analyze the given English sentence or phrase thoroughly for accurate native pronunciation practice.
Return valid JSON matching the exact schema.
- ipa: Standard American IPA phonetic transcription for the full sentence with stress markers (ˈ, ˌ).
- koreanPronunciation: Natural Korean phonetic approximation showing real connected speech and assimilation (연음과 발음 변화를 반영한 자연스러운 한글 발음).
- translation: Accurate, natural Korean translation.
- level: CEFR level (e.g. A1, A2, B1, B2, C1).
- words: Array of individual words with word, IPA, koreanPhonetic, meaning (Korean), and stress indication.
- linkingTips: Array of practical tips on connected speech (연음, T-플래핑, 자음 탈락, 모음 축약 등) specific to this sentence.
- intonationTip: Detailed description of the intonation curve and rhythm (억양과 피치 변화: e.g. 상승조, 하강조, 방점 단어).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Sentence: "${text.trim()}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ipa: { type: Type.STRING },
            koreanPronunciation: { type: Type.STRING },
            translation: { type: Type.STRING },
            level: { type: Type.STRING },
            words: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  ipa: { type: Type.STRING },
                  koreanPhonetic: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  stress: { type: Type.STRING },
                },
                required: ["word", "ipa", "meaning"],
              },
            },
            linkingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            intonationTip: { type: Type.STRING },
          },
          required: [
            "ipa",
            "koreanPronunciation",
            "translation",
            "words",
            "linkingTips",
            "intonationTip",
          ],
        },
      },
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      return res.status(500).json({ error: "Empty response from Gemini analysis" });
    }

    const parsed = JSON.parse(jsonText);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Vercel Analyze error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to analyze pronunciation",
    });
  }
}
