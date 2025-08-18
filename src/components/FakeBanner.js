import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FakeBanner() {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>[Banner de anúncio simulado]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#374151',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  text: { color: '#9CA3AF', fontSize: 12 }
});