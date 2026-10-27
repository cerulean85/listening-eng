import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { SentenceInput } from './components/SentenceInput';
import { VoiceControls } from './components/VoiceControls';
import { PronunciationCard } from './components/PronunciationCard';
import { ShadowingStudio } from './components/ShadowingStudio';
import { HistoryList, HistoryItem } from './components/HistoryList';
import { NativeVoice, SentenceAnalysis, PresetSentence } from './types';
import { speakWithWebSpeech, stopWebSpeech, downloadAudio } from './utils/audio';
import { AlertCircle, CheckCircle2, Sparkles, Mic2 } from 'lucide-react';

const DEFAULT_SENTENCE = 'Could you check it out for a second?';

export default function App() {
  const [text, setText] = useState<string>(DEFAULT_SENTENCE);
  const [selectedVoice, setSelectedVoice] = useState<NativeVoice>('Kore');
  const [speed, setSpeed] = useState<number>(1.0);
  const [tone, setTone] = useState<string>('natural and clear');
  const [engine, setEngine] = useState<'gemini' | 'browser'>('gemini');

  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [repeatCount, setRepeatCount] = useState<number>(1);
  const [currentRepeatIndex, setCurrentRepeatIndex] = useState<number>(0);

  // Analysis State
  const [analysis, setAnalysis] = useState<SentenceAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pronunciation_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const repeatCountRef = useRef(repeatCount);
  const currentRepeatIndexRef = useRef(currentRepeatIndex);
  const isPlayingRef = useRef(isPlaying);

  repeatCountRef.current = repeatCount;
  currentRepeatIndexRef.current = currentRepeatIndex;
  isPlayingRef.current = isPlaying;

  // Initialize HTML audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleEnded = () => {
      if (currentRepeatIndexRef.current + 1 < repeatCountRef.current) {
        currentRepeatIndexRef.current += 1;
        setCurrentRepeatIndex(currentRepeatIndexRef.current);
        audio.currentTime = 0;
        audio.playbackRate = speed;
        setTimeout(() => {
          if (isPlayingRef.current) {
            audio.play().catch(console.error);
          }
        }, 300);
      } else {
        setIsPlaying(false);
        setCurrentRepeatIndex(0);
        currentRepeatIndexRef.current = 0;
      }
    };

    const handleError = (e: any) => {
      console.error('Audio playback error', e);
      setIsPlaying(false);
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [speed]);

  // Adjust playback rate when speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  // Add to history
  const addToHistory = useCallback((sentence: string) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.text !== trimmed);
      const updated = [
        {
          id: String(Date.now()),
          text: trimmed,
          date: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
        ...filtered,
      ].slice(0, 15);
      try {
        localStorage.setItem('pronunciation_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
      return updated;
    });
  }, []);

  // Stop any active audio
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    stopWebSpeech();
    setIsPlaying(false);
    setCurrentRepeatIndex(0);
    currentRepeatIndexRef.current = 0;
  };

  // Play audio using Web Speech API (with repeat loop)
  const playWebSpeechLoop = useCallback(
    (targetText: string, currentIteration: number, maxIterations: number) => {
      setIsPlaying(true);
      setCurrentRepeatIndex(currentIteration);
      currentRepeatIndexRef.current = currentIteration;

      speakWithWebSpeech(
        targetText,
        speed,
        1.0,
        () => {
          if (currentIteration + 1 < maxIterations && isPlayingRef.current) {
            setTimeout(() => {
              playWebSpeechLoop(targetText, currentIteration + 1, maxIterations);
            }, 300);
          } else {
            setIsPlaying(false);
            setCurrentRepeatIndex(0);
            currentRepeatIndexRef.current = 0;
          }
        },
        (err) => {
          console.error('Web Speech error', err);
          setIsPlaying(false);
        }
      );
    },
    [speed]
  );

  // Analyze Sentence
  const handleAnalyze = async (targetText: string = text) => {
    if (!targetText.trim()) return;
    setIsLoadingAnalysis(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: targetText.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '발음 분석 요청에 실패했습니다.');
      }

      const data: SentenceAnalysis = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      console.warn('Analysis error:', err);
      // If error occurs, do not block TTS
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Main Play Action
  const handlePlay = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    handleStop();
    setErrorMessage(null);
    addToHistory(trimmed);

    // If browser speech selected
    if (engine === 'browser') {
      playWebSpeechLoop(trimmed, 0, repeatCount);
      return;
    }

    // Gemini AI TTS Voice
    setIsLoadingAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: trimmed,
          voice: selectedVoice,
          tone,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '음성 생성 요청에 실패했습니다.');
      }

      const data = await res.json();
      if (!data.audioUrl) {
        throw new Error('음성 데이터가 반환되지 않았습니다.');
      }

      setAudioUrl(data.audioUrl);

      if (audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.playbackRate = speed;
        currentRepeatIndexRef.current = 0;
        setCurrentRepeatIndex(0);
        setIsPlaying(true);
        await audioRef.current.play();
      }
    } catch (err: any) {
      console.error('Gemini TTS error:', err);
      setErrorMessage(
        `${err.message || 'AI 음성 생성에 실패했습니다.'} 즉시 재생(Web Speech)으로 재생합니다.`
      );
      // Fallback to Web Speech immediately so user still hears it!
      playWebSpeechLoop(trimmed, 0, repeatCount);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleReplay = () => {
    if (engine === 'browser') {
      handlePlay();
    } else if (audioUrl && audioRef.current) {
      handleStop();
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = speed;
      currentRepeatIndexRef.current = 0;
      setCurrentRepeatIndex(0);
      setIsPlaying(true);
      audioRef.current.play().catch(console.error);
    } else {
      handlePlay();
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const filename = `native-pronunciation-${selectedVoice.toLowerCase()}.wav`;
      downloadAudio(audioUrl, filename);
    }
  };

  const handleSelectPreset = (preset: PresetSentence) => {
    setText(preset.text);
    setAudioUrl(null);
    handleStop();
    // Pre-populate or trigger analysis
    handleAnalyze(preset.text);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('pronunciation_history');
    } catch {}
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('pronunciation_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Run initial analysis once on mount for the default sentence
  useEffect(() => {
    handleAnalyze(DEFAULT_SENTENCE);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-200 selection:text-stone-900">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start space-x-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">안내: </span>
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-amber-700 hover:text-amber-900 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Sentence Input Area */}
        <SentenceInput
          value={text}
          onChange={(newVal) => {
            setText(newVal);
            if (audioUrl) setAudioUrl(null);
          }}
          onSpeak={handlePlay}
          isLoading={isLoadingAudio}
          onSelectPreset={handleSelectPreset}
        />

        {/* 2. Voice & Playback Controls */}
        <VoiceControls
          selectedVoice={selectedVoice}
          onSelectVoice={(v) => {
            setSelectedVoice(v);
            if (audioUrl) setAudioUrl(null);
          }}
          speed={speed}
          onChangeSpeed={setSpeed}
          engine={engine}
          onChangeEngine={setEngine}
          isPlaying={isPlaying}
          isLoading={isLoadingAudio}
          onPlay={handlePlay}
          onStop={handleStop}
          onReplay={handleReplay}
          audioUrl={audioUrl}
          onDownload={handleDownload}
          repeatCount={repeatCount}
          onChangeRepeatCount={setRepeatCount}
          currentRepeatIndex={currentRepeatIndex}
          tone={tone}
          onChangeTone={(t) => {
            setTone(t);
            if (audioUrl) setAudioUrl(null);
          }}
        />

        {/* 3. Detailed Pronunciation & Connected Speech Breakdown */}
        <PronunciationCard
          analysis={analysis}
          isLoading={isLoadingAnalysis}
          originalText={text}
          onAnalyze={() => handleAnalyze(text)}
        />

        {/* 4. Shadowing Practice Studio */}
        <ShadowingStudio
          sentence={text}
          onPlayNative={handlePlay}
          isNativePlaying={isPlaying}
        />

        {/* 5. Practice History */}
        <HistoryList
          history={history}
          onSelect={(historicText) => {
            setText(historicText);
            setAudioUrl(null);
            handleAnalyze(historicText);
          }}
          onClear={handleClearHistory}
          onDelete={handleDeleteHistoryItem}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-stone-500 space-y-1">
          <p className="font-medium text-stone-700">
            Native English Pronunciation Reader (원어민 영어 발음 리더기)
          </p>
          <p>
            Powered by Gemini TTS & Phonetic Analysis · 미국식 표준 발음 및 섀도잉
            학습
          </p>
        </div>
      </footer>
    </div>
  );
}
