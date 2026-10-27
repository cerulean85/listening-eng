import React from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Volume2,
  Download,
  Gauge,
  Sliders,
  Sparkles,
  Zap,
  Repeat,
} from 'lucide-react';
import { NativeVoice } from '../types';
import { VOICE_OPTIONS } from '../data/presets';

interface VoiceControlsProps {
  selectedVoice: NativeVoice;
  onSelectVoice: (voice: NativeVoice) => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  engine: 'gemini' | 'browser';
  onChangeEngine: (engine: 'gemini' | 'browser') => void;
  isPlaying: boolean;
  isLoading: boolean;
  onPlay: () => void;
  onStop: () => void;
  onReplay: () => void;
  audioUrl: string | null;
  onDownload: () => void;
  repeatCount: number;
  onChangeRepeatCount: (count: number) => void;
  currentRepeatIndex: number;
  tone: string;
  onChangeTone: (tone: string) => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  selectedVoice,
  onSelectVoice,
  speed,
  onChangeSpeed,
  engine,
  onChangeEngine,
  isPlaying,
  isLoading,
  onPlay,
  onStop,
  onReplay,
  audioUrl,
  onDownload,
  repeatCount,
  onChangeRepeatCount,
  currentRepeatIndex,
  tone,
  onChangeTone,
}) => {
  const speeds = [0.5, 0.75, 1.0, 1.25];
  const repeats = [1, 3, 5];
  const tones = [
    { label: '자연스럽고 명확한 발음', value: 'natural and clear' },
    { label: '활기찬 일상 대화체', value: 'cheerful and casual' },
    { label: '또박또박 느린 발음', value: 'slow and clearly articulated' },
    { label: '격식 있는 프레젠테이션', value: 'formal presentation style' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-5">
      {/* Engine Selection & Primary Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            발음 엔진
          </span>
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200">
            <button
              type="button"
              onClick={() => onChangeEngine('gemini')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                engine === 'gemini'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI 원어민 음성 (Gemini)</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeEngine('browser')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                engine === 'browser'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>즉시 재생 (Web Speech)</span>
            </button>
          </div>
        </div>

        {/* Tone Selector (for Gemini) */}
        {engine === 'gemini' && (
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={tone}
              onChange={(e) => onChangeTone(e.target.value)}
              className="text-xs font-medium text-stone-700 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {tones.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Voice Selection Cards */}
      {engine === 'gemini' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-700">
              원어민 화자 선택 (5가지 스타일)
            </span>
            <span className="text-[11px] text-stone-400">
              선택한 화자: {selectedVoice}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {VOICE_OPTIONS.map((voice) => {
              const isSelected = selectedVoice === voice.id;
              return (
                <button
                  key={voice.id}
                  type="button"
                  onClick={() => onSelectVoice(voice.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500/20 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/70 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-stone-900">
                      {voice.name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        voice.gender === 'Female'
                          ? 'bg-rose-100/70 text-rose-800'
                          : 'bg-blue-100/70 text-blue-800'
                      }`}
                    >
                      {voice.gender === 'Female' ? '여성' : '남성'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-snug">
                    {voice.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {voice.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-medium text-stone-500 bg-stone-100 px-1 py-0.2 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Playback Controls & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Main Action Buttons */}
        <div className="flex items-center space-x-2">
          {!isPlaying ? (
            <button
              type="button"
              onClick={onPlay}
              disabled={isLoading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 active:scale-98 transition-all disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-amber-300 text-amber-300" />
              )}
              <span>{isLoading ? '음성 생성 중...' : '원어민 발음 듣기'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStop}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 active:scale-98 transition-all shadow-sm"
            >
              <Square className="w-4 h-4 fill-white text-white" />
              <span>정지</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReplay}
            disabled={isLoading || isPlaying}
            className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-40"
            title="다시 듣기"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {audioUrl && (
            <button
              type="button"
              onClick={onDownload}
              className="p-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 transition-colors"
              title="음성 파일 (WAV) 다운로드"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Wave visualizer indicator when playing */}
          {isPlaying && (
            <div className="flex items-center space-x-1 pl-2">
              <span className="w-1 h-3 bg-amber-500 rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-amber-500 rounded-full animate-pulse delay-75" />
              <span className="w-1 h-2 bg-amber-500 rounded-full animate-pulse delay-150" />
              <span className="w-1 h-4 bg-amber-500 rounded-full animate-pulse delay-100" />
            </div>
          )}
        </div>

        {/* Speed & Shadowing Repeat Count */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Repeat Counter */}
          <div className="flex items-center space-x-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xl">
            <Repeat className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-xs font-medium text-stone-600">반복:</span>
            <div className="flex items-center space-x-1">
              {repeats.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onChangeRepeatCount(count)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                    repeatCount === count
                      ? 'bg-white shadow-xs text-stone-900 border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {count}회
                </button>
              ))}
            </div>
            {repeatCount > 1 && isPlaying && (
              <span className="text-[11px] font-bold text-amber-600 pl-1">
                ({currentRepeatIndex + 1}/{repeatCount})
              </span>
            )}
          </div>

          {/* Speed Selector */}
          <div className="flex items-center space-x-1.5 bg-stone-50 border border-stone-200 px-2.5 py-1.5 rounded-xl">
            <Gauge className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-xs font-medium text-stone-600">속도:</span>
            <div className="flex items-center space-x-1">
              {speeds.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onChangeSpeed(s)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                    speed === s
                      ? 'bg-white shadow-xs text-amber-700 border border-amber-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {s === 0.75 ? '0.75x (학습)' : `${s}x`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
