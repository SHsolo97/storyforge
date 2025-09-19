import { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Diamond, Ticket, Book } from 'lucide-react-native';

import DiamondCounter from '@/components/DiamondCounter';
import TicketCounter from '@/components/TicketCounter';
import Colors from '@/constants/Colors';

const DIAMOND_PACKAGES = [
  { id: '1', amount: 15, price: '$1.99', popular: false, bonus: 0 },
  { id: '2', amount: 45, price: '$4.99', popular: false, bonus: 0 },
  { id: '3', amount: 100, price: '$9.99', popular: true, bonus: 10 },
  { id: '4', amount: 250, price: '$19.99', popular: false, bonus: 35 },
  { id: '5', amount: 500, price: '$39.99', popular: false, bonus: 75 },
  { id: '6', amount: 1500, price: '$99.99', popular: false, bonus: 500 },
];

const TICKET_PACKAGES = [
  { id: '1', amount: 10, price: '$0.99', popular: false, bonus: 0 },
  { id: '2', amount: 30, price: '$2.99', popular: false, bonus: 0 },
  { id: '3', amount: 75, price: '$6.99', popular: true, bonus: 10 },
  { id: '4', amount: 200, price: '$14.99', popular: false, bonus: 25 },
];

const COMBO_DEALS = [
  { 
    id: '1', 
    diamonds: 100,
    tickets: 50,
    price: '$12.99',
    popular: true,
    savings: '25%'
  },
  { 
    id: '2', 
    diamonds: 250,
    tickets: 125,
    price: '$24.99',
    popular: false,
    savings: '30%'
  },
];

