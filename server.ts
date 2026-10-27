import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Lazy-initialized or standard Gemini client
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper: Convert raw 16-bit Mono PCM (24kHz) to standard WAV buffer
function pcmToWavBuffer(
  pcmBuffer: Buffer,
  sampleRate: number = 24000,
  numChannels: number = 1,
  bitsPerSample: number = 16
): Buffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataLength = pcmBuffer.length;
  const buffer = Buffer.alloc(44 + dataLength);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);

  // "fmt " sub-chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // 16 for PCM
  buffer.writeUInt16LE(1, 20); // 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // "data" sub-chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Text-To-Speech with Gemini Native Voice
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Kore", tone = "natural and clear" } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const ai = getAiClient();
    const allowedVoices = ["Kore", "Zephyr", "Puck", "Charon", "Fenrir"];
    const selectedVoice = allowedVoices.includes(voice) ? voice : "Kore";

    // Instruct Gemini TTS to enunciate cleanly with native American accent
    const promptText = `Speak in a pristine, natural native English accent (${tone}): ${text.trim()}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: promptText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(500).json({ error: "No audio stream returned from Gemini TTS" });
      return;
    }

    const rawPcm = Buffer.from(base64Audio, "base64");
    const wavBuffer = pcmToWavBuffer(rawPcm, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");

    res.json({
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
      voice: selectedVoice,
      durationSec: Number((rawPcm.length / (24000 * 2)).toFixed(2)),
    });
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate native speaker audio",
    });
  }
});

// Sentence Analysis: IPA, linking sounds, Korean phonetic, intonation & breakdown
app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Text is required" });
      return;
    }

    const ai = getAiClient();
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
      res.status(500).json({ error: "Empty response from Gemini analysis" });
      return;
    }

    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/analyze:", error);
    res.status(500).json({
      error: error?.message || "Failed to analyze pronunciation",
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for serverless environments (e.g. Vercel)
export default app;

if (!process.env.VERCEL) {
  startServer();
}
