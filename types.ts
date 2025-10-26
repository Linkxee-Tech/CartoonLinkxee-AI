
export enum Tab {
  Studio = 'Studio',
  Characters = 'Characters',
  Discover = 'Discover',
  Profile = 'Profile',
}

export enum Feature {
  ImageGen,
  ImageEdit,
  TextToVideo,
  ImageToVideo,
  Chat,
  Live,
  Transcription,
  VideoAnalysis,
  TTS,
  StoryGen,
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type VideoDuration = 'short' | 'medium' | 'long' | 'two_minutes' | 'three_minutes' | 'four_minutes' | 'five_minutes' | 'ten_minutes' | 'fifteen_minutes' | 'twenty_minutes';

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export interface TranscriptionEntry {
  speaker: 'user' | 'model';
  text: string;
}

// New additions for Character System
export enum VoiceType {
  MalePidgin = 'Male Pidgin (Deep)',
  FemalePidgin = 'Female Pidgin (Energetic)',
  Child = 'Child (Friendly)',
  Robotic = 'Robotic AI (Standard)',
}

export const VoiceMap: Record<VoiceType, string> = {
  [VoiceType.MalePidgin]: 'Kore',
  [VoiceType.FemalePidgin]: 'Puck',
  [VoiceType.Child]: 'Zephyr',
  [VoiceType.Robotic]: 'Charon',
};

export interface Character {
  id: string;
  name: string;
  role: string;
  personality: string;
  voice_type: VoiceType;
  style: string;
}