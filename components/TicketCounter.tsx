import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ticket } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface TicketCounterProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export default function TicketCounter({ 
  count, 
  size = 'medium',
  onPress
}: TicketCounterProps) {
  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      icon: 16,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      icon: 20,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      icon: 24,
      text: styles.textLarge,
    }
  };
  
  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, activeOpacity: 0.7 } : {};
  
  return (
    <Wrapper
      style={[styles.container, sizeStyles[size].container]}
      {...wrapperProps}
    >
      <Ticket
        size={sizeStyles[size].icon}
        color={Colors.secondary}
        fill={Colors.secondary}
      />
      <Text style={[styles.text, sizeStyles[size].text]}>
        {count}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(69, 39, 160, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  containerSmall: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  containerMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    fontFamily: 'Montserrat-Bold',
    color: Colors.secondary,
    marginLeft: 4,
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
});