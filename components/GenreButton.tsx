import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Colors from '@/constants/Colors';

interface GenreButtonProps {
  title: string;
  selected: boolean;
  onPress: () => void;
  style?: object;
}

export default function GenreButton({ 
  title, 
  selected, 
  onPress,
  style = {}
}: GenreButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected ? styles.containerSelected : {},
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text 
        style={[
          styles.text,
          selected ? styles.textSelected : {}
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  containerSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  text: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },
  textSelected: {
    color: 'white',
  }
});