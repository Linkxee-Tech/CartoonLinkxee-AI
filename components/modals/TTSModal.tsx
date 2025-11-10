
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../Modal';
import { generateSpeech } from '../../services/geminiService';
import { getCharacter } from '../../services/characterService';
import LoadingSpinner from '../LoadingSpinner';
import CharacterSelector from '../CharacterSelector';
import { PlayCircleIcon, StopCircleIcon } from '../Icons';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';

const TTSModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const selectedCharacter = useMemo(() => {
    if (!selectedCharacterId) return undefined;
    return getCharacter(selectedCharacterId);
  }, [selectedCharacterId]);

  useEffect(() => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      setAudioContext(context);
    } catch (e) {
      console.error("Could not create audio context", e);
      setError("Audio playback is not supported on this browser.");
    }

    return () => {
      audioSource?.stop();
      audioContext?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const stopPlayback = () => {
      if (audioSource) {
          audioSource.stop();
          setAudioSource(null);
          setIsPlaying(false);
      }
  }

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) {
      setError('Please enter some text.');
      return;
    }
    if (!audioContext) {
      setError('Audio context is not available.');
      return;
    }
    
    stopPlayback();
    setIsLoading(true);
    setError(null);

    try {
      const audioBuffer = await generateSpeech(text, audioContext, selectedCharacter);
      if (audioBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => {
            setIsPlaying(false);
            setAudioSource(null);
        };
        source.start();
        setAudioSource(source);
        setIsPlaying(true);
      } else {
        setError('Failed to generate speech.');
      }
    } catch (err) {
      console.error('Speech generation error:', err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="Text-to-Speech" onClose={onClose}>
      <div className="space-y-4">
        <CharacterSelector selectedCharacterId={selectedCharacterId} onChange={setSelectedCharacterId} disabled={isLoading || isPlaying} />
        <div>
          <label htmlFor="tts-text" className="block text-sm font-medium text-gray-300">Text to Convert</label>
          <textarea
            id="tts-text"
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to hear..."
            className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isLoading || isPlaying}
          />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="flex justify-center pt-4">
          {isPlaying ? (
             <button
                onClick={stopPlayback}
                className="w-full flex items-center justify-center bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
             >
                <StopCircleIcon className="h-6 w-6 mr-2" />
                Stop
             </button>
          ) : (
             <button
                onClick={handleGenerateAndPlay}
                disabled={isLoading || !text.trim()}
                className="w-full flex items-center justify-center bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
             >
                {isLoading ? <LoadingSpinner /> : <><PlayCircleIcon className="h-6 w-6 mr-2" /> Generate & Play</>}
             </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TTSModal;
