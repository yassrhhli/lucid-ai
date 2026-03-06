import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Share } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useDreams } from '@/hooks/useDreams';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { InterpretationCard } from '@/components/dream/InterpretationCard';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const QUALITY_LABEL: Record<number, string> = {
  1: '😩 Terrible', 2: '😞 Poor', 3: '😐 Ok', 4: '😊 Good', 5: '🤩 Amazing',
};
const EMOTION_EMOJI: Record<string, string> = {
  joy: '😄', fear: '😨', anxiety: '😰', peace: '😌',
  sadness: '😢', excitement: '🤩', confusion: '😵',
  anger: '😡', love: '🥰', wonder: '🌟',
};

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDreamById, deleteDream } = useDreams();
  const [isDeleting, setIsDeleting] = useState(false);
  const dream = getDreamById(id);

  if (!dream) return <LoadingSpinner fullScreen label="Loading dream..." />;

  const interpretation = dream.interpretation;

  const handleDelete = () => {
    Alert.alert('Delete Dream', 'This will permanently delete this dream.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try { await deleteDream(dream.id); router.back(); }
          catch { setIsDeleting(false); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => Share.share({ message: dream.content.slice(0, 280) + '...\n\n— LUCID.AI 🌙' })}>
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push(`/dream/edit/${dream.id}`)}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.date}>🌙 {format(new Date(dream.dream_date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}</Text>

        <View style={styles.badges}>
          {dream.is_lucid && <View style={styles.badge}><Text style={styles.badgeText}>✨ Lucid</Text></View>}
          {dream.is_recurring && <View style={[styles.badge, styles.badgeGold]}><Text style={styles.badgeText}>🔄 Recurring</Text></View>}
        </View>

        {dream.title && <Text style={styles.title}>{dream.title}</Text>}

        <View style={styles.contentCard}>
          <Text style={styles.content}>{dream.content}</Text>
        </View>

        <View style={styles.detailsRow}>
          {dream.sleep_quality && (
            <View style={styles.detailPill}>
              <Text style={styles.detailLabel}>Sleep</Text>
              <Text style={styles.detailValue}>{QUALITY_LABEL[dream.sleep_quality]}</Text>
            </View>
          )}
          {dream.emotions.length > 0 && (
            <View style={styles.detailPill}>
              <Text style={styles.detailLabel}>Emotions</Text>
              <Text style={styles.detailValue}>{dream.emotions.map(e => EMOTION_EMOJI[e]).join(' ')}</Text>
            </View>
          )}
        </View>

        {dream.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {dream.tags.map(tag => (
              <View key={tag} style={styles.tag}><Text style={styles.tagText}>#{tag}</Text></View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* INTERPRÉTATION IA */}
        {interpretation ? (
          <View style={styles.interpretationSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🤖 AI Interpretation</Text>
              <Text style={styles.sectionMeta}>{interpretation.model_used}</Text>
            </View>

            {interpretation.symbols?.length > 0 && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>✦ Key Symbols</Text>
                {interpretation.symbols.map((sym, i) => (
                  <View key={i} style={[styles.symbolRow, i < interpretation.symbols.length - 1 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                      <Text style={styles.symbolName}>{sym.name}</Text>
                      {sym.archetype && (
                        <View style={styles.archetypePill}><Text style={styles.archetypeText}>{sym.archetype}</Text></View>
                      )}
                    </View>
                    <Text style={styles.symbolMeaning}>{sym.meaning}</Text>
                  </View>
                ))}
              </View>
            )}

            {interpretation.emotional_analysis && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>💜 Emotional Landscape</Text>
                <Text style={styles.blockText}>{interpretation.emotional_analysis}</Text>
              </View>
            )}

            {interpretation.psychological_insight && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>🧠 Psychological Insight</Text>
                <Text style={styles.blockText}>{interpretation.psychological_insight}</Text>
              </View>
            )}

            {interpretation.archetypes?.length > 0 && (
              <View style={styles.block}>
                <Text style={styles.blockTitle}>⚡ Archetypes</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
                  {interpretation.archetypes.map(a => (
                    <View key={a} style={styles.archetypePillLarge}>
                      <Text style={styles.archetypeTextLarge}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {interpretation.affirmation && (
              <View style={styles.affirmationCard}>
                <Text style={styles.affirmationLabel}>✨ TODAY'S AFFIRMATION</Text>
                <Text style={styles.affirmation}>"{interpretation.affirmation}"</Text>
              </View>
            )}
          </View>
        ) : (
          <InterpretationCard dream={dream} />
        )}

        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} disabled={isDeleting}>
          <Text style={styles.deleteText}>{isDeleting ? 'Deleting...' : '🗑 Delete Dream'}</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '500', padding: SPACING.xs },
  headerActions: { flexDirection: 'row', gap: SPACING.md },
  actionText: { color: COLORS.primary, fontSize: FONT_SIZES.sm, fontWeight: '500', padding: SPACING.xs },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  date: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.xs },
  badges: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full, backgroundColor: COLORS.primary + '22', borderWidth: 1, borderColor: COLORS.primary + '44' },
  badgeGold: { backgroundColor: COLORS.gold + '22', borderColor: COLORS.gold + '44' },
  badgeText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md, lineHeight: 32 },
  contentCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  content: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, lineHeight: 26 },
  detailsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  detailPill: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  detailLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginBottom: 2 },
  detailValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginBottom: SPACING.md },
  tag: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  tagText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.lg },
  interpretationSection: { gap: SPACING.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '800', color: COLORS.text },
  sectionMeta: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  block: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  blockTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  blockText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
  symbolRow: { gap: 6, paddingBottom: SPACING.sm, marginBottom: SPACING.xs },
  symbolName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  archetypePill: { backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2 },
  archetypeText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  symbolMeaning: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  archetypePillLarge: { backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1, borderColor: COLORS.primary + '44' },
  archetypeTextLarge: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  affirmationCard: { backgroundColor: COLORS.primary + '11', borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.primary + '33', alignItems: 'center', gap: SPACING.sm },
  affirmationLabel: { fontSize: FONT_SIZES.xs, color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '600' },
  affirmation: { fontSize: FONT_SIZES.lg, color: COLORS.text, fontStyle: 'italic', textAlign: 'center', lineHeight: 28 },
  deleteBtn: { marginTop: SPACING.xl, alignItems: 'center', padding: SPACING.md },
  deleteText: { color: COLORS.error, fontSize: FONT_SIZES.sm, fontWeight: '500' },
});
