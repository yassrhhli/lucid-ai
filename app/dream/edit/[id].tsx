import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDreams } from '@/hooks/useDreams';
import { EmotionPicker } from '@/components/dream/EmotionPicker';
import { SleepQualitySlider } from '@/components/dream/SleepQualitySlider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showErrorAlert } from '@/utils/errorHandler';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { checkRateLimit } from '@/utils/rateLimit';
import { sanitizeDreamContent, sanitizeTitle } from '@/utils/sanitize';
import { haptics } from '@/utils/haptics';
import type { Emotion, SleepQuality } from '@/types/dream';

export default function EditDreamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDreamById, updateDream } = useDreams();
  const dream = getDreamById(id);

  const [isSaving, setIsSaving] = useState(false);

  // State initialisé depuis le rêve existant
  const [title, setTitle] = useState(dream?.title ?? '');
  const [content, setContent] = useState(dream?.content ?? '');
  const [emotions, setEmotions] = useState<Emotion[]>((dream?.emotions ?? []) as Emotion[]);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(
    (dream?.sleep_quality as SleepQuality) ?? null
  );
  const [isLucid, setIsLucid] = useState(dream?.is_lucid ?? false);
  const [isRecurring, setIsRecurring] = useState(dream?.is_recurring ?? false);
  const [isPublic, setIsPublic] = useState(dream?.is_public ?? false);

  if (!dream) return <LoadingSpinner fullScreen />;

  const handleSave = async () => {
    if (!checkRateLimit(`updateDream:${dream.id}`, 1, 3000)) return;
    const cleanContent = sanitizeDreamContent(content);
    if (!cleanContent) {
      Alert.alert('Empty Dream', 'Dream content cannot be empty.');
      return;
    }
    setIsSaving(true);
    try {
      await updateDream(dream.id, {
        title: sanitizeTitle(title) || undefined,
        content: cleanContent,
        emotions,
        sleep_quality: sleepQuality ?? undefined,
        is_lucid: isLucid,
        is_recurring: isRecurring,
        is_public: isPublic,
      });
      router.back();
    } catch (error) {
      showErrorAlert(error, 'Save Failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => { haptics.light(); router.back(); }}
            style={styles.cancelBtn}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Dream</Text>
          <TouchableOpacity
            onPress={() => { haptics.light(); handleSave(); }}
            disabled={isSaving}
            style={styles.saveBtn}
            accessibilityLabel="Save changes"
            accessibilityRole="button"
            accessibilityState={{ disabled: isSaving }}
          >
            {isSaving
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Text style={styles.saveText}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Title (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            accessibilityLabel="Dream title"
          />

          <View style={styles.divider} />

          <Text style={styles.inputLabel}>Your Dream</Text>
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholder="Your dream..."
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Dream content"
          />

          <View style={styles.divider} />

          <EmotionPicker selected={emotions} onChange={setEmotions} />

          <View style={styles.divider} />

          <SleepQualitySlider value={sleepQuality} onChange={setSleepQuality} />

          <View style={styles.divider} />

          <View style={styles.togglesCard}>
            {[
              { key: 'lucid',     icon: 'sparkles' as const, iconColor: COLORS.accent, label: 'Lucid Dream',       value: isLucid,     onChange: setIsLucid     },
              { key: 'recurring', icon: 'refresh' as const,  iconColor: COLORS.gold,   label: 'Recurring Dream',   value: isRecurring, onChange: setIsRecurring },
              { key: 'public',    icon: 'people' as const,   iconColor: COLORS.teal,   label: 'Share Anonymously', value: isPublic,    onChange: setIsPublic, last: true },
            ].map(({ key, icon, iconColor, label, value, onChange, last }) => (
              <View key={key} style={[styles.toggleRow, !last && styles.toggleBorder]}>
                <View style={styles.toggleLabelRow}>
                  <Ionicons name={icon} size={16} color={iconColor} />
                  <Text style={styles.toggleLabel}>{label}</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={(v) => { haptics.selection(); onChange(v); }}
                  trackColor={{ false: COLORS.borderSubtle, true: COLORS.primary + 'AA' }}
                  thumbColor={value ? '#fff' : COLORS.textMuted}
                  ios_backgroundColor={COLORS.borderSubtle}
                />
              </View>
            ))}
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelBtn: { minWidth: 44, minHeight: 44, justifyContent: 'center' },
  cancelText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  saveBtn: { minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  saveText: { color: COLORS.primary, fontSize: FONT_SIZES.md, fontWeight: '700' },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  titleInput: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  inputLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: SPACING.xs, textTransform: 'uppercase' },
  contentInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 180,
    paddingTop: 0,
  },
  togglesCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderSubtle, overflow: 'hidden' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  toggleLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  toggleLabel: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
});
