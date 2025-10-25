
import React, { useState, useCallback } from 'react';
import Modal from '../Modal';
import { editImage, generatePromptInspiration } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { ArrowUpTrayIcon, SparklesIcon } from '../Icons';
import { fileToGenerativePart } from '../../utils/fileUtils';

const ImageEditModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalImage(file);
      setOriginalImageUrl(URL.createObjectURL(file));
      setEditedImageUrl(null);
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !originalImage) {
      setError('Please provide an image and a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const imagePart = await fileToGenerativePart(originalImage);
      const result = await editImage(prompt, imagePart);
      if (result) {
        setEditedImageUrl(result);
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
      const inspiration = await generatePromptInspiration("an edit for a photo");
      setPrompt(inspiration);
    } catch (err) {
      setError("Failed to get inspiration.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Modal title="AI Image Editor" onClose={onClose}>
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
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
             {originalImageUrl && <div className="flex-1"><h3 className="text-center text-gray-400 mb-2">Original</h3><img src={originalImageUrl} alt="Original" className="rounded-lg w-full object-contain max-h-64" /></div>}
             {editedImageUrl && <div className="flex-1"><h3 className="text-center text-gray-400 mb-2">Edited</h3><img src={editedImageUrl} alt="Edited" className="rounded-lg w-full object-contain max-h-64" /></div>}
        </div>

        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Edit Prompt</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <textarea
              id="prompt"
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='e.g., "Add a retro filter" or "Make the sky look like a sunset"'
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

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim() || !originalImage}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner /> : 'Generate Edit'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImageEditModal;
