import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DialogueViewProps {
  character?: string;
  text?: string;
  isNarration?: boolean;
  onAdvance?: () => void;
  visible: boolean;
  speakingCharacterPosition?: 'left' | 'center' | 'right';
  getCharacterImage?: (characterKey: string, outfit: string, emotion: string) => string | undefined; // New prop for character images
}

/**
 * DialogueView - Displays dialogue and narration text
 */
export const DialogueView: React.FC<DialogueViewProps> = ({ 
  character, 
  text, 
  isNarration = false, 
  onAdvance,
  visible,
  speakingCharacterPosition = 'center',
  getCharacterImage
}) => {
  const [canAdvance, setCanAdvance] = useState(false);
  
  const bubbleScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);
  const portraitOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible && text) {
      setCanAdvance(false);
      
      // Animate bubble appearance
      bubbleScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      
      // Animate character portrait
      portraitOpacity.value = withDelay(100, withTiming(1, { 
        duration: 600, 
        easing: Easing.out(Easing.cubic) 
      }));
      
      // Animate text with a smooth fade-in and slide-up effect
      textOpacity.value = 0;
      textTranslateY.value = 10;
      
      // Start text animation after bubble appears
      textOpacity.value = withDelay(200, withTiming(1, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      }));
      
      textTranslateY.value = withDelay(200, withTiming(0, { 
        duration: 800, 
        easing: Easing.out(Easing.cubic) 
      }));
      
      // Enable advance after animation completes
      setTimeout(() => {
        setCanAdvance(true);
      }, 1000);

    } else if (!visible) {
      bubbleScale.value = withTiming(0, { duration: 200 });
      textOpacity.value = 0;
      textTranslateY.value = 10;
      portraitOpacity.value = 0;
    }
  }, [visible, text]);

  // Helper function to get dialogue position based on character position
  const getDialoguePosition = () => {
    const isMobile = screenWidth < 400;
    
    if (isNarration) {
      // Position narration centered and higher, no character portrait needed
      return {
        position: 'center',
        bottom: screenHeight * 0.35, // Lower than before for better balance
        left: screenWidth * 0.1,
        right: screenWidth * 0.1,
      };
    }

    // For dialogue, position it in the middle area for better visual connection
    if (isMobile) {
      return {
        position: 'center',
        bottom: screenHeight * 0.3, // Centered vertically for mobile
        left: screenWidth * 0.05,
        right: screenWidth * 0.05,
      };
    }

    // Desktop positioning - closer to center for better integration
    return {
      position: 'center',
      bottom: screenHeight * 0.25, // Centered area
      left: screenWidth * 0.1,
      right: screenWidth * 0.1,
    };
  };

  // Get character portrait image
  const getCharacterPortraitImage = () => {
    if (isNarration || !character || !getCharacterImage) return null;
    
    // Try to get the character image - default to "neutral" emotion if not specified
    const imageUrl = getCharacterImage(character.toLowerCase(), 'default', 'neutral');
    return imageUrl;
  };

  // Utility function for image source (same as CharacterView)
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

  const startBlinkAnimation = () => {
    // No longer needed - animation removed
  };

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const portraitStyle = useAnimatedStyle(() => ({
    opacity: portraitOpacity.value,
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const handleAdvance = () => {
    if (canAdvance && onAdvance) {
      onAdvance();
    }
  };

  if (!visible || !text) {
    return null;
  }

  const dialoguePosition = getDialoguePosition();
  const characterPortraitImage = getCharacterPortraitImage();

  return (
    <TouchableOpacity 
      style={[styles.fullScreenTouchArea]}
      onPress={handleAdvance}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.dialogueContainer,
          {
            bottom: dialoguePosition.bottom,
            left: dialoguePosition.left,
            right: dialoguePosition.right,
          },
          bubbleStyle
        ]}
      >
        {/* Character Portrait for Dialogue (not narration) */}
        {!isNarration && characterPortraitImage && (
          <Animated.View style={[styles.characterPortraitContainer, portraitStyle]}>
            <Image 
              source={getImageSource(characterPortraitImage)} 
              style={styles.characterPortrait}
              contentFit="cover"
            />
          </Animated.View>
        )}

        {/* Speech Bubble */}
        <Animated.View 
          style={[
            styles.speechBubble,
            isNarration && styles.narrationBubble,
            !isNarration && styles.dialogueBubble,
          ]}
        >
          {/* Bubble content */}
          <View style={styles.bubbleContent}>
            {!isNarration && character && (
              <Animated.Text 
                style={styles.characterName}
                entering={FadeIn.delay(200)}
              >
                {character}
              </Animated.Text>
            )}
            
            <Animated.Text 
              style={[
                styles.dialogueText, 
                isNarration && styles.narrationText,
                textStyle
              ]}
              entering={FadeIn.delay(300)}
            >
              {text}
            </Animated.Text>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none', // Allow touch through container but not the bubble
  },
  fullScreenTouchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'auto', // Make the entire screen tappable
  },
  dialogueContainer: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'flex-start', // Align items to the left
    maxWidth: '90%',
    width: '90%', // Ensure container takes full available width
  },
  characterPortraitContainer: {
    position: 'absolute', // Position absolutely within the dialogue container
    top: screenWidth < 400 ? -20 : -30, // Position slightly above the speech bubble
    left: screenWidth < 400 ? 10 : 15, // Small left offset for natural positioning
    zIndex: 2, // Ensure character is above the speech bubble
  },
  characterPortrait: {
    width: screenWidth < 400 ? 80 : 100, // Much smaller, more like an avatar
    height: screenWidth < 400 ? 80 : 100, // Square aspect ratio for avatar
    borderRadius: screenWidth < 400 ? 40 : 50, // Circular avatar
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)', // White border for definition
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden', // Ensure clipping
  },
  speechBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    paddingHorizontal: screenWidth < 400 ? 16 : 20,
    paddingVertical: screenWidth < 400 ? 12 : 16,
    minHeight: screenWidth < 400 ? 50 : 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    flex: 1,
    marginTop: 0, // No margin since character overlaps
    alignSelf: 'stretch', // Stretch to full width
    zIndex: 1, // Below the character image
  },
  dialogueBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20, // Consistent rounded corners
    paddingTop: screenWidth < 400 ? 20 : 25, // Just enough padding for the small avatar
    paddingLeft: screenWidth < 400 ? 100 : 125, // Left padding to accommodate circular avatar
    paddingRight: screenWidth < 400 ? 20 : 25,
    paddingBottom: screenWidth < 400 ? 16 : 20,
    marginTop: 0,
    minHeight: screenWidth < 400 ? 80 : 100, // Minimum height to match avatar
  },
  narrationBubble: {
    backgroundColor: 'rgba(40, 40, 60, 0.9)',
    borderColor: 'rgba(150, 150, 200, 0.3)',
    alignSelf: 'center',
  },
  leftBubble: {
    borderTopLeftRadius: 8, // Less rounded on the character side
  },
  rightBubble: {
    borderTopRightRadius: 8, // Less rounded on the character side
  },
  speechTail: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  leftTail: {
    left: -10,
    bottom: 20,
    borderLeftWidth: 0,
    borderRightWidth: 15,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'rgba(0, 0, 0, 0.85)',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  rightTail: {
    right: -10,
    bottom: 20,
    borderLeftWidth: 15,
    borderRightWidth: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'rgba(0, 0, 0, 0.85)',
    borderRightColor: 'transparent',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  centerTail: {
    bottom: -10,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.85)',
    borderBottomColor: 'transparent',
  },
  bubbleContent: {
    flex: 1,
  },
  characterName: {
    fontSize: screenWidth < 400 ? 14 : 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Montserrat_600SemiBold',
  },
  dialogueText: {
    fontSize: screenWidth < 400 ? 13 : 15,
    color: '#FFFFFF',
    lineHeight: screenWidth < 400 ? 18 : 22,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    fontFamily: 'Lora_400Regular',
  },
  narrationText: {
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#E8E8FF',
    fontSize: 14,
  },
});