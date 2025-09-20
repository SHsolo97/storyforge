import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { GameManager } from '../../lib/chapterPlayer/GameManager';
import { GameState, CharacterState } from '../../lib/chapterPlayer/types';

// Import all renderer components
import { BackgroundView } from './BackgroundView';
import { CharacterView } from './CharacterView';
import { DialogueView } from './DialogueView';
import { ChoiceView } from './ChoiceView';
import { CGView } from './CGView';
import { LoadingView } from './LoadingView';

interface ChapterPlayerProps {
  chapterData: any; // Chapter JSON data
  storyId: string;
  chapterId: string;
  onExit?: () => void;
}

/**
 * ChapterPlayer - The main screen that orchestrates all components
 */
export const ChapterPlayer: React.FC<ChapterPlayerProps> = ({ 
  chapterData, 
  storyId, 
  chapterId, 
  onExit 
}) => {
  // Game state
  const [gameManager] = useState(() => new GameManager());
  const [gameState, setGameState] = useState<GameState>('LOADING');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // UI state
  const [backgroundImage, setBackgroundImage] = useState<string>();
  const [characters, setCharacters] = useState<Map<string, CharacterState>>(new Map());
  const [currentDialogue, setCurrentDialogue] = useState<{
    character?: string;
    text?: string;
    isNarration?: boolean;
  }>({});
  const [isDialogueVisible, setIsDialogueVisible] = useState(false);
  const [speakingCharacterPosition, setSpeakingCharacterPosition] = useState<'left' | 'center' | 'right'>('center');
  const [currentChoices, setCurrentChoices] = useState<any[]>([]);
  const [isChoicesVisible, setIsChoicesVisible] = useState(false);
  const [currentCG, setCurrentCG] = useState<string>();
  const [isCGVisible, setIsCGVisible] = useState(false);

  // Initialize the game manager
  useEffect(() => {
    const setupGameManager = async () => {
      try {
        // Setup event handlers
        gameManager.onStateChange = setGameState;
        gameManager.onLoadingProgress = setLoadingProgress;
        gameManager.onShowChoices = (choices) => {
          setCurrentChoices(choices);
          setIsChoicesVisible(true);
        };
        gameManager.onHideChoices = () => {
          setIsChoicesVisible(false);
          setCurrentChoices([]);
        };

        // Setup effects processor handlers
        const effectsProcessor = gameManager.getEffectsProcessor();
        const assetManager = gameManager.getAssetManager();
        
        effectsProcessor.onBackgroundChange = async (imageKey: string, transition?: string) => {
          console.log(`[ChapterPlayer] Background change requested: ${imageKey}, transition: ${transition}`);
          const imageUrl = assetManager.getImage(imageKey);
          console.log(`[ChapterPlayer] Asset manager returned imageUrl: ${imageUrl}`);
          if (imageUrl) {
            console.log(`[ChapterPlayer] Setting background image to: ${imageUrl}`);
            setBackgroundImage(imageUrl);
          } else {
            console.warn(`[ChapterPlayer] No image URL found for key: ${imageKey}`);
          }
        };

        effectsProcessor.onCharacterAction = async (args: any) => {
          const { characterKey, action, position, emotion, outfit } = args;
          
          setCharacters(prev => {
            const newCharacters = new Map(prev);
            
            if (action === 'show') {
              const characterState: CharacterState = {
                characterKey,
                outfit: outfit || 'default',
                emotion: emotion || 'neutral',
                position: position || 'center',
                visible: true
              };
              newCharacters.set(characterKey, characterState);
            } else if (action === 'hide') {
              newCharacters.delete(characterKey);
            } else if (action === 'update') {
              const existing = newCharacters.get(characterKey);
              if (existing) {
                newCharacters.set(characterKey, {
                  ...existing,
                  emotion: emotion || existing.emotion,
                  outfit: outfit || existing.outfit,
                  position: position || existing.position
                });
              }
            }
            
            return newCharacters;
          });
        };

        effectsProcessor.onDialogue = async (character: string, text: string) => {
          return new Promise<void>((resolve) => {
            setCurrentDialogue({ character, text, isNarration: false });
            setIsDialogueVisible(true);
            
            // Update speaking character position based on current characters state
            setCharacters(currentCharacters => {
              // Find the speaking character's position
              const speakingCharacter = Array.from(currentCharacters.entries())
                .find(([key, state]) => 
                  state.characterKey.toLowerCase() === character.toLowerCase() || 
                  key.toLowerCase() === character.toLowerCase()
                );
              
              let position: 'left' | 'center' | 'right' = 'center';
              if (speakingCharacter) {
                const characterState = speakingCharacter[1];
                position = typeof characterState.position === 'string' 
                  ? characterState.position as 'left' | 'center' | 'right'
                  : 'center';
              }
              
              setSpeakingCharacterPosition(position);
              return currentCharacters; // Return unchanged
            });
            
            // Set up a one-time listener for dialogue advance
            const handleAdvance = () => {
              setIsDialogueVisible(false);
              setCurrentDialogue({});
              resolve();
            };
            
            // Store the resolve function to be called when user advances
            (effectsProcessor as any)._currentDialogueResolve = handleAdvance;
          });
        };

        effectsProcessor.onNarration = async (text: string) => {
          return new Promise<void>((resolve) => {
            setCurrentDialogue({ text, isNarration: true });
            setIsDialogueVisible(true);
            
            // Set up a one-time listener for narration advance
            const handleAdvance = () => {
              setIsDialogueVisible(false);
              setCurrentDialogue({});
              resolve();
            };
            
            // Store the resolve function to be called when user advances
            (effectsProcessor as any)._currentDialogueResolve = handleAdvance;
          });
        };

        effectsProcessor.onShowCG = async (imageKey: string) => {
          return new Promise<void>((resolve) => {
            const imageUrl = assetManager.getImage(imageKey);
            if (imageUrl) {
              setCurrentCG(imageUrl);
              setIsCGVisible(true);
              
              // Store the resolve function to be called when CG is dismissed
              (effectsProcessor as any)._currentCGResolve = resolve;
            } else {
              resolve();
            }
          });
        };

        // Load the chapter
        await gameManager.loadChapterFromData(chapterData, storyId, chapterId);
        
      } catch (error) {
        console.error('Failed to setup game manager:', error);
        Alert.alert('Error', 'Failed to load chapter');
      }
    };

    setupGameManager();
  }, [chapterData, storyId, chapterId, gameManager]);

  // Handle dialogue advance
  const handleDialogueAdvance = useCallback(() => {
    const effectsProcessor = gameManager.getEffectsProcessor();
    const resolve = (effectsProcessor as any)._currentDialogueResolve;
    if (resolve) {
      resolve();
      (effectsProcessor as any)._currentDialogueResolve = null;
    }
  }, [gameManager]);

  // Handle CG dismiss
  const handleCGDismiss = useCallback(() => {
    const effectsProcessor = gameManager.getEffectsProcessor();
    setIsCGVisible(false);
    setCurrentCG(undefined);
    
    const resolve = (effectsProcessor as any)._currentCGResolve;
    if (resolve) {
      resolve();
      (effectsProcessor as any)._currentCGResolve = null;
    }
  }, [gameManager]);

  // Handle choice selection
  const handleChoiceSelect = useCallback(async (choiceId: string) => {
    await gameManager.selectChoice(choiceId);
  }, [gameManager]);

  // Get character image helper
  const getCharacterImage = useCallback((characterKey: string, outfit: string, emotion: string) => {
    const assetManager = gameManager.getAssetManager();
    return assetManager.getCharacterImage(characterKey, outfit, emotion);
  }, [gameManager]);

  // Get MC customization helper
  const getMCCustomization = useCallback((characterKey: string) => {
    const stateManager = gameManager.getStateManager();
    return stateManager.getCustomization(characterKey);
  }, [gameManager]);

  // Cleanup when component unmounts
  useFocusEffect(
    useCallback(() => {
      return () => {
        gameManager.cleanup();
      };
    }, [gameManager])
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Background Layer */}
      <BackgroundView imageUrl={backgroundImage}>
        {/* Character Layer */}
        <CharacterView
          characters={characters}
          getCharacterImage={getCharacterImage}
          getMCCustomization={getMCCustomization}
          speakingCharacter={currentDialogue.character}
          isDialogueActive={isDialogueVisible}
        />
        
        {/* Dialogue Layer */}
        <DialogueView
          character={currentDialogue.character}
          text={currentDialogue.text}
          isNarration={currentDialogue.isNarration}
          onAdvance={handleDialogueAdvance}
          visible={isDialogueVisible}
          speakingCharacterPosition={speakingCharacterPosition}
          getCharacterImage={getCharacterImage}
        />
        
        {/* Choice Layer */}
        <ChoiceView
          choices={currentChoices}
          onChoiceSelect={handleChoiceSelect}
          visible={isChoicesVisible}
        />
      </BackgroundView>
      
      {/* CG Overlay */}
      <CGView
        imageUrl={currentCG}
        visible={isCGVisible}
        onDismiss={handleCGDismiss}
      />
      
      {/* Loading Overlay */}
      <LoadingView
        progress={loadingProgress}
        visible={gameState === 'LOADING'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});