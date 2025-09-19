import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DialogueViewProps {
  character?: string;
  text?: string;
  isNarration?: boolean;
  onAdvance?: () => void;
  visible: boolean;
  speakingCharacterPosition?: 'left' | 'center' | 'right'; // New prop for character position
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
  speakingCharacterPosition = 'center'
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [canAdvance, setCanAdvance] = useState(false);
  
  const blinkOpacity = useSharedValue(1);
  const bubbleScale = useSharedValue(0);

  useEffect(() => {
    if (visible && text) {
      setDisplayedText('');
      setIsTyping(true);
      setCanAdvance(false);
      
      // Animate bubble appearance
      bubbleScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      
      // Typewriter effect
      let currentIndex = 0;
      const typeInterval = setInterval(() => {
        currentIndex++;
        setDisplayedText(text.slice(0, currentIndex));
        
        if (currentIndex >= text.length) {
          clearInterval(typeInterval);
          setIsTyping(false);
          setCanAdvance(true);
          startBlinkAnimation();
        }
      }, 10); // Faster typing for better flow

      return () => clearInterval(typeInterval);
    } else if (!visible) {
      bubbleScale.value = withTiming(0, { duration: 200 });
    }
  }, [visible, text]);

  // Helper function to get dialogue position based on character position
  const getDialoguePosition = () => {
    const isMobile = screenWidth < 400;
    
    if (isNarration) {
      // Position narration above character area to avoid overlap
      return {
        position: 'center',
        bottom: screenHeight * 0.65, // Higher up to avoid characters
        left: screenWidth * 0.1,
        right: screenWidth * 0.1,
      };
    }

    if (isMobile) {
      // On mobile, position dialogue much higher to avoid character faces
      // Characters are smaller but still need clearance
      return {
        position: 'center',
        bottom: screenHeight * 0.45, // Much higher on mobile
        left: screenWidth * 0.05,
        right: screenWidth * 0.05,
      };
    }

    // Desktop/tablet positioning
    switch (speakingCharacterPosition) {
      case 'left':
        return {
          position: 'left',
          bottom: screenHeight * 0.25,
          left: 20,
          maxWidth: screenWidth * 0.7,
        };
      case 'right':
        return {
          position: 'right',
          bottom: screenHeight * 0.25,
          right: 20,
          maxWidth: screenWidth * 0.7,
        };
      case 'center':
      default:
        return {
          position: 'center',
          bottom: screenHeight * 0.2,
          left: screenWidth * 0.15,
          right: screenWidth * 0.15,
        };
    }
  };

  const startBlinkAnimation = () => {
    blinkOpacity.value = withSequence(
      withTiming(0.3, { duration: 800 }),
      withTiming(1, { duration: 800 })
    );
    
    // Restart the animation after completion
    setTimeout(() => {
      if (canAdvance) {
        startBlinkAnimation();
      }
    }, 1600);
  };

  const blinkStyle = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bubbleScale.value }],
  }));

  const handleAdvance = () => {
    if (canAdvance && onAdvance) {
      onAdvance();
    } else if (isTyping && text) {
      // Skip typing animation
      setDisplayedText(text);
      setIsTyping(false);
      setCanAdvance(true);
      startBlinkAnimation();
    }
  };

  if (!visible || !text) {
    return null;
  }

  const dialoguePosition = getDialoguePosition();

  return (
    <TouchableOpacity 
      style={[styles.fullScreenTouchArea]}
      onPress={handleAdvance}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.speechBubble,
          {
            bottom: dialoguePosition.bottom,
            left: dialoguePosition.left,
            right: dialoguePosition.right,
            maxWidth: dialoguePosition.maxWidth,
          },
          isNarration && styles.narrationBubble,
          speakingCharacterPosition === 'left' && styles.leftBubble,
          speakingCharacterPosition === 'right' && styles.rightBubble,
          bubbleStyle
        ]}
      >
        {/* Speech bubble tail */}
        {!isNarration && (
          <View style={[
            styles.speechTail,
            speakingCharacterPosition === 'left' && styles.leftTail,
            speakingCharacterPosition === 'right' && styles.rightTail,
            speakingCharacterPosition === 'center' && styles.centerTail,
          ]} />
        )}
        
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
              isNarration && styles.narrationText
            ]}
            entering={FadeIn.delay(300)}
          >
            {displayedText}
            {canAdvance && (
              <Animated.Text style={[styles.advanceIndicator, blinkStyle]}>
                {' '}▼
              </Animated.Text>
            )}
          </Animated.Text>
        </View>
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
  speechBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 20,
    paddingHorizontal: screenWidth < 400 ? 16 : 20, // Smaller padding on mobile
    paddingVertical: screenWidth < 400 ? 12 : 16, // Smaller padding on mobile
    minHeight: screenWidth < 400 ? 50 : 60, // Smaller minimum height on mobile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  leftBubble: {
    borderTopLeftRadius: 8, // Less rounded on the character side
  },
  rightBubble: {
    borderTopRightRadius: 8, // Less rounded on the character side
  },
  narrationBubble: {
    backgroundColor: 'rgba(40, 40, 60, 0.9)',
    borderColor: 'rgba(150, 150, 200, 0.3)',
    alignSelf: 'center',
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
    fontSize: screenWidth < 400 ? 14 : 16, // Smaller font on mobile
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: 'Montserrat_600SemiBold',
  },
  dialogueText: {
    fontSize: screenWidth < 400 ? 13 : 15, // Smaller font on mobile
    color: '#FFFFFF',
    lineHeight: screenWidth < 400 ? 18 : 22, // Adjusted line height for mobile
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
  advanceIndicator: {
    fontSize: 11,
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
});