
import React, { useState } from 'react';
import Modal from '../Modal';
import { Character, VoiceType } from '../../types';
import { saveCharacter } from '../../services/characterService';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCharacter({ ...formData, id: character?.id });
    onClose();
  };

  return (
    <Modal title={character ? 'Edit Character' : 'Create New Character'} onClose={onClose}>
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
          <select name="voice_type" id="voice_type" value={formData.voice_type} onChange={handleChange} required className="mt-1 w-full bg-gray-700 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
            {Object.values(VoiceType).map(voice => (
              <option key={voice} value={voice}>{voice}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end pt-4">
          <button type="button" onClick={onClose} className="mr-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
          <button type="submit" className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">Save Character</button>
        </div>
      </form>
    </Modal>
  );
};

export default CharacterModal;
