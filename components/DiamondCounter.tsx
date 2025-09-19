import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Diamond } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface DiamondCounterProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export default function DiamondCounter({ 
  count, 
  size = 'medium',
  onPress
}: DiamondCounterProps) {
  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      diamond: 16,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      diamond: 20,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      diamond: 24,
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
      <Diamond
        size={sizeStyles[size].diamond}
        color={Colors.accent}
        fill={Colors.accent}
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
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
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
    color: Colors.accent,
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