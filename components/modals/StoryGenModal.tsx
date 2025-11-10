
import React, { useState } from 'react';
import Modal from '../Modal';
import { generateStoryForImage } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { ArrowUpTrayIcon } from '../Icons';
import { fileToGenerativePart } from '../../utils/fileUtils';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';

const StoryGenModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImageUrl(URL.createObjectURL(file));
      setStory(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      setError('Please provide an image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      const imagePart = await fileToGenerativePart(image);
      const result = await generateStoryForImage(imagePart);
      setStory(result);
    } catch (err) {
      console.error('Story generation error:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="AI Story Generator" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
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
          </div>
        </div>
        
        {imageUrl && <div className="flex justify-center"><img src={imageUrl} alt="Uploaded for story" className="rounded-lg object-contain max-h-64" /></div>}
        
        {isLoading && (
            <div className="flex justify-center items-center h-48 bg-gray-900 rounded-lg">
                <LoadingSpinner text="AI is thinking of a great story..."/>
            </div>
        )}

        {story && (
          <div className="bg-gray-900 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Generated Story</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{story}</p>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !image}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner /> : 'Generate Story'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StoryGenModal;
