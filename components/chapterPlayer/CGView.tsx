import React from 'react';
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';
import { Image } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CGViewProps {
  imageUrl?: string;
  visible: boolean;
  onDismiss?: () => void;
}

/**
 * CGView - Displays a full-screen headliner image (CG)
 */
export const CGView: React.FC<CGViewProps> = ({ imageUrl, visible, onDismiss }) => {
  if (!visible || !imageUrl) {
    return null;
  }

  return (
    <Animated.View 
      style={styles.container}
      entering={ZoomIn.duration(600)}
      exiting={ZoomOut.duration(400)}
    >
      <TouchableOpacity 
        style={styles.touchArea}
        onPress={onDismiss}
        activeOpacity={1}
      >
        <Animated.View 
          style={styles.imageContainer}
          entering={FadeIn.delay(300).duration(500)}
          exiting={FadeOut.duration(300)}
        >
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.cgImage}
            resizeMode="cover"
          />
        </Animated.View>
      </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  touchArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 16,
  },
  cgImage: {
    width: '100%',
    height: '100%',
  },
});