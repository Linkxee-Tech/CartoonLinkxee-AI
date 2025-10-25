
import React, { useState, useEffect } from 'react';
import { Character } from '../types';
import { getCharacters } from '../services/characterService';

interface CharacterSelectorProps {
  selectedCharacterId: string | null;
  onChange: (characterId: string | null) => void;
  disabled?: boolean;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = ({ selectedCharacterId, onChange, disabled }) => {
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    setCharacters(getCharacters());
  }, []);

  if (characters.length === 0) {
    return null; // Don't render if no characters exist
  }

  return (
    <div>
      <label htmlFor="character-selector" className="block text-sm font-medium text-gray-300">
        Use a Character
      </label>
      <select
        id="character-selector"
        value={selectedCharacterId ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 block w-full bg-gray-700 text-white border-gray-600 rounded-md shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        disabled={disabled}
      >
        <option value="">None</option>
        {characters.map((char) => (
          <option key={char.id} value={char.id}>
            {char.name} ({char.role})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CharacterSelector;
