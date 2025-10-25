
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import { connectToLive, LiveSession } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { PlayCircleIcon, StopCircleIcon } from '../Icons';
import type { LiveServerMessage } from '@google/genai';

const TranscriptionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  
  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const onMessage = useCallback((message: LiveServerMessage) => {
    if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      setTranscription(prev => prev + text);
    }
  }, []);

  const onError = useCallback((e: ErrorEvent) => {
    console.error('Live session error:', e);
    setError('A connection error occurred.');
    stopSession();
  }, []);

  const onCloseEvent = useCallback((e: CloseEvent) => {
    console.log('Live session closed');
    stopSession();
  }, []);

  const startSession = async () => {
    if (isSessionActive) return;
    setIsConnecting(true);
    setError(null);
    setTranscription('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const session = await connectToLive(stream, onMessage, onError, onCloseEvent, true); // Last param enables transcription only
      sessionRef.current = session;
      setIsSessionActive(true);
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Could not access microphone. Please check permissions.');
    } finally {
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setIsSessionActive(false);
  };
  
  useEffect(() => {
    return () => {
        stopSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal title="Audio Transcription" onClose={onClose}>
      <div className="flex flex-col h-[60vh]">
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 bg-gray-900 p-4 rounded-lg">
           {transcription ? <p className="text-gray-200 whitespace-pre-wrap">{transcription}</p> : <p className="text-gray-400 text-center">Press start to begin recording.</p>}
        </div>

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        
        <div className="mt-6 flex justify-center">
            {isConnecting ? <LoadingSpinner text="Initializing..." /> : (
                isSessionActive ? (
                <button onClick={stopSession} className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors">
                    <StopCircleIcon className="h-6 w-6"/>
                    <span>Stop Recording</span>
                </button>
            ) : (
                <button onClick={startSession} className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors">
                    <PlayCircleIcon className="h-6 w-6"/>
                    <span>Start Recording</span>
                </button>
            )
            )}
        </div>
      </div>
    </Modal>
  );
};

export default TranscriptionModal;
