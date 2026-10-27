import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2, User, Sparkles } from 'lucide-react';

interface ShadowingStudioProps {
  sentence: string;
  onPlayNative: () => void;
  isNativePlaying: boolean;
}

export const ShadowingStudio: React.FC<ShadowingStudioProps> = ({
  sentence,
  onPlayNative,
  isNativePlaying,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
    };
  }, [recordedAudioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Stop all tracks on stream
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone', err);
      setHasMicPermission(false);
      alert('마이크 접근 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecordedAudio = () => {
    if (!recordedAudioUrl) return;

    if (!userAudioRef.current) {
      userAudioRef.current = new Audio(recordedAudioUrl);
      userAudioRef.current.onended = () => setIsPlayingRecording(false);
    } else {
      userAudioRef.current.src = recordedAudioUrl;
    }

    setIsPlayingRecording(true);
    userAudioRef.current.play();
  };

  const stopRecordedAudio = () => {
    if (userAudioRef.current) {
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
      setIsPlayingRecording(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              섀도잉(Shadowing) 발음 훈련 스튜디오
            </h3>
            <p className="text-xs text-stone-500">
              원어민 발음을 듣고 따라 말하며 내 목소리를 녹음해 직접 비교해보세요.
            </p>
          </div>
        </div>
      </div>

      {/* Target sentence display */}
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm font-medium text-stone-800">
        "{sentence || '연습할 문장을 먼저 입력해주세요.'}"
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Step 1: Listen Native */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onPlayNative}
            disabled={!sentence || isRecording}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all disabled:opacity-40"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>{isNativePlaying ? '원어민 재생 중...' : '1. 원어민 발음 듣기'}</span>
          </button>
        </div>

        {/* Step 2: Record User */}
        <div className="flex items-center space-x-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!sentence || isNativePlaying}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-40"
            >
              <Mic className="w-4 h-4" />
              <span>2. 내 발음 녹음 시작</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>녹음 완료 ({recordDuration}초)</span>
            </button>
          )}

          {/* Step 3: Play Recorded Audio */}
          {recordedAudioUrl && !isRecording && (
            <div className="flex items-center space-x-1.5">
              {!isPlayingRecording ? (
                <button
                  type="button"
                  onClick={playRecordedAudio}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
                  <span>3. 내 녹음 듣기</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecordedAudio}
                  className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>내 녹음 정지</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {recordedAudioUrl && (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-emerald-700" />
            <span>
              녹음이 완료되었습니다! <strong>원어민 발음</strong>과 <strong>내 녹음</strong>을 번갈아 들어보며
              억양과 끊어 읽기를 교정해보세요.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setRecordedAudioUrl(null);
              setRecordDuration(0);
            }}
            className="text-emerald-700 hover:text-emerald-900 font-semibold underline shrink-0 ml-2"
          >
            다시 녹음하기
          </button>
        </div>
      )}
    </div>
  );
};
