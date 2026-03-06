import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useDreams } from '@/hooks/useDreams';
import { EmotionPicker } from '@/components/dream/EmotionPicker';
import { SleepQualitySlider } from '@/components/dream/SleepQualitySlider';
import { Button } from '@/components/ui/Button';
import { showErrorAlert } from '@/utils/errorHandler';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { CONFIG } from '@/constants/config';
import type { Emotion, SleepQuality, DreamCreateInput } from '@/types/dream';

const SUGGESTED_TAGS = [
  'flying', 'falling', 'water', 'family', 'work', 'chase',
  'house', 'school', 'nature', 'animals', 'death', 'travel',
];

export default function NewDreamScreen() {
  const { createDream, isCreating } = useDreams();

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dreamDate, setDreamDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [sleepQuality, setSleepQuality] = useState<SleepQuality | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isLucid, setIsLucid] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const contentRef = useRef<TextInput>(null);
  const contentLength = content.length;
  const isOverLimit = contentLength > CONFIG.limits.maxDreamLength;

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const cleaned = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags((prev) => [...prev, cleaned]);
      setCustomTag('');
    }
  };

  const handleSave = useCallback(async () => {
    if (!content.trim()) {
      Alert.alert('Empty Dream', 'Please describe your dream before saving.');
      return;
    }
    if (isOverLimit) {
      Alert.alert('Too Long', `Maximum ${CONFIG.limits.maxDreamLength} characters.`);
      return;
    }

    const input: DreamCreateInput = {
      title: title.trim() || undefined,
      content: content.trim(),
      dream_date: dreamDate,
      sleep_quality: sleepQuality ?? undefined,
      emotions,
      tags,
      is_lucid: isLucid,
      is_recurring: isRecurring,
      is_public: isPublic,
    };

    try {
      const newDream = await createDream(input);
      // Naviguer vers le détail avec option d'interprétation
      router.replace(`/dream/${newDream.id}`);
    } catch (error) {
      showErrorAlert(error, 'Save Failed', 'NewDreamScreen');
    }
  }, [
    content, title, dreamDate, sleepQuality, emotions,
    tags, isLucid, isRecurring, isPublic, isOverLimit, createDream,
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Dream</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isCreating || !content.trim()}
            style={[styles.saveBtn, (!content.trim() || isCreating) && styles.saveBtnDisabled]}
          >
            {isCreating
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Text style={styles.saveText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Date */}
          <View style={styles.dateRow}>
            <Text style={styles.dateEmoji}>🌙</Text>
            <Text style={styles.dateText}>
              {format(new Date(dreamDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          {/* Title (optionnel) */}
          <TextInput
            style={styles.titleInput}
            placeholder="Give your dream a title... (optional)"
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={CONFIG.limits.maxTitleLength}
            returnKeyType="next"
            onSubmitEditing={() => contentRef.current?.focus()}
          />

          {/* Divider */}
          <View style={styles.divider} />

          {/* Dream content - champ principal */}
          <TextInput
            ref={contentRef}
            style={styles.contentInput}
            placeholder="Describe your dream in as much detail as you can remember... What happened? Who was there? How did it feel?"
            placeholderTextColor={COLORS.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
          />

          {/* Counter */}
          <Text style={[styles.counter, isOverLimit && styles.counterError]}>
            {contentLength}/{CONFIG.limits.maxDreamLength}
          </Text>

          <View style={styles.divider} />

          {/* Section : Émotions */}
          <View style={styles.section}>
            <EmotionPicker selected={emotions} onChange={setEmotions} />
          </View>

          <View style={styles.divider} />

          {/* Section : Qualité sommeil */}
          <View style={styles.section}>
            <SleepQualitySlider value={sleepQuality} onChange={setSleepQuality} />
          </View>

          <View style={styles.divider} />

          {/* Section : Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dream Themes</Text>
            <View style={styles.tagsGrid}>
              {SUGGESTED_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                  style={[
                    styles.tagChip,
                    tags.includes(tag) && styles.tagChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      tags.includes(tag) && styles.tagChipTextSelected,
                    ]}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom tag */}
            <View style={styles.customTagRow}>
              <TextInput
                style={styles.customTagInput}
                placeholder="Add custom tag..."
                placeholderTextColor={COLORS.textMuted}
                value={customTag}
                onChangeText={setCustomTag}
                onSubmitEditing={addCustomTag}
                returnKeyType="done"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={addCustomTag} style={styles.addTagBtn}>
                <Text style={styles.addTagText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Tags sélectionnés (custom) */}
            {tags.filter((t) => !SUGGESTED_TAGS.includes(t)).length > 0 && (
              <View style={styles.customTagsRow}>
                {tags
                  .filter((t) => !SUGGESTED_TAGS.includes(t))
                  .map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => toggleTag(tag)}
                      style={styles.tagChipSelected}
                    >
                      <Text style={styles.tagChipTextSelected}>
                        #{tag} ✕
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Section : Toggles */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Dream Properties</Text>

            {[
              {
                key: 'lucid',
                label: '✨ Lucid Dream',
                sub: 'You were aware you were dreaming',
                value: isLucid,
                onChange: setIsLucid,
              },
              {
                key: 'recurring',
                label: '🔄 Recurring Dream',
                sub: "You've had this dream before",
                value: isRecurring,
                onChange: setIsRecurring,
              },
              {
                key: 'public',
                label: '🌐 Share Anonymously',
                sub: 'Post to the Dream Feed (anonymous)',
                value: isPublic,
                onChange: setIsPublic,
              },
            ].map(({ key, label, sub, value, onChange }) => (
              <View key={key} style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>{label}</Text>
                  <Text style={styles.toggleSub}>{sub}</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={onChange}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '80' }}
                  thumbColor={value ? COLORS.primary : COLORS.textMuted}
                />
              </View>
            ))}
          </View>

          {/* CTA Save */}
          <Button
            title="Save Dream"
            onPress={handleSave}
            isLoading={isCreating}
            disabled={!content.trim() || isOverLimit}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  saveBtn: { padding: SPACING.xs },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  dateEmoji: { fontSize: 20 },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  titleInput: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    paddingVertical: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  contentInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 200,
    paddingTop: 0,
  },
  counter: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  counterError: { color: COLORS.error },
  section: { gap: SPACING.sm },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  tagChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagChipSelected: {
    backgroundColor: COLORS.primary + '22',
    borderColor: COLORS.primary,
  },
  tagChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  tagChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  customTagRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  customTagInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addTagBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addTagText: { color: COLORS.primary, fontWeight: '600', fontSize: FONT_SIZES.sm },
  customTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.xs },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  toggleInfo: { flex: 1, marginRight: SPACING.md },
  toggleLabel: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
  toggleSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  saveButton: { marginTop: SPACING.xl },
});
