import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInRight 
} from 'react-native-reanimated';

import StoryCard from '@/components/StoryCard';
import DiamondCounter from '@/components/DiamondCounter';
import GenreButton from '@/components/GenreButton';
import { getFeaturedStories, getRecentlyUpdated, getStoriesByGenre } from '@/data/storiesData';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [genreStories, setGenreStories] = useState(getStoriesByGenre('All'));
  
  const featuredStories = getFeaturedStories();
  const recentlyUpdated = getRecentlyUpdated();
  
  const genres = ['All', 'Romance', 'Drama', 'Fantasy', 'Mystery', 'Horror'];
  
  useEffect(() => {
    setGenreStories(getStoriesByGenre(selectedGenre));
  }, [selectedGenre]);

  function handleStoryPress(storyId: string) {
    router.push(`/story/${storyId}`);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choices</Text>
        <View style={styles.headerRight}>
          {/* Test Chapter Player Button */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/chapter-player-test' as any)}
          >
            <Text style={styles.testButtonText}>Test Player</Text>
          </TouchableOpacity>
          {/* Text-Only Test Button */}
          <TouchableOpacity 
            style={[styles.testButton, { backgroundColor: '#4caf50' }]}
            onPress={() => router.push('/text-only-test' as any)}
          >
            <Text style={styles.testButtonText}>Text Only</Text>
          </TouchableOpacity>
          <DiamondCounter count={125} />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Story Carousel */}
        <Animated.View entering={FadeIn.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>Featured Stories</Text>
          <FlatList
            horizontal
            data={featuredStories}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            snapToInterval={width * 0.85 + 20}
            decelerationRate="fast"
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInRight.delay(200 + index * 100).duration(500)}
                style={styles.featuredItem}
              >
                <TouchableOpacity 
                  activeOpacity={0.9} 
                  onPress={() => handleStoryPress(item.id)}
                  style={styles.featuredCard}
                >
                  <Image source={{ uri: item.coverImage }} style={styles.featuredImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                  >
                    <View style={styles.featuredInfo}>
                      <Text style={styles.featuredBadge}>{item.new ? 'NEW' : 'FEATURED'}</Text>
                      <Text style={styles.featuredTitle}>{item.title}</Text>
                      <Text style={styles.featuredGenre}>{item.genre}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
          />
        </Animated.View>

        {/* Recently Updated */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>Recently Updated</Text>
          <FlatList
            horizontal
            data={recentlyUpdated}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
            renderItem={({ item, index }) => (
              <Animated.View 
                entering={FadeInRight.delay(400 + index * 100).duration(500)}
              >
                <StoryCard 
                  story={item} 
                  onPress={() => handleStoryPress(item.id)} 
                  style={styles.recentCard}
                />
              </Animated.View>
            )}
          />
        </Animated.View>

        {/* Browse by Genre */}
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreScrollView}
          >
            {genres.map((genre, index) => (
              <GenreButton
                key={genre}
                title={genre}
                selected={selectedGenre === genre}
                onPress={() => setSelectedGenre(genre)}
                style={{ marginRight: index < genres.length - 1 ? 10 : 0 }}
              />
            ))}
          </ScrollView>
          
          <View style={styles.genreGrid}>
            {genreStories.map((story, index) => (
              <Animated.View 
                key={story.id}
                entering={FadeInDown.delay(700 + index * 100).duration(500)}
                style={styles.genreItem}
              >
                <StoryCard 
                  story={story} 
                  onPress={() => handleStoryPress(story.id)}
                  compact={true}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: 'Lora-Bold',
    fontSize: 26,
    color: Colors.text.primary,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  featuredList: {
    paddingLeft: 16,
    paddingRight: 6,
  },
  featuredItem: {
    width: width * 0.85,
    height: 240,
    marginRight: 20,
  },
  featuredCard: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredInfo: {
    marginBottom: 8,
  },
  featuredBadge: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: Colors.accent,
    marginBottom: 4,
  },
  featuredTitle: {
    fontFamily: 'Lora-Bold',
    fontSize: 22,
    color: 'white',
    marginBottom: 4,
  },
  featuredGenre: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  recentList: {
    paddingHorizontal: 16,
  },
  recentCard: {
    width: 140,
    marginRight: 16,
  },
  genreScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginTop: 8,
  },
  genreItem: {
    width: '48%',
    marginBottom: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});