import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const SYMBOLS = [
  { symbol: 'Flying', meaning: 'Desire for freedom, escape from constraints, ambition or fear of failure.', category: 'Action' },
  { symbol: 'Falling', meaning: 'Loss of control, anxiety, fear of failure or letting go.', category: 'Action' },
  { symbol: 'Water', meaning: 'Emotions, the unconscious mind, purification or overwhelming feelings.', category: 'Nature' },
  { symbol: 'Fire', meaning: 'Passion, transformation, destruction or purification. Can signal intense emotion.', category: 'Nature' },
  { symbol: 'House', meaning: 'The self or psyche. Different rooms represent different aspects of your mind.', category: 'Place' },
  { symbol: 'Snake', meaning: 'Transformation, hidden fears, wisdom or deception depending on context.', category: 'Animal' },
  { symbol: 'Death', meaning: 'Endings and new beginnings, transformation, rarely literal.', category: 'Event' },
  { symbol: 'Teeth falling', meaning: 'Anxiety about appearance, fear of loss, communication issues.', category: 'Body' },
  { symbol: 'Being chased', meaning: 'Avoidance of a problem or person, running from your own emotions.', category: 'Action' },
  { symbol: 'Ocean', meaning: 'The vast unconscious, depth of emotions, mystery or overwhelm.', category: 'Nature' },
  { symbol: 'Baby', meaning: 'New beginnings, vulnerability, a new project or idea being born.', category: 'Person' },
  { symbol: 'Car', meaning: 'Your drive and direction in life. Who is driving reflects who is in control.', category: 'Object' },
  { symbol: 'School', meaning: 'Learning, past anxieties, feeling tested or judged by others.', category: 'Place' },
  { symbol: 'Mirror', meaning: 'Self-reflection, identity, how you see yourself vs how others see you.', category: 'Object' },
  { symbol: 'Forest', meaning: 'The unknown, the unconscious, exploration or feeling lost.', category: 'Nature' },
  { symbol: 'Bridge', meaning: 'Transition between two states, crossing into the unknown, change.', category: 'Place' },
  { symbol: 'Moon', meaning: 'Intuition, the feminine, cycles, mystery and the subconscious.', category: 'Nature' },
  { symbol: 'Dog', meaning: 'Loyalty, friendship, instincts. An aggressive dog may signal inner conflict.', category: 'Animal' },
  { symbol: 'Running', meaning: 'Urgency, pursuit of goals, or escape. Speed reflects emotional intensity.', category: 'Action' },
  { symbol: 'Light', meaning: 'Clarity, truth, hope or spiritual awakening.', category: 'Nature' },
];

const CATEGORIES = ['All', 'Action', 'Nature', 'Place', 'Animal', 'Object', 'Person', 'Body', 'Event'];

export default function DictionaryScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = SYMBOLS.filter(s => {
    const matchSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.meaning.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || s.category === category;
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Dream Dictionary</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={16} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search symbols..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}>
          <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity> : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: 8 }}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={[styles.catChip, category === cat && styles.catChipActive]}>
            <Text style={[styles.catLabel, category === cat && styles.catLabelActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} contentContainerStyle={{ padding: SPACING.md, gap: SPACING.sm }}>
        <Text style={styles.count}>{filtered.length} symbols</Text>
        {filtered.map((item, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.symbolName}>{item.symbol}</Text>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{item.category}</Text>
              </View>
            </View>
            <Text style={styles.symbolMeaning}>{item.meaning}</Text>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.md, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: 10, gap: 8, marginBottom: SPACING.sm },
  searchInput: { flex: 1, color: COLORS.text, fontSize: FONT_SIZES.sm },
  categories: { maxHeight: 44, marginBottom: SPACING.sm },
  catChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '500' },
  catLabelActive: { color: '#fff' },
  list: { flex: 1 },
  count: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  symbolName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  catBadge: { backgroundColor: COLORS.primary + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  catBadgeText: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  symbolMeaning: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
});
