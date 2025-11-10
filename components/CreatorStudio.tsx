
import React, { useState } from 'react';
import { APP_NAME, FEATURES } from '../constants';
import { Feature } from '../types';
import FeatureCard from './FeatureCard';
import LoadingSpinner from './LoadingSpinner';

// Lazy load modals to improve initial load time
const ImageGenModal = React.lazy(() => import('./modals/ImageGenModal'));
const ImageEditModal = React.lazy(() => import('./modals/ImageEditModal'));
const TextToVideoModal = React.lazy(() => import('./modals/TextToVideoModal'));
const ImageToVideoModal = React.lazy(() => import('./modals/ImageToVideoModal'));
const ChatModal = React.lazy(() => import('./modals/ChatModal'));
const LiveModal = React.lazy(() => import('./modals/LiveModal'));
const TranscriptionModal = React.lazy(() => import('./modals/TranscriptionModal'));
const VideoAnalysisModal = React.lazy(() => import('./modals/VideoAnalysisModal'));
const TTSModal = React.lazy(() => import('./modals/TTSModal'));
const StoryGenModal = React.lazy(() => import('./modals/StoryGenModal'));


const CreatorStudio: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);

  const renderModal = () => {
    if (activeFeature === null) return null;

    const ModalComponent = {
      [Feature.ImageGen]: ImageGenModal,
      [Feature.ImageEdit]: ImageEditModal,
      [Feature.TextToVideo]: TextToVideoModal,
      [Feature.ImageToVideo]: ImageToVideoModal,
      [Feature.Chat]: ChatModal,
      [Feature.Live]: LiveModal,
      [Feature.Transcription]: TranscriptionModal,
      [Feature.VideoAnalysis]: VideoAnalysisModal,
      [Feature.TTS]: TTSModal,
      [Feature.StoryGen]: StoryGenModal,
    }[activeFeature];

    return (
      <React.Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><LoadingSpinner /></div>}>
        <ModalComponent onClose={() => setActiveFeature(null)} />
      </React.Suspense>
    );
  };

  return (
    <div>
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {APP_NAME}
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Your all-access pass is active. Start creating!</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            onClick={() => setActiveFeature(feature.id)}
          />
        ))}
      </div>

      {renderModal()}
    </div>
  );
};

export default CreatorStudio;