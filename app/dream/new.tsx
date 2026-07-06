import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { useDreams } from '@/hooks/useDreams';
import { EmotionPicker } from '@/components/dream/EmotionPicker';
import { SleepQualitySlider } from '@/components/dream/SleepQualitySlider';
import { Button } from '@/components/ui/Button';
import { showErrorAlert } from '@/utils/errorHandler';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { CONFIG } from '@/constants/config';
import { checkRateLimit } from '@/utils/rateLimit';
import { sanitizeDreamContent, sanitizeTitle } from '@/utils/sanitize';
import { haptics } from '@/utils/haptics';
import type { Emotion, SleepQuality, DreamCreateInput } from '@/types/dream';

const SUGGESTED_TAGS = [
  'flying', 'falling', 'water', 'family', 'work', 'chase',
  'house', 'school', 'nature', 'animals', 'death', 'travel',
];

export default function NewDreamScreen() {
  const { createDream, isCreating } = useDreams();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [dreamDate] = useState(format(new Date(), 'yyyy-MM-dd'));
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
    haptics.selection();
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addCustomTag = () => {
    const cleaned = customTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      haptics.selection();
      setTags(prev => [...prev, cleaned]);
      setCustomTag('');
    }
  };

  const handleSave = useCallback(async () => {
    if (!checkRateLimit('createDream', 1, 3000)) return;
    const cleanContent = sanitizeDreamContent(content);
    if (!cleanContent) { Alert.alert('Empty Dream', 'Please describe your dream before saving.'); return; }
    if (isOverLimit) { Alert.alert('Too Long', `Maximum ${CONFIG.limits.maxDreamLength} characters.`); return; }

    const input: DreamCreateInput = {
      title: sanitizeTitle(title) || undefined,
      content: cleanContent,
      dream_date: dreamDate,
      sleep_quality: sleepQuality ?? undefined,
      emotions, tags,
      is_lucid: isLucid, is_recurring: isRecurring, is_public: isPublic,
    };

    try {
      const newDream = await createDream(input);
      haptics.success();
      router.replace(`/dream/${newDream.id}`);
    } catch (error) {
      haptics.error();
      showErrorAlert(error, 'Save Failed', 'NewDreamScreen');
    }
  }, [content, title, dreamDate, sleepQuality, emotions, tags, isLucid, isRecurring, isPublic, isOverLimit, createDream]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityLabel="Close" accessibilityRole="button">
            <Ionicons name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Ionicons name="moon" size={14} color={COLORS.accent} />
            <Text style={styles.headerTitle}>New Dream</Text>
          </View>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isCreating || !content.trim()}
            style={[styles.saveBtn, (!content.trim() || isCreating) && styles.saveBtnDisabled]}
            accessibilityLabel="Save dream"
            accessibilityRole="button"
            accessibilityState={{ disabled: isCreating || !content.trim() }}
          >
            {isCreating
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.saveBtnText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Date pill */}
          <View style={styles.datePill}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.dateText}>{format(new Date(dreamDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}</Text>
          </View>

          {/* Title */}
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Give your dream a title..."
            placeholderTextColor={COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={CONFIG.limits.maxTitleLength}
            returnKeyType="next"
            onSubmitEditing={() => contentRef.current?.focus()}
            accessibilityLabel="Dream title"
          />

          <View style={styles.divider} />

          {/* Dream content */}
          <Text style={styles.inputLabel}>Your Dream</Text>
          <TextInput
            ref={contentRef}
            style={styles.contentInput}
            placeholder={"What happened? Where were you? Who was there? How did it feel?"}
            placeholderTextColor={COLORS.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus
            accessibilityLabel="Dream content"
          />

          <Text style={[styles.counter, isOverLimit && styles.counterError]}>
            {contentLength}/{CONFIG.limits.maxDreamLength}
          </Text>

          <View style={styles.divider} />

          {/* Emotions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-outline" size={15} color="#FB7185" />
              <Text style={styles.sectionLabel}>Emotions</Text>
            </View>
            <EmotionPicker selected={emotions} onChange={setEmotions} />
          </View>

          <View style={styles.divider} />

          {/* Sleep quality */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bed-outline" size={15} color={COLORS.gold} />
              <Text style={styles.sectionLabel}>Sleep Quality</Text>
            </View>
            <SleepQualitySlider value={sleepQuality} onChange={setSleepQuality} />
          </View>

          <View style={styles.divider} />

          {/* Tags */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag-outline" size={15} color="#60A5FA" />
              <Text style={styles.sectionLabel}>Dream Themes</Text>
            </View>
            <View style={styles.tagsGrid}>
              {SUGGESTED_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                  style={[styles.tagChip, tags.includes(tag) && styles.tagChipSelected]}
                >
                  <Text style={[styles.tagChipText, tags.includes(tag) && styles.tagChipTextSelected]}>
                    #{tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.customTagRow}>
              <TextInput
                style={styles.customTagInput}
                placeholder="Custom tag..."
                placeholderTextColor={COLORS.textMuted}
                value={customTag}
                onChangeText={setCustomTag}
                onSubmitEditing={addCustomTag}
                returnKeyType="done"
                autoCapitalize="none"
                accessibilityLabel="Add a custom tag"
              />
              <TouchableOpacity
                onPress={addCustomTag}
                style={styles.addTagBtn}
                accessibilityLabel="Add tag"
                accessibilityRole="button"
              >
                <Ionicons name="add" size={18} color={COLORS.primaryBright} />
              </TouchableOpacity>
            </View>
            {tags.filter(t => !SUGGESTED_TAGS.includes(t)).length > 0 && (
              <View style={styles.customTagsRow}>
                {tags.filter(t => !SUGGESTED_TAGS.includes(t)).map(tag => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[styles.tagChipSelected, styles.customTagChip]}
                    accessibilityLabel={`Remove tag ${tag}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.tagChipTextSelected}>#{tag}</Text>
                    <Ionicons name="close" size={11} color={COLORS.accentSoft} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Toggles */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="options-outline" size={15} color={COLORS.accent} />
              <Text style={styles.sectionLabel}>Properties</Text>
            </View>
            <View style={styles.togglesCard}>
              {[
                { key: 'lucid',     label: 'Lucid Dream',        sub: 'You were aware you were dreaming',  value: isLucid,     onChange: setIsLucid     },
                { key: 'recurring', label: 'Recurring Dream',    sub: "You've had this dream before",       value: isRecurring, onChange: setIsRecurring, last: false },
                { key: 'public',    label: 'Share Anonymously',  sub: 'Post to the Dream Feed',             value: isPublic,    onChange: setIsPublic,   last: true  },
              ].map(({ key, label, sub, value, onChange, last }) => (
                <View key={key} style={[styles.toggleRow, !last && styles.toggleBorder]}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleLabel}>{label}</Text>
                    <Text style={styles.toggleSub}>{sub}</Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: COLORS.borderSubtle, true: COLORS.primary + 'AA' }}
                    thumbColor={value ? '#fff' : COLORS.textMuted}
                    ios_backgroundColor={COLORS.borderSubtle}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Save CTA */}
          <View style={styles.saveCTA}>
            <Button
              title="Save Dream"
              onPress={handleSave}
              isLoading={isCreating}
              disabled={!content.trim() || isOverLimit}
              fullWidth size="lg"
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle,
  },
  headerBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 8,
    minWidth: 60, alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },

  datePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    marginVertical: SPACING.md,
  },
  dateText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },

  titleInput: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, paddingVertical: SPACING.xs },
  inputLabel: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.textSecondary, letterSpacing: 0.5, marginBottom: SPACING.xs, textTransform: 'uppercase' },

  divider: { height: 1, backgroundColor: COLORS.borderSubtle, marginVertical: SPACING.lg },

  contentInput: { fontSize: FONT_SIZES.md, color: COLORS.text, lineHeight: 26, minHeight: 200, paddingTop: 0 },
  counter: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, textAlign: 'right', marginTop: SPACING.xs },
  counterError: { color: COLORS.error },

  // Sections
  section: { gap: SPACING.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sectionLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },

  // Tags
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tagChip: {
    paddingHorizontal: SPACING.sm, paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  tagChipSelected: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.borderBright },
  tagChipText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, fontWeight: '500' },
  tagChipTextSelected: { color: COLORS.accentSoft, fontWeight: '600' },
  customTagRow: { flexDirection: 'row', gap: SPACING.xs },
  customTagInput: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 10,
    color: COLORS.text, fontSize: FONT_SIZES.sm,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  addTagBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.borderBright,
    alignItems: 'center', justifyContent: 'center',
  },
  customTagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  customTagChip: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  // Toggles
  togglesCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderSubtle, overflow: 'hidden' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderSubtle },
  toggleInfo: { flex: 1, marginRight: SPACING.md },
  toggleLabel: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '600' },
  toggleSub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 2 },

  saveCTA: { marginTop: SPACING.xl },
});
