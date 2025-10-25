import { Feature } from './types';
import { ChatIcon, CodeBracketIcon, FilmIcon, FireIcon, MicrophoneIcon, PhotoIcon, PencilSquareIcon, SparklesIcon, VideoCameraIcon, DocumentTextIcon } from './components/Icons';

export const APP_NAME = "CartoonLinkxee AI";
export const TRIAL_DAYS = 14;

export const FEATURES = [
  { 
    id: Feature.ImageGen, 
    name: "AI Image Generation", 
    description: "Create stunning images from text prompts.",
    icon: PhotoIcon,
    color: "text-purple-400"
  },
  { 
    id: Feature.ImageEdit, 
    name: "AI Image Editor", 
    description: "Edit your photos with simple text commands.",
    icon: PencilSquareIcon,
    color: "text-blue-400"
  },
  { 
    id: Feature.TextToVideo, 
    name: "Text-to-Video", 
    description: "Generate high-quality videos from text.",
    icon: FilmIcon,
    color: "text-red-400"
  },
  { 
    id: Feature.ImageToVideo, 
    name: "Image-to-Video", 
    description: "Animate your photos into dynamic videos.",
    icon: VideoCameraIcon,
    color: "text-orange-400"
  },
  { 
    id: Feature.Chat, 
    name: "AI Chatbot", 
    description: "Ask questions and get instant answers.",
    icon: ChatIcon,
    color: "text-green-400"
  },
  { 
    id: Feature.Live, 
    name: "Live Conversation", 
    description: "Have a real-time voice chat with AI.",
    icon: FireIcon,
    color: "text-yellow-400"
  },
  { 
    id: Feature.Transcription, 
    name: "Audio Transcription", 
    description: "Transcribe spoken words from your microphone.",
    icon: MicrophoneIcon,
    color: "text-indigo-400"
  },
  { 
    id: Feature.VideoAnalysis, 
    name: "Video Analysis", 
    description: "Extract key information and insights from videos.",
    icon: CodeBracketIcon,
    color: "text-teal-400"
  },
  { 
    id: Feature.TTS, 
    name: "Text-to-Speech", 
    description: "Convert text into natural-sounding speech.",
    icon: SparklesIcon,
    color: "text-pink-400"
  },
    { 
    id: Feature.StoryGen, 
    name: "AI Story Generator", 
    description: "Create detailed stories for your images.",
    icon: DocumentTextIcon,
    color: "text-cyan-400"
  },
];