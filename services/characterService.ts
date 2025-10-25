import { Character } from '../types';

const CHARACTERS_KEY = 'cartoonlinkxee_characters';

export const getCharacters = (): Character[] => {
  try {
    const charactersJson = localStorage.getItem(CHARACTERS_KEY);
    return charactersJson ? JSON.parse(charactersJson) : [];
  } catch (error) {
    console.error("Failed to parse characters from localStorage", error);
    return [];
  }
};

export const getCharacter = (id: string): Character | undefined => {
  const characters = getCharacters();
  return characters.find(char => char.id === id);
};

export const saveCharacter = (character: Omit<Character, 'id'> & { id?: string }): Character => {
  const characters = getCharacters();
  if (character.id) {
    const index = characters.findIndex(c => c.id === character.id);
    const updatedCharacter = { ...characters[index], ...character };
    if (index > -1) {
      characters[index] = updatedCharacter;
    } else {
      // If editing a character that doesn't exist, add it.
      characters.push(updatedCharacter as Character);
    }
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
    return updatedCharacter as Character;
  } else {
    const newCharacter: Character = {
      ...character,
      id: `char_${Date.now()}`
    } as Character;
    characters.push(newCharacter);
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
    return newCharacter;
  }
};

export const deleteCharacter = (id: string): void => {
  let characters = getCharacters();
  characters = characters.filter(char => char.id !== id);
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
};