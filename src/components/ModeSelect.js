import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { colors } from '../theme';

export default function ModeSelect({ value = 'paulista', onChange }) {
  const [open, setOpen] = useState(false);
  const currentLabel = value === 'paulista' ? 'Truco Paulista' : 'Truco Mineiro';

  function Option({ val, label }) {
    const active = value === val;
    return (
      <TouchableOpacity
        onPress={() => { onChange?.(val); setOpen(false); }}
        style={[styles.option, active && styles.optionActive]}
        activeOpacity={0.8}
      >
        <Text style={[styles.optionText, active && styles.optionTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Botão “fechado” (não altera layout) */}
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.triggerLabel}>Modo</Text>
        <View style={styles.triggerValueWrap}>
          <Text style={styles.triggerValue}>{currentLabel}</Text>
          <Text style={styles.chevron}>▼</Text>
        </View>
      </TouchableOpacity>

      {/* Pop-up (Modal) que não empurra o layout */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Fundo escuro clicável para fechar */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        {/* Caixa central com as opções */}
        <View style={styles.modalCenter}>
          <View style={styles.dropdownCard}>
            <Text style={styles.dropdownTitle}>Selecionar modo</Text>
            <Option val="paulista" label="Truco Paulista" />
            <Option val="mineiro"  label="Truco Mineiro" />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
              <Text style={styles.closeTxt}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { zIndex: 1 },

  // Botão que mostra o valor atual (fica como antes)
  trigger: {
    backgroundColor: colors.card,
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  triggerLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  triggerValueWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  triggerValue: { color: colors.text, fontSize: 14, fontWeight: '700' },
  chevron: { color: colors.text, opacity: 0.8 },

  // Modal
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropdownCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.card,
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  dropdownTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  option: { paddingVertical: 14, paddingHorizontal: 12 },
  optionActive: { backgroundColor: '#0f172a' },
  optionText: { color: colors.text, fontSize: 16 },
  optionTextActive: { color: colors.primary, fontWeight: '800' },

  closeBtn: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#111827',
  },
  closeTxt: { color: colors.text, fontWeight: '700' },
});