const BOOK_PASSES = [
  {
    id: '1',
    title: 'Romance Collection',
    books: 5,
    duration: '1 month',
    price: '$14.99',
    image: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg'
  },
  {
    id: '2',
    title: 'Fantasy Bundle',
    books: 8,
    duration: '2 months',
    price: '$19.99',
    image: 'https://images.pexels.com/photos/2099691/pexels-photo-2099691.jpeg'
  },
];

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'diamonds' | 'tickets' | 'combos' | 'passes'>('diamonds');

  function renderPackageItem({ item, index, type }: { item: any, index: number, type: string }) {
    const IconComponent = type === 'diamond' ? Diamond : Ticket;
    const color = type === 'diamond' ? Colors.accent : Colors.secondary;

    return (
      <Animated.View 
        entering={FadeInDown.delay(200 + index * 100).duration(500)}
        style={styles.packageItem}
      >
        <TouchableOpacity 
          style={[
            styles.packageCard,
            item.popular && styles.popularCard
          ]}
          activeOpacity={0.7}
        >
          {item.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>BEST VALUE</Text>
            </View>
          )}
          
          <View style={styles.packageContent}>
            <View style={styles.currencyContainer}>
              <IconComponent size={24} color={color} fill={color} />
              <Text style={[styles.currencyAmount, { color }]}>{item.amount}</Text>
            </View>
            
            {item.bonus > 0 && (
              <View style={styles.bonusContainer}>
                <Text style={styles.bonusText}>+{item.bonus} BONUS</Text>
              </View>
            )}
            
            <Text style={styles.packagePrice}>{item.price}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function renderComboItem({ item, index }: { item: any, index: number }) {
    return (
      <Animated.View 
        entering={FadeInDown.delay(200 + index * 100).duration(500)}
        style={styles.packageItem}
      >
        <TouchableOpacity 
          style={[
            styles.packageCard,
            item.popular && styles.popularCard
          ]}
          activeOpacity={0.7}
        >
          {item.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>BEST VALUE</Text>
            </View>
          )}
          
          <View style={styles.comboContent}>
            <View style={styles.comboRow}>
              <View style={styles.comboCurrency}>
                <Diamond size={20} color={Colors.accent} fill={Colors.accent} />
                <Text style={[styles.comboAmount, { color: Colors.accent }]}>{item.diamonds}</Text>
              </View>
              <Text style={styles.comboPlus}>+</Text>
              <View style={styles.comboCurrency}>
                <Ticket size={20} color={Colors.secondary} fill={Colors.secondary} />
                <Text style={[styles.comboAmount, { color: Colors.secondary }]}>{item.tickets}</Text>
              </View>
            </View>
            
            <View style={styles.comboDetails}>
              <Text style={styles.packagePrice}>{item.price}</Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>SAVE {item.savings}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function renderBookPass({ item, index }: { item: any, index: number }) {
    return (
      <Animated.View 
        entering={FadeInDown.delay(200 + index * 100).duration(500)}
        style={styles.passItem}
      >
        <TouchableOpacity 
          style={styles.passCard}
          activeOpacity={0.7}
        >
          <Image source={{ uri: item.image }} style={styles.passImage} />
          <View style={styles.passContent}>
            <Text style={styles.passTitle}>{item.title}</Text>
            <View style={styles.passDetails}>
              <View style={styles.passInfo}>
                <Book size={16} color={Colors.text.secondary} />
                <Text style={styles.passInfoText}>{item.books} Books</Text>
              </View>
              <View style={styles.passInfo}>
                <Text style={styles.passDuration}>{item.duration}</Text>
              </View>
            </View>
            <Text style={styles.passPrice}>{item.price}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Store</Text>
        <View style={styles.headerCurrency}>
          <DiamondCounter count={125} />
          <TicketCounter count={45} />
        </View>
      </View>

      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'diamonds' && styles.activeTab]}
            onPress={() => setActiveTab('diamonds')}
          >
            <Diamond size={16} color={activeTab === 'diamonds' ? Colors.primary : Colors.text.secondary} />
            <Text style={[styles.tabText, activeTab === 'diamonds' && styles.activeTabText]}>Diamonds</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
            onPress={() => setActiveTab('tickets')}
          >
            <Ticket size={16} color={activeTab === 'tickets' ? Colors.primary : Colors.text.secondary} />
            <Text style={[styles.tabText, activeTab === 'tickets' && styles.activeTabText]}>Tickets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'combos' && styles.activeTab]}
            onPress={() => setActiveTab('combos')}
          >
            <Text style={[styles.tabText, activeTab === 'combos' && styles.activeTabText]}>Combo Deals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'passes' && styles.activeTab]}
            onPress={() => setActiveTab('passes')}
          >
            <Book size={16} color={activeTab === 'passes' ? Colors.primary : Colors.text.secondary} />
            <Text style={[styles.tabText, activeTab === 'passes' && styles.activeTabText]}>Book Passes</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'diamonds' && (
          <FlatList
            data={DIAMOND_PACKAGES}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderPackageItem({ item, index, type: 'diamond' })}
            scrollEnabled={false}
          />
        )}
        
        {activeTab === 'tickets' && (
          <FlatList
            data={TICKET_PACKAGES}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => renderPackageItem({ item, index, type: 'ticket' })}
            scrollEnabled={false}
          />
        )}
        
        {activeTab === 'combos' && (
          <FlatList
            data={COMBO_DEALS}
            keyExtractor={(item) => item.id}
            renderItem={renderComboItem}
            scrollEnabled={false}
          />
        )}
        
        {activeTab === 'passes' && (
          <FlatList
            data={BOOK_PASSES}
            keyExtractor={(item) => item.id}
            renderItem={renderBookPass}
            scrollEnabled={false}
          />
        )}
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
  headerCurrency: {
    flexDirection: 'row',
    gap: 8,
  },
  tabs: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
  },
  activeTab: {
    backgroundColor: `${Colors.primary}20`,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  packageItem: {
    marginBottom: 16,
  },
  packageCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  popularCard: {
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  popularText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: Colors.text.primary,
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyAmount: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 20,
    marginLeft: 8,
  },
  bonusContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bonusText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 10,
    color: Colors.accent,
  },
  packagePrice: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
  comboContent: {
    alignItems: 'center',
  },
  comboRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comboCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  comboAmount: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    marginLeft: 4,
  },
  comboPlus: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.secondary,
    marginHorizontal: 12,
  },
  comboDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  savingsBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  savingsText: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
    color: Colors.success,
  },
  passItem: {
    marginBottom: 16,
  },
  passCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  passContent: {
    padding: 16,
  },
  passTitle: {
    fontFamily: 'Lora-Bold',
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  passDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  passInfoText: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  passDuration: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  passPrice: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 18,
    color: Colors.text.primary,
  },
});