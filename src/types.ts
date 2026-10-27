export interface WordAnalysis {
  word: string;
  ipa: string;
  koreanPhonetic?: string;
  meaning: string;
  stress?: string;
}

export interface SentenceAnalysis {
  ipa: string;
  koreanPronunciation: string;
  translation: string;
  level?: string;
  words: WordAnalysis[];
  linkingTips: string[];
  intonationTip: string;
}

export type NativeVoice = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export interface VoiceOption {
  id: NativeVoice;
  name: string;
  gender: 'Female' | 'Male';
  accent: string;
  description: string;
  tags: string[];
}

export interface PresetSentence {
  category: string;
  text: string;
  translation: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  focus: string;
}
