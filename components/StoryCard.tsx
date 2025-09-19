import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface Story {
  id: string;
  title: string;
  genre: string;
  coverImage: string;
  new?: boolean;
  progress?: number;
  chapters?: {
    total: number;
    completed: number;
  };
}

interface StoryCardProps {
  story: Story;
  onPress: () => void;
  style?: object;
  compact?: boolean;
  showProgress?: boolean;
}

export default function StoryCard({ 
  story, 
  onPress, 
  style = {}, 
  compact = false,
  showProgress = false
}: StoryCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        compact ? styles.compactContainer : {},
        style
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={[styles.imageContainer, compact ? styles.compactImageContainer : {}]}>
        <Image 
          source={{ uri: story.coverImage }} 
          style={styles.image}
        />
        
        {story.new && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        
        {showProgress && story.progress !== undefined && story.progress < 100 && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.progressGradient}
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${story.progress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{story.progress}%</Text>
            </View>
          </LinearGradient>
        )}
        
        {showProgress && story.progress === 100 && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeBadgeText}>COMPLETED</Text>
          </View>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.title, compact ? styles.compactTitle : {}]}
          numberOfLines={compact ? 1 : 2}
        >
          {story.title}
        </Text>
        
        <Text style={styles.genre}>
          {story.genre}
          {story.chapters && ` • ${story.chapters.completed}/${story.chapters.total} chapters`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    height: 180,
    width: '100%',
  },
  compactImageContainer: {
    height: 80,
    width: 60,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: Colors.text.primary,
  },
  completeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  completeBadgeText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: 'white',
  },
  progressGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'flex-end',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: 'white',
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontFamily: 'Lora-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  compactTitle: {
    fontSize: 14,
  },
  genre: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.text.secondary,
  },
});