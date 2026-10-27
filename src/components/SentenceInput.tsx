import React from 'react';
import { Sparkles, Trash2, Clipboard, ArrowRight } from 'lucide-react';
import { PRESET_SENTENCES } from '../data/presets';
import { PresetSentence } from '../types';

interface SentenceInputProps {
  value: string;
  onChange: (text: string) => void;
  onSpeak: () => void;
  isLoading: boolean;
  onSelectPreset: (preset: PresetSentence) => void;
}

export const SentenceInput: React.FC<SentenceInputProps> = ({
  value,
  onChange,
  onSpeak,
  isLoading,
  onSelectPreset,
}) => {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch (err) {
      console.warn('Could not read clipboard', err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <label
          htmlFor="sentence-input"
          className="text-sm font-semibold text-stone-900 flex items-center space-x-1.5"
        >
          <span>영어 문장 입력</span>
          <span className="text-xs font-normal text-stone-500">
            (문장이나 단어를 입력하세요)
          </span>
        </label>
        <div className="flex items-center space-x-2 text-xs text-stone-500">
          <button
            type="button"
            onClick={handlePaste}
            className="hover:text-stone-900 flex items-center space-x-1 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
            title="클립보드 붙여넣기"
          >
            <Clipboard className="w-3.5 h-3.5" />
            <span>붙여넣기</span>
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="hover:text-rose-600 flex items-center space-x-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
              title="내용 비우기"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>지우기</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <textarea
          id="sentence-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              if (value.trim() && !isLoading) {
                onSpeak();
              }
            }
          }}
          placeholder="Type or paste any English sentence here... (e.g., Could you check it out for a second?)"
          rows={3}
          className="w-full px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 bg-stone-50/50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-y min-h-[90px] font-sans leading-relaxed"
        />
        <div className="flex items-center justify-between mt-1 text-xs text-stone-400 px-1">
          <span>Ctrl + Enter 키로 바로 재생</span>
          <span>
            {wordCount} 단어 · {charCount} 글자
          </span>
        </div>
      </div>

      {/* Preset recommendations */}
      <div className="pt-2 border-t border-stone-100 space-y-2">
        <div className="flex items-center space-x-1.5 text-xs text-stone-500 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>추천 발음 훈련 문장</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SENTENCES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-stone-200 text-stone-700 transition-all text-left flex items-center space-x-1.5 group"
            >
              <span className="text-[10px] font-semibold text-stone-500 group-hover:text-amber-700 px-1 py-0.2 rounded bg-white border border-stone-200">
                {preset.category}
              </span>
              <span className="font-medium truncate max-w-[200px] sm:max-w-none">
                {preset.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
