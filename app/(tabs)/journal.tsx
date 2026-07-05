import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, RefreshControl, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { LinearGradient } from 'expo-linear-gradient';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useDreams } from '@/hooks/useDreams';
import { DreamCard } from '@/components/dream/DreamCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Dream } from '@/types/dream';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { haptics } from '@/utils/haptics';

function groupDreamsByDate(dreams: Dream[]): { title: string; data: Dream[] }[] {
  const groups: Record<string, Dream[]> = {};
  for (const dream of dreams) {
    const date = new Date(dream.dream_date + 'T12:00:00');
    let key: string;
    if (isToday(date)) key = 'Today';
    else if (isYesterday(date)) key = 'Yesterday';
    else if (isThisWeek(date)) key = format(date, 'EEEE');
    else key = format(date, 'MMMM yyyy');
    if (!groups[key]) groups[key] = [];
    groups[key].push(dream);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

type ListItem = { type: 'header'; title: string } | { type: 'dream'; dream: Dream };

export default function JournalScreen() {
  const { dreams, isLoading, deleteDream, refresh } = useDreams();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = search.trim()
    ? dreams.filter(d =>
        d.content.toLowerCase().includes(search.toLowerCase()) ||
        d.title?.toLowerCase().includes(search.toLowerCase()) ||
        d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : dreams;

  const flatData: ListItem[] = [];
  for (const group of groupDreamsByDate(filtered)) {
    flatData.push({ type: 'header', title: group.title });
    for (const dream of group.data) flatData.push({ type: 'dream', dream });
  }

  const handleLongPress = (dream: Dream) => {
    haptics.light();
    Alert.alert(dream.title ?? 'Dream', 'What do you want to do?', [
      { text: 'Edit',   onPress: () => router.push(`/dream/edit/${dream.id}`) },
      { text: 'Delete', style: 'destructive', onPress: () => {
          haptics.warning();
          Alert.alert('Delete Dream', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { deleteDream(dream.id); haptics.success(); } },
          ]);
        }
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.groupHeaderWrap}>
          <Text style={styles.groupHeader}>{item.title}</Text>
          <View style={styles.groupLine} />
        </View>
      );
    }
    return <DreamCard dream={item.dream} onLongPress={handleLongPress} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dream Journal</Text>
          <Text style={styles.subtitle}>
            {dreams.length} {dreams.length === 1 ? 'entry' : 'entries'} · {dreams.filter(d => d.interpretation).length} interpreted
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => { haptics.light(); router.push('/dream/new'); }}
          style={styles.addBtn}
          accessibilityLabel="Record a new dream"
          accessibilityRole="button"
        >
          <LinearGradient colors={['#6B46C1', '#8B5CF6']} style={styles.addBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="add" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dreams, tags, emotions..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner label="Loading your dreams..." />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconOuter}>
            <View style={styles.emptyIconInner}>
              <Ionicons name="moon-outline" size={40} color={COLORS.accent} />
            </View>
          </View>
          <Text style={styles.emptyTitle}>{search ? 'No dreams found' : 'No dreams yet'}</Text>
          <Text style={styles.emptySub}>
            {search
              ? 'Try a different search term'
              : 'Start recording your dreams each morning while the memory is fresh'}
          </Text>
          {!search && (
            <TouchableOpacity onPress={() => router.push('/dream/new')} style={styles.emptyBtn}>
              <LinearGradient colors={['#6B46C1', '#8B5CF6']} style={styles.emptyBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Record First Dream</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlashList
          data={flatData}
          renderItem={renderItem}
          estimatedItemSize={150}
          keyExtractor={(item, i) =>
            item.type === 'header' ? `header-${item.title}` : `dream-${item.dream.id}`
          }
          contentContainerStyle={styles.list}
          getItemType={item => item.type}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListFooterComponent={<View style={{ height: 110 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 3 },
  addBtn: { borderRadius: RADIUS.full, overflow: 'hidden', shadowColor: '#6B46C1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  addBtnGrad: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    gap: SPACING.sm,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.text },

  list: { paddingHorizontal: SPACING.lg },

  groupHeaderWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: SPACING.lg, paddingBottom: SPACING.sm },
  groupHeader: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.4, textTransform: 'uppercase' },
  groupLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, gap: SPACING.md },
  emptyIconOuter: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  emptyIconInner: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.borderBright,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBtn: { borderRadius: RADIUS.full, overflow: 'hidden', marginTop: SPACING.sm, shadowColor: '#6B46C1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
  emptyBtnGrad: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm + 2 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
});
