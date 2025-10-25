
import React, { useState, useRef } from 'react';
import Modal from '../Modal';
import { analyzeVideoFrames } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { ArrowUpTrayIcon } from '../Icons';
import { extractFramesFromVideo } from '../../utils/fileUtils';

const VideoAnalysisModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoRef.current) {
      setError('Video element not available.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const frames = await extractFramesFromVideo(videoRef.current, 1); // 1 frame per second
      if (frames.length === 0) {
        setError('Could not extract frames from video.');
        setIsLoading(false);
        return;
      }
      const result = await analyzeVideoFrames(frames);
      setAnalysis(result);
    } catch (err) {
      console.error('Video analysis error:', err);
      setError('An error occurred during video analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="Video Analysis" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label htmlFor="video-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Video</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-purple-400 hover:text-purple-500 focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-500">MP4, MOV, WEBM etc.</p>
            </div>
          </div>
        </div>
        
        {videoUrl && (
            <div className="flex justify-center">
                <video ref={videoRef} src={videoUrl} controls className="rounded-lg object-contain max-h-64" crossOrigin="anonymous"/>
            </div>
        )}
        
        {isLoading && (
            <div className="flex justify-center items-center h-48 bg-gray-900 rounded-lg">
                <LoadingSpinner text="Analyzing video frames..."/>
            </div>
        )}

        {analysis && (
          <div className="bg-gray-900 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Analysis Result</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end pt-4">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !videoFile}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? <LoadingSpinner /> : 'Analyze Video'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VideoAnalysisModal;
