
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import { connectToLive, LiveSession } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { PlayCircleIcon, StopCircleIcon } from '../Icons';
import { TranscriptionEntry } from '../../types';
import type { LiveServerMessage } from '@google/genai';

const LiveModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcriptions, setTranscriptions] = useState<TranscriptionEntry[]>([]);
  
  const sessionRef = useRef<LiveSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const transcriptionsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    transcriptionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [transcriptions]);

  const onMessage = useCallback((message: LiveServerMessage) => {
    let inputTextChanged = false;
    let outputTextChanged = false;

    if (message.serverContent?.inputTranscription) {
      const text = message.serverContent.inputTranscription.text;
      currentInputTranscriptionRef.current += text;
      inputTextChanged = true;
    }
    if (message.serverContent?.outputTranscription) {
      const text = message.serverContent.outputTranscription.text;
      currentOutputTranscriptionRef.current += text;
      outputTextChanged = true;
    }

    if (inputTextChanged || outputTextChanged) {
      setTranscriptions(prev => {
        const newTranscriptions = [...prev];
        const last = newTranscriptions[newTranscriptions.length - 1];

        if (inputTextChanged && (last?.speaker !== 'user' || !last)) {
          newTranscriptions.push({ speaker: 'user', text: currentInputTranscriptionRef.current });
        } else if (inputTextChanged && last?.speaker === 'user') {
          last.text = currentInputTranscriptionRef.current;
        }

        if (outputTextChanged && (last?.speaker !== 'model' || !last)) {
          newTranscriptions.push({ speaker: 'model', text: currentOutputTranscriptionRef.current });
        } else if (outputTextChanged && last?.speaker === 'model') {
          last.text = currentOutputTranscriptionRef.current;
        }

        return newTranscriptions;
      });
    }

    if (message.serverContent?.turnComplete) {
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
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
    setTranscriptions([]);

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const session = await connectToLive(stream, onMessage, onError, onCloseEvent);
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
    <Modal title="Live Conversation" onClose={onClose}>
      <div className="flex flex-col h-[60vh]">
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 bg-gray-900 p-4 rounded-lg">
           {transcriptions.length === 0 && !isSessionActive && <p className="text-gray-400 text-center">Press start to begin the conversation.</p>}
           {transcriptions.map((entry, index) => (
             <div key={index} className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${entry.speaker === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                 <p className="whitespace-pre-wrap">{entry.text}</p>
               </div>
             </div>
           ))}
           <div ref={transcriptionsEndRef} />
        </div>

        {error && <p className="text-red-400 text-sm mt-4 text-center">{error}</p>}
        
        <div className="mt-6 flex justify-center">
            {isConnecting ? <LoadingSpinner text="Connecting..." /> : (
                isSessionActive ? (
                <button onClick={stopSession} className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors">
                    <StopCircleIcon className="h-6 w-6"/>
                    <span>Stop Session</span>
                </button>
            ) : (
                <button onClick={startSession} className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors">
                    <PlayCircleIcon className="h-6 w-6"/>
                    <span>Start Session</span>
                </button>
            )
            )}
        </div>
      </div>
    </Modal>
  );
};

export default LiveModal;
