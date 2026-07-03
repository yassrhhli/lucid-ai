import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { supabase } from '@/services/supabase';

export default function PrivacyScreen() {
  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your dreams, interpretations, and account data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.functions.invoke('delete-account');
            if (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } else {
              await supabase.auth.signOut();
            }
          },
        },
      ]
    );
  };

  const sections = [
    {
      icon: 'shield-checkmark-outline',
      title: 'Data Storage',
      body: 'Your dreams are stored securely on encrypted servers. We use Supabase with row-level security — only you can access your data.',
    },
    {
      icon: 'eye-off-outline',
      title: 'Privacy First',
      body: 'We never sell your data. Dream content is only used to generate your personal AI interpretations and is never shared with third parties.',
    },
    {
      icon: 'hardware-chip-outline',
      title: 'AI Processing',
      body: 'Dream interpretations are generated using AI. Your dream content is sent to our AI provider for processing and is not stored by them.',
    },
    {
      icon: 'people-outline',
      title: 'Dream Feed',
      body: 'Dreams shared to the Dream Feed are fully anonymous. No name, profile, or identifying information is ever attached to shared dreams.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy & Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {sections.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons name={s.icon as any} size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>{s.title}</Text>
            </View>
            <Text style={styles.cardBody}>{s.body}</Text>
          </View>
        ))}

        <View style={styles.linksCard}>
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://lucidai.app/privacy')}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL('https://lucidai.app/terms')}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteData}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          <Text style={styles.deleteText}>Delete All My Data</Text>
        </TouchableOpacity>

        <Text style={styles.note}>Lucid AI — v1.0.0 · contact: support@lucidai.app</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 60 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.primary + '22', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardBody: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  linksCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  linkText: { fontSize: FONT_SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: SPACING.md },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.error + '44' },
  deleteText: { fontSize: FONT_SIZES.sm, color: COLORS.error, fontWeight: '600' },
  note: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, textAlign: 'center' },
});
