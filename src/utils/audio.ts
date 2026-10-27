/**
 * Web Speech API helper for zero-latency client-side pronunciation
 */
export function speakWithWebSpeech(
  text: string,
  rate: number = 1.0,
  pitch: number = 1.0,
  onEnd?: () => void,
  onError?: (err: any) => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Try to pick a high quality English voice if available
  const voices = window.speechSynthesis.getVoices();
  const enVoice =
    voices.find((v) => v.lang === 'en-US' && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))) ||
    voices.find((v) => v.lang.startsWith('en'));

  if (enVoice) {
    utterance.voice = enVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
  }
  if (onError) {
    utterance.onerror = onError;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopWebSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Trigger download of audio blob/data URL
 */
export function downloadAudio(dataUrl: string, filename: string = 'native-pronunciation.wav') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
