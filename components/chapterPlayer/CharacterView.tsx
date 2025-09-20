import React from 'react';
import { CharacterState as GameCharacterState } from '../../lib/chapterPlayer/types';

interface CharacterViewProps {
  characters: Map<string, GameCharacterState>;
  getCharacterImage: (characterKey: string, outfit: string, emotion: string) => string | undefined;
  getMCCustomization?: (characterKey: string) => Record<string, string> | undefined;
  speakingCharacter?: string; // Name of the character who is currently speaking
  isDialogueActive?: boolean; // New prop to dim background characters during dialogue
}

/**
 * CharacterView - Disabled component - character portraits now appear in dialogue bubbles
 */
export const CharacterView: React.FC<CharacterViewProps> = ({ 
  characters, 
  getCharacterImage, 
  getMCCustomization,
  speakingCharacter,
  isDialogueActive = false
}) => {
  console.log(`[CharacterView] Rendering disabled - characters now shown in dialogue portraits only`);

  // Return null to completely remove background character images
  return null;
};