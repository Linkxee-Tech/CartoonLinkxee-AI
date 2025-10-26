
import React, { useState, useCallback, useMemo } from 'react';
import Modal from '../Modal';
import { generateImage, generatePromptInspiration } from '../../services/geminiService';
import { getCharacter } from '../../services/characterService';
import LoadingSpinner from '../LoadingSpinner';
import { AspectRatio } from '../../types';
import { SparklesIcon } from '../Icons';
import CharacterSelector from '../CharacterSelector';

const ImageGenModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const selectedCharacter = useMemo(() => {
    if (!selectedCharacterId) return undefined;
    return getCharacter(selectedCharacterId);
  }, [selectedCharacterId]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const result = await generateImage(prompt, aspectRatio, selectedCharacter);
      if (result) {
        setImageUrl(result);
      } else {
        setError('Failed to generate image. The result was empty.');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError('An error occurred while generating the image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspire = useCallback(async () => {
    setIsLoading(true);
    try {
      const inspiration = await generatePromptInspiration("an image");
      setPrompt(inspiration);
    } catch (err) {
      setError("Failed to get inspiration.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Modal title="AI Image Generation" onClose={onClose}>
      <div className="space-y-4">
        {imageUrl && (
          <div className="bg-gray-900 p-2 rounded-lg">
            <img src={imageUrl} alt="Generated" className="rounded-md w-full max-w-lg mx-auto" />
          </div>
        )}
        {isLoading && (
            <div className="flex justify-center items-center h-64 bg-gray-900 rounded-lg">
                <LoadingSpinner text="Generating your masterpiece..."/>
            </div>
        )}
        
        <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading} />

        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Prompt</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "A photo of an astronaut riding a horse on Mars"'
              className="flex-grow bg-gray-700 text-white rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isLoading}
            />
             <button
              onClick={handleInspire}
              disabled={isLoading}
              className="bg-yellow-500 text-white p-3 rounded-r-md hover:bg-yellow-600 disabled:bg-gray-600 transition-colors flex items-center justify-center"
              title="Inspire Me"
            >
              <SparklesIcon className="h-5 w-5" />
            </button>
          </div>
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
            <option value="1:1">Square (1:1) - Instagram Post</option>
            <option value="16:9">Landscape (16:9) - YouTube, Facebook</option>
            <option value="9:16">Portrait (9:16) - TikTok, Reels, Stories</option>
            <option value="4:3">Standard (4:3) - Classic Photo</option>
            <option value="3:4">Tall (3:4) - Pinterest, Facebook</option>
          </select>
        </div>
        
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generating...' : 'Generate Image'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImageGenModal;