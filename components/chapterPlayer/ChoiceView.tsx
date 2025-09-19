import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInUp, 
  SlideOutDown,
  FadeInDown
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import DiamondCounter from '../DiamondCounter';

const { width: screenWidth } = Dimensions.get('window');

interface Choice {
  id: string;
  text: string;
  cost?: number;
  costType?: 'diamonds' | 'tickets';
  canAfford?: boolean;
}

interface ChoiceViewProps {
  choices: Choice[];
  onChoiceSelect: (choiceId: string) => void;
  visible: boolean;
}

/**
 * ChoiceView - Renders choice buttons when the game state requires it
 */
export const ChoiceView: React.FC<ChoiceViewProps> = ({ 
  choices, 
  onChoiceSelect, 
  visible 
}) => {
  if (!visible || !choices.length) {
    return null;
  }

  const renderChoice = (choice: Choice, index: number) => {
    const isDisabled = choice.cost && !choice.canAfford;
    const isPremium = !!choice.cost;

    return (
      <Animated.View
        key={choice.id}
        entering={FadeInDown.delay(200 + index * 100).duration(400)}
        exiting={FadeOut.duration(200)}
        style={styles.choiceWrapper}
      >
        <TouchableOpacity
          style={[
            styles.choiceCard,
            isPremium && styles.premiumCard,
            isDisabled ? styles.disabledCard : null
          ]}
          onPress={() => !isDisabled && onChoiceSelect(choice.id)}
          disabled={!!isDisabled}
          activeOpacity={0.8}
        >
          <View style={styles.choiceContent}>
            <Text style={[
              styles.choiceText,
              isDisabled ? styles.disabledText : null
            ]}>
              {choice.text}
            </Text>
            
            {choice.cost && (
              <View style={styles.costContainer}>
                <DiamondCounter 
                  count={choice.cost} 
                  size="small"
                />
              </View>
            )}
          </View>
          
          {isPremium && !isDisabled && (
            <View style={styles.premiumIndicator}>
              <Text style={styles.premiumIndicatorText}>💎</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
    >
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />
      
      {/* Choice cards container */}
      <View style={styles.choicesContainer}>
        <Animated.Text 
          style={styles.choicePrompt}
          entering={FadeInDown.delay(200).duration(400)}
        >
          What do you choose?
        </Animated.Text>
        {choices.map(renderChoice)}
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  choicesContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  choicePrompt: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontFamily: 'Montserrat_600SemiBold',
  },
  choiceWrapper: {
    width: '100%',
  },
  choiceCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumCard: {
    borderColor: 'rgba(255, 215, 0, 0.6)',
    backgroundColor: 'rgba(40, 30, 0, 0.9)',
  },
  disabledCard: {
    opacity: 0.5,
    backgroundColor: 'rgba(60, 60, 60, 0.7)',
  },
  choiceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  choiceText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    fontFamily: 'Lora_400Regular',
  },
  disabledText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  costContainer: {
    marginLeft: 12,
  },
  premiumIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  premiumIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});