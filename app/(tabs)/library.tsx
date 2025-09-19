import { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { BookOpen, Clock } from 'lucide-react-native';

import { getUserStories } from '@/data/storiesData';
import Colors from '@/constants/Colors';
import StoryCard from '@/components/StoryCard';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('current');
  
  const userStories = getUserStories();
  const currentStories = userStories.filter(story => story.progress > 0 && story.progress < 100);
  const completedStories = userStories.filter(story => story.progress === 100);

  function handleStoryPress(storyId: string) {
    router.push(`/story/${storyId}`);
  }

  function renderStoryItem({ item, index }: { item: any, index: number }) {
    return (
      <Animated.View 
        entering={FadeInDown.delay(200 + index * 100).duration(500)}
        style={styles.storyItem}
      >
        <StoryCard 
          story={item} 
          onPress={() => handleStoryPress(item.id)}
          showProgress={true}
        />
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <BookOpen 
            size={18} 
            color={activeTab === 'current' ? Colors.primary : Colors.text.secondary} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'current' && styles.activeTabText
            ]}
          >
            Current
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Clock 
            size={18} 
            color={activeTab === 'completed' ? Colors.primary : Colors.text.secondary} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'completed' && styles.activeTabText
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'current' ? (
        currentStories.length > 0 ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.listContainer}>
            <FlatList
              data={currentStories}
              keyExtractor={(item) => item.id}
              renderItem={renderStoryItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        ) : (
          <View style={styles.emptyContainer}>
            <BookOpen size={80} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>No stories in progress</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.browseButtonText}>Browse Stories</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        completedStories.length > 0 ? (
          <Animated.View entering={FadeIn.duration(300)} style={styles.listContainer}>
            <FlatList
              data={completedStories}
              keyExtractor={(item) => item.id}
              renderItem={renderStoryItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        ) : (
          <View style={styles.emptyContainer}>
            <Clock size={80} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>No completed stories yet</Text>
            <TouchableOpacity 
              style={styles.browseButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.browseButtonText}>Browse Stories</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: 'Lora-Bold',
    fontSize: 26,
    color: Colors.text.primary,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  activeTabText: {
    color: Colors.primary,
  },
  listContainer: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  storyItem: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 14,
    color: 'white',
  },
});