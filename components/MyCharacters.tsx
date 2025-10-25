
import React, { useState, useCallback, Suspense } from 'react';
import { Character } from '../types';
import { getCharacters, deleteCharacter } from '../services/characterService';
import { Squares2X2Icon, UserPlusIcon, PencilSquareIcon, XMarkIcon } from './Icons';
import LoadingSpinner from './LoadingSpinner';

const CharacterModal = React.lazy(() => import('./modals/CharacterModal'));

const MyCharacters: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>(getCharacters());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

  const refreshCharacters = useCallback(() => {
    setCharacters(getCharacters());
  }, []);

  const handleOpenModal = (character: Character | null = null) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(null);
    refreshCharacters();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      deleteCharacter(id);
      refreshCharacters();
    }
  };

  return (
    <div>
      <header className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold">My Characters</h1>
          <p className="text-gray-400 mt-2">Create and manage your cast of characters for your projects.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <UserPlusIcon className="h-5 w-5" />
          <span>New Character</span>
        </button>
      </header>

      {characters.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
          <Squares2X2Icon className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold">No Characters Yet</h2>
          <p className="text-gray-400 mt-2">Click "New Character" to bring your first creation to life!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <div key={char.id} className="bg-gray-800 rounded-lg shadow-lg p-5 flex flex-col justify-between border border-gray-700">
              <div>
                <h3 className="text-xl font-bold text-purple-300">{char.name}</h3>
                <p className="text-gray-400 italic">{char.role}</p>
                <p className="mt-2 text-sm text-gray-300"><span className="font-semibold">Style:</span> {char.style}</p>
                <p className="mt-1 text-sm text-gray-300"><span className="font-semibold">Personality:</span> {char.personality}</p>
                 <p className="mt-1 text-sm text-gray-300"><span className="font-semibold">Voice:</span> {char.voice_type}</p>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleDelete(char.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors"><XMarkIcon className="h-5 w-5" /></button>
                <button onClick={() => handleOpenModal(char)} className="p-2 text-gray-400 hover:text-purple-400 transition-colors"><PencilSquareIcon className="h-5 w-5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><LoadingSpinner /></div>}>
          <CharacterModal
            character={editingCharacter}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}
    </div>
  );
};

export default MyCharacters;
