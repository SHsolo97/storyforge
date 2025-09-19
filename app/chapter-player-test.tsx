import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChapterPlayer } from '../components/chapterPlayer';

// Import chapter data as a type-safe object
const chapter1Data = require('../data/chapter1.json');

/**
 * Test screen for the Chapter Player using chapter1.json
 */
export default function ChapterPlayerTest() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give a moment for the screen to render before initializing
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleExit = () => {
    Alert.alert(
      'Exit Chapter',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => router.back() }
      ]
    );
  };

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <ChapterPlayer
      chapterData={chapter1Data}
      storyId="heartwood-echoes"
      chapterId="chapter-1"
      onExit={handleExit}
    />
  );
}