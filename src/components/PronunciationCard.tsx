import React, { useState } from 'react';
import {
  Volume2,
  Sparkles,
  BookOpen,
  Info,
  Copy,
  Check,
  Music,
  ArrowRight,
} from 'lucide-react';
import { SentenceAnalysis, WordAnalysis } from '../types';
import { speakWithWebSpeech } from '../utils/audio';

interface PronunciationCardProps {
  analysis: SentenceAnalysis | null;
  isLoading: boolean;
  originalText: string;
  onAnalyze: () => void;
}

export const PronunciationCard: React.FC<PronunciationCardProps> = ({
  analysis,
  isLoading,
  originalText,
  onAnalyze,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeWord, setActiveWord] = useState<WordAnalysis | null>(null);

  const handleCopyIpa = () => {
    if (analysis?.ipa) {
      navigator.clipboard.writeText(analysis.ipa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlayWord = (word: WordAnalysis) => {
    setActiveWord(word);
    speakWithWebSpeech(word.word, 0.9);
  };

  if (!analysis && !isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-stone-800">
            상세 발음 분석 및 연음 가이드
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            문장의 국제 음성 기호(IPA), 한국인 맞춤 한글 독음, 연음(Linking)과
            강세 규칙을 AI로 분석해보세요.
          </p>
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!originalText.trim()}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-amber-500 hover:text-white text-stone-700 text-xs font-semibold transition-all disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>발음 기호 & 연음 분석하기</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-stone-800">
            원어민 발음 기호 및 연음 분석 중...
          </p>
          <p className="text-xs text-stone-400">
            국제 음성 기호(IPA), 강세, 억양 곡선을 정밀 분석하고 있습니다
          </p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-6">
      {/* Top Banner: IPA & Korean Pronunciation */}
      <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
              IPA 발음 기호
            </span>
            {analysis.level && (
              <span className="text-[11px] font-semibold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded">
                난이도: {analysis.level}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCopyIpa}
            className="text-xs text-stone-500 hover:text-stone-900 flex items-center space-x-1"
            title="IPA 복사"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>복사</span>
              </>
            )}
          </button>
        </div>

        {/* IPA text */}
        <p className="font-mono text-base sm:text-lg text-stone-900 tracking-wide font-medium">
          {analysis.ipa}
        </p>

        {/* Korean Phonetic Assimilation */}
        <div className="pt-2 border-t border-stone-200/60 flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 gap-1">
          <span className="text-xs font-semibold text-stone-500 shrink-0">
            자연스러운 한글 독음:
          </span>
          <span className="text-sm font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 inline-block">
            {analysis.koreanPronunciation}
          </span>
        </div>

        {/* Translation */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 gap-1 text-xs text-stone-600">
          <span className="font-semibold text-stone-500 shrink-0">한국어 번역:</span>
          <span>{analysis.translation}</span>
        </div>
      </div>

      {/* Interactive Word Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
            <span>단어별 개별 발음 및 강세</span>
            <span className="text-[11px] font-normal text-stone-400">
              (단어를 클릭하면 개별 발음을 듣습니다)
            </span>
          </h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {analysis.words.map((item, idx) => {
            const isActive = activeWord?.word === item.word;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handlePlayWord(item)}
                className={`group px-3 py-2 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-900 border-stone-200'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-sm">{item.word}</span>
                  <Volume2
                    className={`w-3.5 h-3.5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-stone-400'
                    }`}
                  />
                </div>
                <div
                  className={`font-mono text-[11px] ${
                    isActive ? 'text-amber-100' : 'text-stone-500'
                  }`}
                >
                  {item.ipa}
                </div>
                <div
                  className={`text-[11px] ${
                    isActive ? 'text-white/90' : 'text-stone-600'
                  }`}
                >
                  {item.meaning}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Linking Sound & Connected Speech Tips */}
      {analysis.linkingTips && analysis.linkingTips.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>원어민 연음 및 발음 변화 법칙 (Connected Speech)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {analysis.linkingTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start space-x-2"
              >
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Intonation & Rhythm Guide */}
      {analysis.intonationTip && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-900 flex items-start space-x-2.5">
          <Music className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">억양 & 리듬 가이드 (Intonation):</span>
            <p className="leading-relaxed text-blue-800">
              {analysis.intonationTip}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
