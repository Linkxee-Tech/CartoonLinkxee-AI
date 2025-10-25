
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';
import { useVeo } from '../../hooks/useVeo';
import { ArrowUpTrayIcon } from '../Icons';
import { AspectRatio } from '../../types';
import { getCharacter } from '../../services/characterService';
import CharacterSelector from '../CharacterSelector';

const ImageToVideoModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const { videoUrl, isLoading, error, generate, reset, extend } = useVeo();
  const [extensionPrompt, setExtensionPrompt] = useState('');
  const [isExtending, setIsExtending] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const selectedCharacter = useMemo(() => {
    if (!selectedCharacterId) return undefined;
    return getCharacter(selectedCharacterId);
  }, [selectedCharacterId]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      reset();
    }
  };

  const handleGenerate = () => {
    if (prompt.trim() && imageFile) {
      setIsExtending(false);
      generate(prompt, imageFile, aspectRatio, selectedCharacter);
    }
  };

  const handleExtend = () => {
    if (extensionPrompt.trim()) {
      setIsExtending(true);
      extend(extensionPrompt, selectedCharacter);
    }
  };

  const loadingMessages = [
    "Warming up the digital canvas...",
    "Teaching pixels to dance...",
    "Brewing a fresh pot of creativity...",
    "This can take a few minutes, hang tight!",
    "Assembling your cinematic masterpiece...",
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
    <Modal title="Image-to-Video Generation" onClose={onClose}>
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
        ) : (
          imageUrl && <img src={imageUrl} alt="Uploaded preview" className="max-h-60 mx-auto rounded-lg" />
        )}

        <div className={`space-y-4 ${videoUrl ? 'pt-4 border-t border-gray-700' : ''}`}>
          <h3 className="text-lg font-medium">{videoUrl ? 'Start a New Video Generation' : 'Generate a Video'}</h3>
          
          {!videoUrl && (
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Starting Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                {imageUrl ? (
                  <div className="text-center">
                    <img src={imageUrl} alt="Uploaded preview" className="max-h-40 rounded-lg mx-auto" />
                    <button onClick={() => {setImageFile(null); setImageUrl(null)}} className="mt-2 text-xs text-red-400 hover:text-red-300">Remove Image</button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-500 focus-within:outline-none">
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, etc.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading} />

          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Prompt</label>
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "The character starts to run through a neon-lit city"'
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
              disabled={isLoading || !prompt.trim() || !imageFile}
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

export default ImageToVideoModal;
