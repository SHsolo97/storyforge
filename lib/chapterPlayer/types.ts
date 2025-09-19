// Types for the Chapter Player Engine

export interface PlayerProgress {
  storyId: string;
  chapterId: string;
  resumeNodeId: string;
  variables: Record<string, any>;
  customization?: {
    mc?: Record<string, string>;
    [key: string]: any;
  };
}

export interface Effect {
  op: string;
  args: Record<string, any>;
  when?: ConditionalClause[];
}

export interface ConditionalClause {
  var: string;
  op: string;
  value: any;
}

export interface Choice {
  id: string;
  text: string;
  cost?: number;
  costType?: 'diamonds' | 'tickets';
  effects: Effect[];
}

export interface ChapterNode {
  onEnter?: Effect[];
  choices?: Choice[];
}

export interface AssetManifest {
  images: Record<string, string>;
  characters: Record<string, Record<string, Record<string, string>>>;
  audio: Record<string, string>;
}

export interface ChapterData {
  assetManifest: AssetManifest;
  characterCustomization?: any;
  startNodeId: string;
  nodes: Record<string, ChapterNode>;
}

export type GameState = 'LOADING' | 'PLAYING' | 'PAUSED' | 'ENDED';

export interface CharacterPosition {
  x: number;
  y: number;
  scale?: number;
}

export interface CharacterState {
  characterKey: string;
  outfit: string;
  emotion: string;
  position: string | CharacterPosition;
  visible: boolean;
}