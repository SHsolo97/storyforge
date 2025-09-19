import { useState } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import Colors from '@/constants/Colors';

const AVATARS = [
  { id: '1', url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' },
  { id: '2', url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' },
  { id: '3', url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg' },
];

const PERSONALITIES = [
  { id: '1', name: 'Ambitious', description: 'Driven to succeed at any cost' },
  { id: '2', name: 'Charming', description: 'Natural charisma that draws others in' },
  { id: '3', name: 'Mysterious', description: 'Keeps others guessing' },
];

export default function CharacterCreator() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [selectedPersonality, setSelectedPersonality] = useState('1');

  const handleCreate = () => {
    // Save character data and proceed to story
    router.push('/story/1');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.title}>Create Your Character</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Your Look</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  onPress={() => setSelectedAvatar(avatar.id)}
                  style={[
                    styles.avatarContainer,
                    selectedAvatar === avatar.id && styles.selectedAvatar,
                  ]}>
                  <Image source={{ uri: avatar.url }} style={styles.avatar} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Your Personality</Text>
            {PERSONALITIES.map((personality) => (
              <TouchableOpacity
                key={personality.id}
                style={[
                  styles.personalityCard,
                  selectedPersonality === personality.id && styles.selectedPersonality,
                ]}
                onPress={() => setSelectedPersonality(personality.id)}>
                <Text style={styles.personalityName}>{personality.name}</Text>
                <Text style={styles.personalityDesc}>{personality.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.createButton, { marginBottom: insets.bottom + 16 }]}
        onPress={handleCreate}>
        <Text style={styles.createButtonText}>Begin Your Story</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'Lora-Bold',
    fontSize: 28,
    color: Colors.text.primary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 16,
    borderRadius: 75,
    padding: 4,
  },
  selectedAvatar: {
    backgroundColor: Colors.primary,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  personalityCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPersonality: {
    borderColor: Colors.primary,
  },
  personalityName: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  personalityDesc: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 16,
  },
  createButtonText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});