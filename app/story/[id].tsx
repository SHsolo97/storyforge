import { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ImageBackground,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft 
} from 'react-native-reanimated';
import { ArrowLeft, Diamond, Ticket } from 'lucide-react-native';

import { 
  getStoryById, 
  getStoryProgress, 
  getChapterById,
  getNextScene,
  getNextChapter
} from '@/data/storiesData';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

const TIMER_DURATION = 10; // seconds for timed choices

export default function StoryScreen() {
  const router = useRouter();
  const { id, chapterId = '1-1', sceneId = '1-1-1' } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [timerActive, setTimerActive] = useState(false);
  const [choiceSelected, setChoiceSelected] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  
  const story = getStoryById(id as string);
  const chapter = getChapterById(id as string, chapterId as string);
  const currentScene = chapter?.scenes.find(scene => scene.id === sceneId);
  
  useEffect(() => {
    if (!currentScene) return;
    
    setChoiceSelected(false);
    setSelectedChoice(null);
    setTimerActive(currentScene.type === 'choice' && currentScene.timed);
    setTimeLeft(TIMER_DURATION);
    
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  }, [currentScene]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timerActive && timeLeft > 0 && !choiceSelected) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !choiceSelected) {
      handleChoiceSelect(0, false);
    }
    return () => clearInterval(timer);
  }, [timerActive, timeLeft, choiceSelected]);

  if (!story || !chapter || !currentScene) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.errorButton}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  function handleChoiceSelect(index: number, isPremium: boolean) {
    if (isPremium) {
      // Handle premium choice
    }
    
    setSelectedChoice(index);
    setChoiceSelected(true);
    setTimerActive(false);
    
    setTimeout(() => {
      const nextScene = getNextScene(id as string, chapterId as string, sceneId as string);
      if (nextScene) {
        router.push(`/story/${id}?chapterId=${chapterId}&sceneId=${nextScene.id}`);
      } else {
        const nextChapter = getNextChapter(id as string, chapterId as string);
        if (nextChapter) {
          router.push(`/story/${id}?chapterId=${nextChapter.id}&sceneId=${nextChapter.scenes[0].id}`);
        } else {
          router.back();
        }
      }
    }, 1500);
  }
  
  function handleContinue() {
    const nextScene = getNextScene(id as string, chapterId as string, sceneId as string);
    if (nextScene) {
      router.push(`/story/${id}?chapterId=${chapterId}&sceneId=${nextScene.id}`);
    } else {
      const nextChapter = getNextChapter(id as string, chapterId as string);
      if (nextChapter) {
        router.push(`/story/${id}?chapterId=${nextChapter.id}&sceneId=${nextChapter.scenes[0].id}`);
      } else {
        router.back();
      }
    }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ImageBackground
        source={{ uri: currentScene.background }}
        style={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
        />
        
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle}>{story.title}</Text>
            <Text style={styles.storyChapter}>Chapter {chapter.id}: {chapter.title}</Text>
          </View>

          <View style={styles.currency}>
            <View style={styles.currencyItem}>
              <Diamond size={16} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.currencyText}>45</Text>
            </View>
            <View style={styles.currencyItem}>
              <Ticket size={16} color={Colors.secondary} fill={Colors.secondary} />
              <Text style={[styles.currencyText, { color: Colors.secondary }]}>12</Text>
            </View>
          </View>
        </View>
        
        <ScrollView
          ref={scrollViewRef}
          style={styles.contentScroll}
          contentContainerStyle={[
            styles.contentContainer,
            { paddingBottom: insets.bottom + 100 }
          ]}
        >
          <Animated.View
            key={`content-${sceneId}`}
            entering={SlideInRight.duration(400)}
            exiting={SlideOutLeft.duration(400)}
            style={styles.contentBox}
          >
            {currentScene.type === 'dialogue' && currentScene.character && (
              <>
                <View style={styles.characterContainer}>
                  <Image 
                    source={{ uri: currentScene.character.image }}
                    style={styles.characterImage}
                  />
                  <Text style={styles.characterName}>{currentScene.character.name}</Text>
                </View>
                <Text style={styles.dialogueText}>{currentScene.text}</Text>
              </>
            )}
            
            {currentScene.type === 'narrative' && (
              <Text style={styles.narrativeText}>{currentScene.text}</Text>
            )}
            
            {currentScene.type === 'choice' && !choiceSelected && (
              <>
                {currentScene.playerImage && (
                  <Image 
                    source={{ uri: currentScene.playerImage }}
                    style={styles.playerImage}
                  />
                )}
                <Text style={styles.choicePrompt}>{currentScene.text}</Text>
                {currentScene.timed && (
                  <View style={styles.timerContainer}>
                    <View style={styles.timerBar}>
                      <Animated.View 
                        style={[
                          styles.timerProgress,
                          { width: `${(timeLeft / TIMER_DURATION) * 100}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.timerText}>{timeLeft}s</Text>
                  </View>
                )}
                <View style={styles.choicesContainer}>
                  {currentScene.choices?.map((choice, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.choiceButton,
                        choice.premium && styles.premiumChoiceButton,
                        selectedChoice === index && styles.selectedChoiceButton
                      ]}
                      onPress={() => handleChoiceSelect(index, choice.premium)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          choice.premium && styles.premiumChoiceText,
                          selectedChoice === index && styles.selectedChoiceText
                        ]}
                      >
                        {choice.text}
                      </Text>
                      
                      {choice.premium && choice.diamonds && (
                        <View style={styles.diamondContainer}>
                          <Diamond size={16} color={Colors.accent} fill={Colors.accent} />
                          <Text style={styles.diamondText}>{choice.diamonds}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            
            {currentScene.type === 'choice' && choiceSelected && currentScene.choices && (
              <Animated.View
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                style={styles.selectionFeedback}
              >
                <Text style={styles.selectedText}>
                  {currentScene.choices[selectedChoice || 0].text}
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>
        
        {(currentScene.type === 'narrative' || currentScene.type === 'dialogue') && (
          <TouchableOpacity
            style={[styles.continueButton, { marginBottom: insets.bottom + 16 }]}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  storyTitle: {
    fontFamily: 'Lora-Bold',
    fontSize: 18,
    color: 'white',
  },
  storyChapter: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  currency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  currencyText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    color: Colors.accent,
    marginLeft: 4,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contentBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  characterImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  characterName: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: Colors.accent,
  },
  dialogueText: {
    fontFamily: 'Lora-Medium',
    fontSize: 18,
    lineHeight: 28,
    color: 'white',
  },
  narrativeText: {
    fontFamily: 'Lora-Regular',
    fontSize: 18,
    lineHeight: 28,
    color: 'white',
  },
  playerImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  choicePrompt: {
    fontFamily: 'Lora-Bold',
    fontSize: 20,
    color: 'white',
    marginBottom: 24,
    textAlign: 'center',
  },
  timerContainer: {
    marginBottom: 16,
  },
  timerBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  timerText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
  choicesContainer: {
    marginTop: 8,
  },
  choiceButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  premiumChoiceButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderColor: Colors.accent,
  },
  selectedChoiceButton: {
    backgroundColor: 'rgba(94, 53, 177, 0.5)',
    borderColor: Colors.primary,
  },
  choiceText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: 'white',
  },
  premiumChoiceText: {
    fontFamily: 'Montserrat-SemiBold',
    color: Colors.accent,
  },
  selectedChoiceText: {
    fontFamily: 'Montserrat-SemiBold',
    color: 'white',
  },
  diamondContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  diamondText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: Colors.accent,
    marginLeft: 4,
  },
  selectionFeedback: {
    alignItems: 'center',
  },
  selectedText: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 16,
  },
  continueText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
  errorText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  errorButton: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.primary,
  },
});