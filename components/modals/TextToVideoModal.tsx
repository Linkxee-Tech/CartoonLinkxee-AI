import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { useVeo } from '../../hooks/useVeo';
import { AspectRatio } from '../../types';
import CharacterSelector from '../CharacterSelector';
import { getCharacter } from '../../services/characterService';

const TextToVideoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const { videoUrl, isLoading, error, generate, extend } = useVeo();
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
      generate(prompt, null, aspectRatio, selectedCharacter);
    }
  };

  const handleExtend = () => {
    if (extensionPrompt.trim()) {
      setIsExtending(true);
      extend(extensionPrompt, selectedCharacter);
    }
  };

  const loadingMessages = [
    "Spinning up the virtual film crew...",
    "Directing a symphony of pixels...",
    "Rendering your vision into reality...",
    "Video generation can take a few minutes. Please wait.",
    "Finalizing the cut, adding the polish...",
  ];
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      interval = window.setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading, loadingMessages]);

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
            <LoadingSpinner text={loadingMessage} />
          </div>
        ) : null}

        <div className={`space-y-4 ${videoUrl ? 'pt-4 border-t border-gray-700' : ''}`}>
          <h3 className="text-lg font-medium">{videoUrl ? 'Generate a New Video' : 'Generate a Video'}</h3>
          <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading} />
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Prompt</label>
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "A neon hologram of a cat driving at top speed"'
              className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
          </div>

          <div>
              <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300">Aspect Ratio</label>
              <select
                  id="aspectRatio"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                  className="mt-1 block w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isLoading}
              >
                  <option value="16:9">Landscape (16:9)</option>
                  <option value="9:16">Portrait (9:16)</option>
              </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && !isExtending ? 'Generating...' : 'Generate Video'}
            </button>
          </div>
        </div>

        {videoUrl && !isLoading && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium">Extend Your Video (adds ~7s)</h3>
             <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading} />
            <div>
              <label htmlFor="extension_prompt" className="block text-sm font-medium text-gray-300">Extension Prompt</label>
              <textarea
                id="extension_prompt"
                rows={2}
                value={extensionPrompt}
                onChange={(e) => setExtensionPrompt(e.target.value)}
                placeholder='e.g., "And then it starts to rain neon drops"'
                className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleExtend}
                disabled={isLoading || !extensionPrompt.trim()}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && isExtending ? 'Extending...' : 'Extend Video'}
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

      </div>
    </Modal>
  );
};

export default TextToVideoModal;