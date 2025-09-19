import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingViewProps {
  progress: number;
  visible: boolean;
}

/**
 * LoadingView - Shows loading progress during asset preloading
 */
export const LoadingView: React.FC<LoadingViewProps> = ({ progress, visible }) => {
  if (!visible) {
    return null;
  }

  const progressPercentage = Math.round(progress * 100);

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(300)}
    >
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.background}
      />
      
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        
        <Text style={styles.title}>Loading Chapter...</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage}%</Text>
        </View>
        
        <Text style={styles.subtitle}>
          {progress < 0.5 ? 'Loading images...' : 'Loading audio...'}
        </Text>
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
    zIndex: 999,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Montserrat_700Bold',
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    gap: 8,
    width: 250,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Montserrat_500Medium',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Lora_400Regular',
    textAlign: 'center',
  },
});