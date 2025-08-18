import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../theme';
import FakeBanner from '../components/FakeBanner';

export default function ScoreboardScreen({ route, navigation }) {
  const target = route.params?.target ?? 12;
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    navigation.setOptions({ title: `Placar (${target})` });
  }, [target]);

  useEffect(() => {
    if (!winner && (a >= target || b >= target)) {
      const team = a >= target ? 'Time A' : 'Time B';
      setWinner(team);
      Alert.alert('Fim de jogo', `${team} venceu!`, [
        { text: 'Nova partida', onPress: reset },
        { text: 'OK' },
      ]);
    }
  }, [a, b, winner, target]);

  const inc = (team) => {
    if (!winner) {
      team === 'A' ? setA((v) => v + 1) : setB((v) => v + 1);
    }
  };

  const dec = (team) => {
    if (!winner) {
      team === 'A'
        ? setA((v) => Math.max(0, v - 1))
        : setB((v) => Math.max(0, v - 1));
    }
  };

  const reset = () => { setA(0); setB(0); setWinner(null); };

  const Card = ({ label, score, onPlus, onMinus, accent }) => (
    <View style={[styles.card, accent && { borderColor: colors.primary }]}> 
      <Text style={styles.cardLabel}>{label}</Text>
      <TouchableOpacity style={[styles.btnHuge, styles.btnPlus]} onPress={onPlus}>
        <Text style={styles.btnText}>+1</Text>
      </TouchableOpacity>
      <Text style={styles.score}>{score}</Text>
      <TouchableOpacity style={[styles.btnHuge, styles.btnMinus]} onPress={onMinus}>
        <Text style={styles.btnText}>-1</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}> 
        <TouchableOpacity style={styles.resetBtn} onPress={() => {
          if (a === 0 && b === 0) return; 
          Alert.alert('Reiniciar partida', 'Tem certeza que deseja zerar o placar?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Zerar', style: 'destructive', onPress: reset },
          ]);
        }}>
          <Text style={styles.reset}>Zerar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <Card label="Time A" score={a} onPlus={() => inc('A')} onMinus={() => dec('A')} accent />
        <Card label="Time B" score={b} onPlus={() => inc('B')} onMinus={() => dec('B')} />
      </View>

      <View style={styles.footer}>
        <FakeBanner />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  resetBtn: { backgroundColor: colors.danger, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 18, width: '100%', alignItems: 'center' },
  reset: { color: '#fff', fontWeight: '800', fontSize: 20 },

  grid: { flex: 1, flexDirection: 'row', gap: 12 },

  card: { flex: 1, backgroundColor: colors.card, borderRadius: 24, padding: 20, borderWidth: 2, borderColor: '#1F2937', justifyContent: 'center', alignItems: 'center' },
  cardLabel: { color: colors.muted, marginBottom: 16, textAlign: 'center', fontSize: 20, fontWeight: '700' },
  score: { color: colors.text, fontSize: 90, fontWeight: '900', textAlign: 'center', marginVertical: 24 },

  btnHuge: { width: '85%', paddingVertical: 60, borderRadius: 20, alignItems: 'center', marginVertical: 16 },
  btnPlus: { backgroundColor: colors.primary },
  btnMinus: { backgroundColor: '#374151' },
  btnText: { color: '#051B11', fontWeight: '900', fontSize: 32 },

  footer: { marginTop: 8 },
});