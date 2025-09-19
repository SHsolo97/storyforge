import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  FadeIn,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight
} from 'react-native-reanimated';
import { Image } from 'react-native';
import { CharacterState as GameCharacterState, CharacterPosition } from '../../lib/chapterPlayer/types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CharacterViewProps {
  characters: Map<string, GameCharacterState>;
  getCharacterImage: (characterKey: string, outfit: string, emotion: string) => string | undefined;
  getMCCustomization?: (characterKey: string) => Record<string, string> | undefined;
  speakingCharacter?: string; // Name of the character who is currently speaking
}

/**
 * CharacterView - Renders character sprites with proper layering for MC
 * On mobile, only shows the speaking character to prevent overlap
 */
export const CharacterView: React.FC<CharacterViewProps> = ({ 
  characters, 
  getCharacterImage, 
  getMCCustomization,
  speakingCharacter 
}) => {
  console.log(`[CharacterView] Rendering with ${characters.size} characters:`, Array.from(characters.entries()));

  const isMobile = Platform.OS !== 'web' && screenWidth < 768;

  const getImageSource = (imageUrl: string | number | undefined) => {
    if (!imageUrl) return undefined;
    
    // For mobile platforms, if imageUrl is a number (require result), use it directly
    if (Platform.OS !== 'web' && typeof imageUrl === 'number') {
      return imageUrl;
    }
    
    // For web or string URLs, use uri format
    if (typeof imageUrl === 'string') {
      return { uri: imageUrl };
    }
    
    return undefined;
  };

  const renderCharacter = (character: GameCharacterState) => {
    console.log(`[CharacterView] Rendering character:`, character);
    if (!character.visible) {
      console.log(`[CharacterView] Character ${character.characterKey} not visible, skipping`);
      return null;
    }

    const { characterKey, outfit, emotion, position } = character;
    
    // Check if this character is currently speaking
    const isSpeaking = speakingCharacter && (
      speakingCharacter.toLowerCase() === characterKey.toLowerCase()
    );

    // On mobile, only show the speaking character to prevent overlap
    if (isMobile && speakingCharacter && !isSpeaking) {
      console.log(`[CharacterView] Mobile: Hiding non-speaking character ${characterKey}`);
      return null;
    }
    
    // Special handling for MC (Main Character) with layered rendering
    if (characterKey === 'mc' && getMCCustomization) {
      console.log(`[CharacterView] Rendering MC character`);
      return renderMCCharacter(character);
    }

    // Regular NPC rendering
    const imageUrl = getCharacterImage(characterKey, outfit, emotion);
    console.log(`[CharacterView] Character ${characterKey} (${outfit}_${emotion}) imageUrl: ${imageUrl}`);
    if (!imageUrl) {
      console.warn(`[CharacterView] No image URL for character ${characterKey} (${outfit}_${emotion})`);
      return null;
    }

    const positionStyle = getPositionStyle(position);
    const animationProps = getAnimationProps(position);

    return (
      <Animated.View
        key={`${characterKey}-${outfit}-${emotion}`}
        style={[
          styles.characterContainer, 
          positionStyle,
          isSpeaking && !isMobile && styles.speakingCharacter
        ]}
        entering={animationProps.entering}
        exiting={animationProps.exiting}
      >
        <Image 
          source={getImageSource(imageUrl)} 
          style={[
            styles.characterImage,
            !isSpeaking && !isMobile && styles.nonSpeakingCharacter
          ]}
          resizeMode="contain"
          onLoad={() => {
            console.log(`[CharacterView] Successfully loaded character image: ${imageUrl}`);
          }}
          onError={(error) => {
            console.error(`[CharacterView] Failed to load character image: ${imageUrl}`, error);
          }}
        />
      </Animated.View>
    );
  };

  const renderMCCharacter = (character: GameCharacterState) => {
    const customization = getMCCustomization?.(character.characterKey);
    if (!customization) return null;

    const positionStyle = getPositionStyle(character.position);
    const animationProps = getAnimationProps(character.position);

    // Define layer order for MC paper doll
    const layers = ['base', 'hair', 'outfit', 'face'];
    
    return (
      <Animated.View
        key={`mc-${character.emotion}`}
        style={[styles.characterContainer, positionStyle]}
        entering={animationProps.entering}
        exiting={animationProps.exiting}
      >
        {layers.map(layerType => {
          let imageUrl: string | undefined;
          
          if (layerType === 'face') {
            // Face layer uses emotion from character state
            const faceId = customization.face || 'f01';
            imageUrl = getCharacterImage('mc', `face_${faceId}`, character.emotion);
          } else {
            // Other layers use customization data
            const partId = customization[layerType];
            if (partId) {
              imageUrl = getCharacterImage('mc', layerType, partId);
            }
          }

          if (!imageUrl) return null;

          return (
            <Image
              key={layerType}
              source={getImageSource(imageUrl)}
              style={[styles.characterImage, styles.characterLayer]}
              resizeMode="contain"
              onError={(error) => {
                console.warn(`Failed to load MC layer ${layerType}: ${imageUrl}`, error);
              }}
            />
          );
        })}
      </Animated.View>
    );
  };

  const getPositionStyle = (position: string | CharacterPosition) => {
    if (typeof position === 'object') {
      return {
        left: position.x,
        bottom: position.y,
        transform: position.scale ? [{ scale: position.scale }] : undefined
      };
    }
    
    // On mobile, center all characters for better visibility
    if (isMobile) {
      const characterWidth = screenWidth < 400 ? 200 : 350;
      return { 
        left: screenWidth * 0.5 - (characterWidth / 2), // Perfect center
        bottom: 0
      };
    }
    
    // Desktop positioning
    switch (position) {
      case 'left':
        return { left: screenWidth * 0.1 };
      case 'right':
        return { right: screenWidth * 0.1 };
      case 'center':
      default:
        return { left: screenWidth * 0.5 - 175 }; // Center with offset for character width
    }
  };

  const getAnimationProps = (position: string | CharacterPosition) => {
    const positionString = typeof position === 'object' ? 'center' : position;
    
    switch (positionString) {
      case 'left':
        return {
          entering: SlideInLeft.duration(500),
          exiting: SlideOutLeft.duration(300)
        };
      case 'right':
        return {
          entering: SlideInRight.duration(500),
          exiting: SlideOutRight.duration(300)
        };
      case 'center':
      default:
        return {
          entering: FadeIn.duration(500),
          exiting: FadeOut.duration(300)
        };
    }
  };

  const renderedCharacters = Array.from(characters.values()).map(character => renderCharacter(character));
  console.log(`[CharacterView] Rendering ${renderedCharacters.length} characters, filtered:`, renderedCharacters.filter(c => c !== null).length);

  return (
    <Animated.View style={styles.container}>
      {renderedCharacters}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  characterContainer: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth < 400 ? 200 : 350, // Smaller characters on mobile for better spacing
    height: screenWidth < 400 ? 280 : 500, // Proportionally smaller height on mobile
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  speakingCharacter: {
    // Add a subtle glow or highlight for the speaking character
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  nonSpeakingCharacter: {
    // Slightly dim non-speaking characters to emphasize the speaker
    opacity: 0.7,
  },
  characterLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});