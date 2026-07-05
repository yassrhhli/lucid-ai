export type Emotion =
  | 'joy'
  | 'fear'
  | 'anxiety'
  | 'peace'
  | 'sadness'
  | 'excitement'
  | 'confusion'
  | 'anger'
  | 'love'
  | 'wonder';

export type SleepQuality = 1 | 2 | 3 | 4 | 5;

export interface DreamSymbol {
  name: string;
  meaning: string;
  archetype?: string;
}

export interface DreamInterpretation {
  id: string;
  dream_id: string;
  user_id: string;
  symbols: DreamSymbol[];
  emotional_analysis: string;
  psychological_insight: string;
  archetypes: string[];
  recurring_themes: string[];
  affirmation: string;
  model_used: string;
  tokens_used: number;
  created_at: string;
}

export interface Dream {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  dream_date: string;
  sleep_quality: SleepQuality | null;
  emotions: Emotion[];
  tags: string[];
  is_lucid: boolean;
  is_recurring: boolean;
  is_public: boolean;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
  interpretation?: DreamInterpretation;
}

export interface DreamCreateInput {
  title?: string;
  content: string;
  dream_date: string;
  sleep_quality?: SleepQuality;
  emotions: Emotion[];
  tags: string[];
  is_lucid: boolean;
  is_recurring: boolean;
  is_public: boolean;
}

export type DreamUpdateInput = Partial<DreamCreateInput>;

export interface FeedPost {
  id: string;
  dream_id: string;
  user_id: string;
  anonymous_name: string;
  vote_count: number;
  weirdness_score: number;
  created_at: string;
  dream?: Partial<Dream>;
  has_voted?: boolean;
}
