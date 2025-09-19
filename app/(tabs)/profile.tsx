import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Settings, LogOut, Bell, BookOpen, Award, Diamond } from 'lucide-react-native';

import DiamondCounter from '@/components/DiamondCounter';
import Colors from '@/constants/Colors';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const user = {
    name: 'Emma Wilson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    stats: {
      storiesCompleted: 12,
      chaptersRead: 154,
      diamondsSpent: 1345,
      achievements: 8
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.profileSection}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
          <DiamondCounter count={125} size="large" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={styles.sectionTitle}>Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <BookOpen size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{user.stats.storiesCompleted}</Text>
              <Text style={styles.statLabel}>Stories Completed</Text>
            </View>
            
            <View style={styles.statItem}>
              <Award size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{user.stats.achievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
            
            <View style={styles.statItem}>
              <Diamond size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{user.stats.diamondsSpent}</Text>
              <Text style={styles.statLabel}>Diamonds Spent</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Account Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Notification Preferences</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Privacy Policy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <TouchableOpacity style={styles.signOutButton}>
            <LogOut size={18} color={Colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 22,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginVertical: 8,
  },
  statLabel: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.text.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 16,
    color: Colors.error,
    marginLeft: 8,
  }
});