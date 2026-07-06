import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

import { useAuth } from '@/hooks/useAuth';
import { scheduleDreamReminder, cancelDreamReminder } from '@/utils/notifications';

export default function NotificationsScreen() {
  const { profile, updateProfile } = useAuth();

  const [morningReminder, setMorningReminder] = useState(profile?.morning_reminder_enabled ?? true);
  const [dreamTips, setDreamTips] = useState(profile?.dream_tips_enabled ?? true);
  const [weeklyReport, setWeeklyReport] = useState(profile?.weekly_report_enabled ?? false);
  const [lucidTechniques, setLucidTechniques] = useState(profile?.lucid_techniques_enabled ?? false);

  const handleMorningReminder = async (val: boolean) => {
    setMorningReminder(val);
    await updateProfile({ morning_reminder_enabled: val } as any);
    if (val) await scheduleDreamReminder();
    else await cancelDreamReminder();
  };

  const handleToggle = async (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    await updateProfile({ [key]: val } as any);
  };

  const settings = [
    {
      icon: 'sunny-outline',
      title: 'Morning Dream Reminder',
      sub: 'Remind me to record dreams at 8:00 AM',
      value: morningReminder,
      onChange: handleMorningReminder,
    },
    {
      icon: 'bulb-outline',
      title: 'Dream Tips',
      sub: 'Daily tips to improve dream recall',
      value: dreamTips,
      onChange: (val: boolean) => handleToggle('dream_tips_enabled', val, setDreamTips),
    },
    {
      icon: 'bar-chart-outline',
      title: 'Weekly Report',
      sub: 'Summary of your dream patterns every Sunday',
      value: weeklyReport,
      onChange: (val: boolean) => handleToggle('weekly_report_enabled', val, setWeeklyReport),
    },
    {
      icon: 'moon-outline',
      title: 'Lucid Dream Techniques',
      sub: 'Reminders to practice reality checks',
      value: lucidTechniques,
      onChange: (val: boolean) => handleToggle('lucid_techniques_enabled', val, setLucidTechniques),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { haptics.light(); router.back(); }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>PUSH NOTIFICATIONS</Text>
        <View style={styles.card}>
          {settings.map((item, i) => (
            <View key={i} style={[styles.row, i < settings.length - 1 && styles.rowBorder]}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSub}>{item.sub}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={(v) => { haptics.selection(); item.onChange(v); }}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Notification times can be adjusted in your iPhone Settings under Lucid AI.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  content: { padding: SPACING.md, gap: SPACING.sm },
  sectionLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  rowSub: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  note: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18, marginTop: SPACING.sm },
});
