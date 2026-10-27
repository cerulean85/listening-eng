import { VoiceOption, PresetSentence } from '../types';

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore (코어)',
    gender: 'Female',
    accent: 'Standard American',
    description: '명확하고 정확한 발음의 표준 미국 여성 음성 (학습 및 섀도잉 최적)',
    tags: ['추천', '표준 발음', '선명함'],
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (제피르)',
    gender: 'Female',
    accent: 'Natural US Casual',
    description: '부드럽고 자연스러운 대화톤의 미국 여성 음성',
    tags: ['자연스러움', '일상 대화'],
  },
  {
    id: 'Charon',
    name: 'Charon (카론)',
    gender: 'Male',
    accent: 'Deep American',
    description: '안정감 있고 신뢰감 있는 중저음의 미국 남성 음성',
    tags: ['중저음', '비즈니스'],
  },
  {
    id: 'Puck',
    name: 'Puck (퍽)',
    gender: 'Male',
    accent: 'Energetic US',
    description: '활기차고 억양이 뚜렷한 미국 남성 음성',
    tags: ['생생함', '억양 강조'],
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (펜리르)',
    gender: 'Male',
    accent: 'Articulate Male',
    description: '또박또박 끊어 읽어주는 차분한 미국 남성 음성',
    tags: ['또박또박', '차분함'],
  },
];

export const PRESET_SENTENCES: PresetSentence[] = [
  {
    category: '연음 & 플랩 현상',
    text: 'Could you check it out for a second?',
    translation: '잠깐 그것 좀 확인해 줄 수 있어?',
    difficulty: 'Intermediate',
    focus: 'check it out [체키다웃] 연음 & Flap T',
  },
  {
    category: '일상 필수 표현',
    text: "I'll let you know as soon as possible.",
    translation: '가능한 한 빨리 알려드릴게요.',
    difficulty: 'Beginner',
    focus: 'let you [레츄], as soon as [애즈 수내즈]',
  },
  {
    category: '축약 & 구어체',
    text: 'What are you going to do this weekend?',
    translation: '이번 주말에 뭐 할 거야?',
    difficulty: 'Intermediate',
    focus: 'What are you gonna do [와러유 거너 두]',
  },
  {
    category: '비즈니스 영어',
    text: 'Could you please walk me through the key highlights of the proposal?',
    translation: '제안서의 주요 핵심 내용을 설명해 주시겠어요?',
    difficulty: 'Advanced',
    focus: 'walk me through [워크 미 뜨루] 프레이징 & 강세',
  },
  {
    category: '발음 훈련 (혀 꼬임)',
    text: 'Peter Piper picked a peck of pickled peppers.',
    translation: '피터 파이퍼가 절인 고추 한 통을 땄다.',
    difficulty: 'Advanced',
    focus: 'P 사운드 파열음 및 리듬 훈련',
  },
  {
    category: '강세 & 억양',
    text: "It's not about what you say, but how you say it.",
    translation: '중요한 건 당신이 무엇을 말하느냐가 아니라 어떻게 말하느냐이다.',
    difficulty: 'Intermediate',
    focus: 'what / how 대조 강조 억양 & 리듬',
  },
];
