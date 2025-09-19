import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BackgroundViewProps {
  imageUrl?: string | number;
  children?: React.ReactNode;
}

/**
 * BackgroundView - Renders the current background image with smooth transitions
 */
export const BackgroundView: React.FC<BackgroundViewProps> = ({ imageUrl, children }) => {
  const [currentImage, setCurrentImage] = useState<string | number | undefined>(imageUrl);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (imageUrl && imageUrl !== currentImage) {
      // Fade out current image
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(setCurrentImage)(imageUrl);
          // Fade in new image
          opacity.value = withTiming(1, { duration: 300 });
        }
      });
    } else if (imageUrl && !currentImage) {
      // First image load
      setCurrentImage(imageUrl);
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [imageUrl, currentImage, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!currentImage) {
    return (
      <Animated.View style={styles.container} entering={FadeIn}>
        {children}
      </Animated.View>
    );
  }

  const getImageSource = (image: string | number | undefined) => {
    if (!image) return undefined;
    
    // For mobile platforms, if image is a number (require result), use it directly
    if (Platform.OS !== 'web' && typeof image === 'number') {
      return image;
    }
    
    // For web or string URLs, use uri format
    if (typeof image === 'string') {
      return { uri: image };
    }
    
    return undefined;
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ImageBackground
        source={getImageSource(currentImage)}
        style={styles.background}
        resizeMode="cover"
        onError={(error) => {
          console.warn(`Failed to load background image: ${currentImage}`, error);
        }}
      >
        {children}
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});