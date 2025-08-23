import React, { useState, useEffect, memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Keyboard,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import FakeBanner from '../components/FakeBanner';
import ModeSelect from '../components/ModeSelect'; // dropdown (abre em pop-up)

/**
 * Campo de nome do time com estado local durante a edição.
 * - Evita perder foco quando o pai re-renderiza
 * - Só confirma mudança no onBlur (ou quando usuário fecha o teclado)
 */
const TeamNameInput = memo(function TeamNameInput({
  value,
  onSubmit,
  placeholder,
}) {
  const [text, setText] = useState(value);
  const [editing, setEditing] = useState(false);

  // Se o valor vindo de fora mudar e NÃO estamos editando, refletir
  useEffect(() => {
    if (!editing) setText(value);
  }, [value, editing]);

  return (
    <TextInput
      style={styles.teamInput}
      value={editing ? text : value} // durante edição, usa estado local
      onChangeText={(t) => setText(t)}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      maxLength={20}
      autoCorrect={false}
      autoComplete="off"
      textContentType="none"
      returnKeyType="done"
      blurOnSubmit={false}
      disableFullscreenUI
      importantForAutofill="no"
      onFocus={() => {
        setEditing(true);
        setText(value); // inicia edição com o valor atual
      }}
      onBlur={() => {
        setEditing(false);
        if (text !== value) onSubmit?.(text);
      }}
      onSubmitEditing={() => Keyboard.dismiss()}
    />
  );
});

export default function ScoreboardScreen({ route, navigation }) {
  // ====== Modo e meta ======
  const [mode, setMode] = useState('paulista'); // 'paulista' | 'mineiro'
  const target = mode === 'paulista' ? 12 : 12; // ajuste se quiser meta diferente por modo

  // ====== Placar ======
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [winner, setWinner] = useState(null);

  // ====== Nomes (editáveis) ======
  const [teamAName, setTeamAName] = useState('Time A');
  const [teamBName, setTeamBName] = useState('Time B');

  // ====== Troféus ======
  const [trophiesA, setTrophiesA] = useState(0);
  const [trophiesB, setTrophiesB] = useState(0);

  // ====== TRUCO ======
  // stake: null | 3 | 6 | 12
  // caller: 'A' | 'B'
  const [stake, setStake] = useState(null);
  const [caller, setCaller] = useState(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    navigation?.setOptions?.({ title: 'Placar' });
  }, []);

  // Detecta vencedor da PARTIDA (atingiu meta)
  // ⚠️ NÃO depende dos nomes aqui, para não causar re-renders durante digitação
  useEffect(() => {
    if (!winner && (a >= target || b >= target)) {
      const team = a >= target ? teamAName : teamBName;
      setWinner(team);
      if (team === teamAName) setTrophiesA((t) => t + 1);
      if (team === teamBName) setTrophiesB((t) => t + 1);

      Alert.alert('Fim de jogo', `${team} venceu!`, [
        { text: 'Nova partida', onPress: resetOnlyPoints },
        { text: 'OK' },
      ]);
    }
  }, [a, b, winner, target]); // nomes removidos

  // Pontos normais
  const inc = (team) => {
    if (winner) return;
    team === 'A' ? setA((v) => v + 1) : setB((v) => v + 1);
  };
  const dec = (team) => {
    if (winner) return;
    team === 'A' ? setA((v) => Math.max(0, v - 1)) : setB((v) => Math.max(0, v - 1));
  };

  // Reset
  const resetOnlyPoints = () => {
    setA(0); setB(0); setWinner(null);
    setStake(null); setCaller(null);
  };
  const resetAll = () => {
    resetOnlyPoints();
    setTrophiesA(0); setTrophiesB(0);
  };

  // TRUCO: ciclo 3 → 6 → 12 → desativa
  const cycleStake = (byTeam) => {
    if (winner) return;
    if (!stake || caller !== byTeam) { setStake(3); setCaller(byTeam); return; }
    if (stake === 3) { setStake(6); return; }
    if (stake === 6) { setStake(12); return; }
    setStake(null); setCaller(null);
  };

  // Resolver TRUCO (vitória): soma stake para o lado vencedor
  const resolveWin = (winTeam) => {
    if (!stake || !caller) return;
    if (winTeam === 'A') setA((v) => v + stake);
    if (winTeam === 'B') setB((v) => v + stake);
    setStake(null); setCaller(null);
  };

  // Correr do TRUCO — corrigido
  // quem corre perde; se caller correu, adversário ganha
  const runFromTruco = (whoRan) => {
    if (!stake || !caller) return;
    const opponent = whoRan === 'A' ? 'B' : 'A';
    const winnerTeam = (whoRan === caller) ? opponent : caller;

    if (winnerTeam === 'A') setA((v) => v + stake);
    else setB((v) => v + stake);

    setStake(null);
    setCaller(null);
  };

  // Botão + vira +{stake} quando truco ativo (sem mudar layout)
  const getPlusLabel = () => (stake ? `+${stake}` : '+1');
  const onPlusPressFor = (side) => (stake ? () => resolveWin(side) : () => inc(side));

  // Card de time
  const Card = ({ score, onMinus, accent, side }) => (
    <View style={[styles.card, accent && { borderColor: colors.primary }]}>
      {/* Cabeçalho com nome (editável) e troféus */}
      <View style={styles.heading}>
        <TeamNameInput
          value={side === 'A' ? teamAName : teamBName}
          onSubmit={side === 'A' ? setTeamAName : setTeamBName}
          placeholder={side === 'A' ? 'Time A' : 'Time B'}
        />
        <Text style={styles.trophies}>🏆 {side === 'A' ? trophiesA : trophiesB}</Text>
      </View>

      {/* Botão TRUCO */}
      <TouchableOpacity
        style={[styles.trucoBtn, caller === side && styles.trucoBtnActive]}
        onPress={() => cycleStake(side)}
      >
        <Text style={styles.trucoBtnText}>
          {caller === side && stake ? `TRUCO ${stake}` : 'TRUCO'}
        </Text>
      </TouchableOpacity>

      {/* + / score / - */}
      <TouchableOpacity style={[styles.btnHuge, styles.btnPlus]} onPress={onPlusPressFor(side)}>
        <Text style={styles.btnText}>{getPlusLabel()}</Text>
      </TouchableOpacity>

      <Text style={styles.score}>{score}</Text>

      <TouchableOpacity style={[styles.btnHuge, styles.btnMinus]} onPress={onMinus}>
        <Text style={styles.btnText}>-1</Text>
      </TouchableOpacity>

      {/* Correr (vermelho) */}
      {stake && caller && (
        <View style={styles.runRow}>
          <TouchableOpacity style={[styles.runBtn, styles.runRed]} onPress={() => runFromTruco(side)}>
            <Text style={styles.runTxt}>Correr</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
      >
        {/* Seletor de modo (pop-up) */}
        <View style={styles.selectorWrap}>
          <ModeSelect value={mode} onChange={setMode} />
        </View>

        {/* Ações: Zerar placar / Zerar troféus */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: colors.danger }]}
            onPress={() => {
              if (a === 0 && b === 0 && !stake) return;
              Alert.alert('Reiniciar partida', 'Zerar o placar atual?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Zerar', style: 'destructive', onPress: resetOnlyPoints },
              ]);
            }}
          >
            <Text style={styles.resetTxt}>Zerar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetBtn, { backgroundColor: '#6B7280' }]}
            onPress={() => {
              if (trophiesA === 0 && trophiesB === 0) return;
              Alert.alert('Zerar troféus', 'Deseja zerar os troféus de ambos os times?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Zerar troféus', style: 'destructive', onPress: resetAll },
              ]);
            }}
          >
            <Text style={styles.resetTxt}>Zerar Troféus</Text>
          </TouchableOpacity>
        </View>

        {/* Placar */}
        <View style={styles.grid}>
          <Card score={a} onMinus={() => dec('A')} accent side="A" />
          <Card score={b} onMinus={() => dec('B')} side="B" />
        </View>

        <View style={styles.footer}>
          <FakeBanner />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.bg, paddingHorizontal: 16, paddingBottom: 8, flexGrow: 1 },

  selectorWrap: { marginBottom: 12 },

  actionsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  resetBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  resetTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },

  grid: { flex: 1, flexDirection: 'row', gap: 12 },

  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 2,
    borderColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Cabeçalho do card
  heading: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  teamInput: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: '#0b1220',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trophies: { color: colors.text, fontSize: 16, fontWeight: '700' },

  // Botão TRUCO
  trucoBtn: {
    width: '85%',
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0f172a',
    marginBottom: 10,
  },
  trucoBtnActive: { backgroundColor: '#1f2937', borderColor: colors.primary },
  trucoBtnText: { color: colors.text, fontWeight: '800' },

  // Placar e botões gigantes
  score: { color: colors.text, fontSize: 90, fontWeight: '900', textAlign: 'center', marginVertical: 18 },

  btnHuge: { width: '85%', paddingVertical: 50, borderRadius: 20, alignItems: 'center', marginVertical: 12 },
  btnPlus: { backgroundColor: colors.primary },
  btnMinus: { backgroundColor: '#374151' },
  btnText: { color: '#051B11', fontWeight: '900', fontSize: 32 },

  // Correr (vermelho)
  runRow: { marginTop: 8, width: '85%' },
  runBtn: { paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  runRed: { backgroundColor: colors.danger },
  runTxt: { color: '#fff', fontWeight: '800' },

  footer: { marginTop: 8 },
});
