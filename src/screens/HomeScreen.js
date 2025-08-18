import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

const MODES = [
  { label: 'Truco (12 pts)', target: 12 },
  { label: 'Truco (15 pts)', target: 15 },
];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha o modo</Text>

      {MODES.map((m) => (
        <TouchableOpacity key={m.label} style={styles.card} onPress={() => navigation.navigate('Scoreboard', { target: m.target })}>
          <Text style={styles.cardText}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 20 },
  title: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 14, marginVertical: 6 },
  cardText: { color: colors.text, fontSize: 16 },
});