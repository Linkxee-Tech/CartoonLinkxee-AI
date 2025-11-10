
import React, { useState, useRef } from 'react';
import Modal from '../Modal';
import { analyzeVideoFrames, transcribeVideo } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { ArrowUpTrayIcon } from '../Icons';
import { extractFramesFromVideo } from '../../utils/fileUtils';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';

const VideoAnalysisModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [captions, setCaptions] = useState<string | null>(null);
  const [loadingTask, setLoadingTask] = useState<'analysis' | 'captions' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isLoading = loadingTask !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setCaptions(null);
      setError(null);
    }
  };

  const handleVisualAnalysis = async () => {
    if (!videoRef.current) {
      setError('Video element not available.');
      return;
    }
    setLoadingTask('analysis');
    setError(null);
    setAnalysis(null);
    setCaptions(null);

    try {
      const frames = await extractFramesFromVideo(videoRef.current, 1); // 1 frame per second
      if (frames.length === 0) {
        setError('Could not extract frames from video.');
        setLoadingTask(null);
        return;
      }
      const result = await analyzeVideoFrames(frames);
      setAnalysis(result);
    } catch (err) {
      console.error('Video analysis error:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoadingTask(null);
    }
  };
  
  const handleGenerateCaptions = async () => {
    if (!videoFile) {
        setError('Please upload a video file first.');
        return;
    }
    setLoadingTask('captions');
    setError(null);
    setAnalysis(null);
    setCaptions(null);

    try {
        const result = await transcribeVideo(videoFile);
        setCaptions(result);
    } catch (err) {
        console.error('Video transcription error:', err);
        setError(getFriendlyErrorMessage(err));
    } finally {
        setLoadingTask(null);
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
                <LoadingSpinner text={loadingTask === 'analysis' ? "Analyzing video frames..." : "Generating captions..."}/>
            </div>
        )}

        {analysis && (
          <div className="bg-gray-900 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Analysis Result</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{analysis}</p>
          </div>
        )}

        {captions && (
          <div className="bg-gray-900 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h3 className="text-lg font-bold text-purple-300 mb-2">Generated Captions</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{captions}</p>
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex justify-end pt-4 gap-4">
          <button
            onClick={handleVisualAnalysis}
            disabled={isLoading || !videoFile}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loadingTask === 'analysis' ? <LoadingSpinner /> : 'Analyze Video'}
          </button>
          <button
            onClick={handleGenerateCaptions}
            disabled={isLoading || !videoFile}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loadingTask === 'captions' ? <LoadingSpinner /> : 'Generate Captions'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default VideoAnalysisModal;
