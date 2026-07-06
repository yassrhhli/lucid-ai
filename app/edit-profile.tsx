import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

export default function EditProfileScreen() {
  const { user, profile, updateProfile } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({ username: username.trim() });
      Alert.alert('Saved!', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save profile. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const avatarLetter = (username || user?.email || 'U')[0].toUpperCase();

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
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          onPress={() => { haptics.light(); handleSave(); }}
          disabled={isSaving}
          accessibilityLabel="Save profile changes"
          accessibilityRole="button"
          accessibilityState={{ disabled: isSaving }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isSaving
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <Text style={styles.saveBtn}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>{avatarLetter}</Text>
          </View>
          <Text style={styles.avatarHint}>Profile picture coming soon</Text>
        </View>

        {/* Fields */}
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>DISPLAY NAME</Text>
          <TextInput
            style={styles.fieldInput}
            value={username}
            onChangeText={setUsername}
            placeholder="Your first name"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>EMAIL</Text>
          <Text style={styles.fieldValue}>{user?.email}</Text>
          <Text style={styles.fieldHint}>Email cannot be changed</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>MEMBER SINCE</Text>
          <Text style={styles.fieldValue}>
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : 'Recently'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>PLAN</Text>
          <View style={styles.planRow}>
            <Text style={styles.fieldValue}>{profile?.is_pro ? 'Lucid Pro' : 'Free'}</Text>
            {profile?.is_pro
              ? <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>
              : <TouchableOpacity
                  onPress={() => { haptics.light(); router.push('/paywall'); }}
                  style={styles.upgradeBtn}
                  accessibilityLabel="Upgrade to Lucid Pro"
                  accessibilityRole="button"
                >
                  <Text style={styles.upgradeBtnText}>Upgrade</Text>
                </TouchableOpacity>
            }
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  saveBtn: { fontSize: FONT_SIZES.md, color: COLORS.primary, fontWeight: '700' },
  content: { padding: SPACING.md, gap: SPACING.md },
  avatarSection: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 36, fontWeight: '800', color: '#fff' },
  avatarHint: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  fieldLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600', letterSpacing: 1 },
  fieldInput: { fontSize: FONT_SIZES.md, color: COLORS.text, paddingVertical: 4 },
  fieldValue: { fontSize: FONT_SIZES.md, color: COLORS.text, fontWeight: '500' },
  fieldHint: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  proBadge: { backgroundColor: '#FFD70022', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#FFD70055' },
  proBadgeText: { color: '#FFD700', fontSize: FONT_SIZES.xs, fontWeight: '700' },
  upgradeBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 16, height: 44, justifyContent: 'center', alignItems: 'center' },
  upgradeBtnText: { color: '#fff', fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
