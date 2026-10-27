import { GoogleGenAI, Modality } from "@google/genai";

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

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);

  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);

  pcmBuffer.copy(buffer, 44);
  return buffer;
}

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
    const { text, voice = "Kore", tone = "natural and clear" } = req.body || {};
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

    const allowedVoices = ["Kore", "Zephyr", "Puck", "Charon", "Fenrir"];
    const selectedVoice = allowedVoices.includes(voice) ? voice : "Kore";
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
      return res.status(500).json({ error: "No audio stream returned from Gemini TTS" });
    }

    const rawPcm = Buffer.from(base64Audio, "base64");
    const wavBuffer = pcmToWavBuffer(rawPcm, 24000, 1, 16);
    const wavBase64 = wavBuffer.toString("base64");

    return res.status(200).json({
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
      voice: selectedVoice,
      durationSec: Number((rawPcm.length / (24000 * 2)).toFixed(2)),
    });
  } catch (error: any) {
    console.error("Vercel TTS error:", error);
    return res.status(500).json({
      error: error?.message || "Failed to generate native speaker audio",
    });
  }
}
