import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { useVeo } from '../../hooks/useVeo';
import { AspectRatio, VideoDuration } from '../../types';
import CharacterSelector from '../CharacterSelector';
import { getCharacter } from '../../services/characterService';

const loadingMessages = [
  "Spinning up the virtual film crew...",
  "Directing a symphony of pixels...",
  "Rendering your vision into reality...",
  "Video generation can take a few minutes. Please wait.",
  "Finalizing the cut, adding the polish...",
];

const TextToVideoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [duration, setDuration] = useState<VideoDuration>('short');
  const { videoUrl, isLoading, error, generate, extend, progressMessage } = useVeo();
  const [extensionPrompt, setExtensionPrompt] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const selectedCharacter = useMemo(() => {
    if (!selectedCharacterId) return undefined;
    return getCharacter(selectedCharacterId);
  }, [selectedCharacterId]);

  const handleGenerate = () => {
    if (prompt.trim()) {
      setIsExtending(false);
      generate(prompt, null, aspectRatio, duration, selectedCharacter);
    }
  };

  const handleExtend = () => {
    if (extensionPrompt.trim()) {
      setIsExtending(true);
      extend(extensionPrompt, selectedCharacter);
    }
  };

  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: number;
    if (isLoading && !progressMessage) {
      interval = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading, progressMessage]);

  const isAiStudioError = error === 'AI Studio context is not available.';

  return (
    <Modal title="Text-to-Video Generation" onClose={onClose}>
      <div className="space-y-4">
        {videoUrl && !isLoading ? (
          <div>
            <h3 className="text-lg font-medium text-center mb-2">Your video is ready!</h3>
            <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg" />
          </div>
        ) : isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 bg-gray-900 rounded-lg">
            <LoadingSpinner text={progressMessage || loadingMessage} />
          </div>
        ) : null}

        <div className={`space-y-4 ${videoUrl ? 'pt-4 border-t border-gray-700' : ''}`}>
          <h3 className="text-lg font-medium">{videoUrl ? 'Generate a New Video' : 'Generate a Video'}</h3>
          <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading || isAiStudioError} />
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Prompt</label>
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "A neon hologram of a cat driving at top speed"'
              className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading || isAiStudioError}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300">Aspect Ratio</label>
                <select
                    id="aspectRatio"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="mt-1 block w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    disabled={isLoading || isAiStudioError}
                >
                    <option value="16:9">Landscape (16:9) - YouTube</option>
                    <option value="9:16">Portrait (9:16) - TikTok, Reels</option>
                </select>
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration</label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value as VideoDuration)}
                className="mt-1 block w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading || isAiStudioError}
              >
                <option value="short">Short (~10s)</option>
                <option value="medium">Medium (~30s)</option>
                <option value="long">Long (~60s)</option>
                <option value="two_minutes">2 Minutes</option>
                <option value="three_minutes">3 Minutes</option>
                <option value="four_minutes">4 Minutes</option>
                <option value="five_minutes">5 Minutes</option>
                <option value="ten_minutes">10 Minutes</option>
                <option value="fifteen_minutes">15 Minutes</option>
                <option value="twenty_minutes">20 Minutes</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Note: Generating longer videos can take a very long time.</p>
            </div>
          </div>

          {isAiStudioError && (
            <div className="bg-red-900/50 border border-red-700/50 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <p><strong className="font-bold">AI Studio Context Not Available.</strong></p>
              <p className="text-sm">Video generation features are only available when running within Google AI Studio.</p>
            </div>
           )}

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim() || isAiStudioError}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && !isExtending ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
        </div>

        {videoUrl && !isLoading && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium">Extend Your Video (adds ~7s)</h3>
             <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading || isAiStudioError} />
            <div>
              <label htmlFor="extension_prompt" className="block text-sm font-medium text-gray-300">Extension Prompt</label>
              <textarea
                id="extension_prompt"
                rows={2}
                value={extensionPrompt}
                onChange={(e) => setExtensionPrompt(e.target.value)}
                placeholder='e.g., "And then it starts to rain neon drops"'
                className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading || isAiStudioError}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleExtend}
                disabled={isLoading || !extensionPrompt.trim() || isAiStudioError}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && isExtending ? 'Extending...' : 'Extend Video'}
              </button>
            </div>
          </div>
        )}

        {error && !isAiStudioError && <p className="text-red-400 text-sm">{error}</p>}

      </div>
    </Modal>
  );
};

export default TextToVideoModal;