

import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Character, VoiceType, VoiceMap } from '../../types';
import { saveCharacter } from '../../services/characterService';
import { generateSpeechWithVoice } from '../../services/geminiService';
import { PlayCircleIcon, StopCircleIcon } from '../Icons';

interface CharacterModalProps {
  character: Character | null;
  onClose: () => void;
}

const CharacterModal: React.FC<CharacterModalProps> = ({ character, onClose }) => {
  const [formData, setFormData] = useState<Omit<Character, 'id'>>({
    name: character?.name || '',
    role: character?.role || '',
    personality: character?.personality || '',
    style: character?.style || '',
    voice_type: character?.voice_type || VoiceType.MalePidgin,
  });
  
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioSource, setAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    let context: AudioContext | null = null;
    try {
      context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      setAudioContext(context);
    } catch (e) {
      console.error("Could not create audio context", e);
    }

    return () => {
      audioSource?.stop();
      context?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const stopPlayback = () => {
    if (audioSource) {
      audioSource.stop();
      setAudioSource(null);
      setIsPlaying(false);
    }
  };
  
  const handlePreviewVoice = async () => {
    if (!audioContext || isLoadingPreview || isPlaying) return;

    stopPlayback();
    setIsLoadingPreview(true);

    try {
      const voiceName = VoiceMap[formData.voice_type];
      const previewText = `Hello, my name is ${formData.name || 'this character'}. This is what my voice sounds like.`;
      const audioBuffer = await generateSpeechWithVoice(previewText, voiceName, audioContext);

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
      }
    } catch (error) {
      console.error("Error previewing voice", error);
    } finally {
      setIsLoadingPreview(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === 'voice_type') {
      stopPlayback();
    }
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleClose = () => {
    stopPlayback();
    onClose();
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopPlayback();
    saveCharacter({ ...formData, id: character?.id });
    onClose();
  };

  return (
    <Modal title={character ? 'Edit Character' : 'Create New Character'} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role</label>
          <input type="text" name="role" id="role" value={formData.role} onChange={handleChange} placeholder="e.g., Creative Robot, Space Explorer" required className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
         <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-300">Visual Style</label>
          <input type="text" name="style" id="style" value={formData.style} onChange={handleChange} placeholder="e.g., 3D Cartoon Neon, Anime, Pixar-like" required className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label htmlFor="personality" className="block text-sm font-medium text-gray-300">Personality</label>
          <textarea name="personality" id="personality" value={formData.personality} onChange={handleChange} rows={3} placeholder="e.g., Funny, helpful, talks Pidgin" required className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <div>
          <label htmlFor="voice_type" className="block text-sm font-medium text-gray-300">Voice Type</label>
          <div className="flex items-center gap-2 mt-1">
            <select name="voice_type" id="voice_type" value={formData.voice_type} onChange={handleChange} required className="w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {Object.values(VoiceType).map(voice => (
                <option key={voice} value={voice}>{voice}</option>
                ))}
            </select>
            <button
              type="button"
              onClick={isPlaying ? stopPlayback : handlePreviewVoice}
              disabled={isLoadingPreview}
              className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 transition-colors flex-shrink-0 w-9 h-9 flex items-center justify-center"
              title={isPlaying ? "Stop Preview" : "Preview Voice"}
            >
              {isLoadingPreview ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : isPlaying ? (
                <StopCircleIcon className="h-5 w-5" />
              ) : (
                <PlayCircleIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={handleClose} className="mr-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
          <button type="submit" className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">Save Character</button>
        </div>
      </form>
    </Modal>
  );
};

export default CharacterModal;
