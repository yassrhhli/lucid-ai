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
import { useDreams } from '@/hooks/useDreams';
import { EmotionPicker } from '@/components/dream/EmotionPicker';
import { SleepQualitySlider } from '@/components/dream/SleepQualitySlider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showErrorAlert } from '@/utils/errorHandler';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { checkRateLimit } from '@/utils/rateLimit';
import { sanitizeDreamContent, sanitizeTitle } from '@/utils/sanitize';
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
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn} accessibilityLabel="Cancel" accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Dream</Text>
          <TouchableOpacity onPress={handleSave} disabled={isSaving} style={styles.saveBtn}>
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

          {[
            { key: 'lucid', label: '✨ Lucid Dream', value: isLucid, onChange: setIsLucid },
            { key: 'recurring', label: '🔄 Recurring', value: isRecurring, onChange: setIsRecurring },
            { key: 'public', label: 'Share Anonymously', value: isPublic, onChange: setIsPublic },
          ].map(({ key, label, value, onChange }) => (
            <View key={key} style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{label}</Text>
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                thumbColor={value ? COLORS.primary : COLORS.textMuted}
              />
            </View>
          ))}

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
  cancelBtn: { padding: SPACING.xs },
  cancelText: { color: COLORS.textMuted, fontSize: FONT_SIZES.md },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  saveBtn: { padding: SPACING.xs },
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  toggleLabel: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
});
