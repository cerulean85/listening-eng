import React from 'react';
import { Volume2, Sparkles, BookOpen, Mic } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-sm">
            <Volume2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-stone-900 tracking-tight">
                Native English Pronunciation
              </h1>
              <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                원어민 발음 리더
              </span>
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">
              자연스러운 원어민 음성 · IPA 발음기호 · 연음 및 강세 분석
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-stone-600">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-medium">Gemini TTS Studio</span>
          </div>
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200">
            <Mic className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">섀도잉 녹음</span>
          </div>
        </div>
      </div>
    </header>
  );
};
