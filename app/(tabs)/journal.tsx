import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { useDreams } from '@/hooks/useDreams';
import { DreamCard } from '@/components/dream/DreamCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Dream } from '@/types/dream';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

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

type ListItem =
  | { type: 'header'; title: string }
  | { type: 'dream'; dream: Dream };

export default function JournalScreen() {
  const { dreams, isLoading, deleteDream, refresh } = useDreams();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = search.trim()
    ? dreams.filter(
        (d) =>
          d.content.toLowerCase().includes(search.toLowerCase()) ||
          d.title?.toLowerCase().includes(search.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : dreams;

  // Flat list avec headers
  const flatData: ListItem[] = [];
  const groups = groupDreamsByDate(filtered);
  for (const group of groups) {
    flatData.push({ type: 'header', title: group.title });
    for (const dream of group.data) {
      flatData.push({ type: 'dream', dream });
    }
  }

  const handleLongPress = (dream: Dream) => {
    Alert.alert(dream.title ?? 'Dream', 'What do you want to do?', [
      { text: 'Edit', onPress: () => router.push(`/dream/edit/${dream.id}`) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Dream', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteDream(dream.id) },
          ]);
        },
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
      return <Text style={styles.groupHeader}>{item.title}</Text>;
    }
    return <DreamCard dream={item.dream} onLongPress={handleLongPress} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Dream Journal</Text>
        <TouchableOpacity
          onPress={() => router.push('/dream/new')}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search dreams..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading && !refreshing ? (
        <LoadingSpinner label="Loading your dreams..." />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🌙</Text>
          <Text style={styles.emptyTitle}>
            {search ? 'No dreams found' : 'No dreams yet'}
          </Text>
          <Text style={styles.emptySub}>
            {search
              ? 'Try a different search term'
              : 'Record your first dream when you wake up tomorrow morning'}
          </Text>
          {!search && (
            <TouchableOpacity
              onPress={() => router.push('/dream/new')}
              style={styles.emptyBtn}
            >
              <Text style={styles.emptyBtnText}>Record a Dream</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlashList
          data={flatData}
          renderItem={renderItem}
          estimatedItemSize={140}
          keyExtractor={(item, i) =>
            item.type === 'header' ? `header-${item.title}` : `dream-${item.dream.id}`
          }
          contentContainerStyle={styles.list}
          getItemType={(item) => item.type}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}

      {/* Stats footer */}
      {dreams.length > 0 && (
        <View style={styles.statsFooter}>
          <Text style={styles.statsText}>
            {dreams.length} dream{dreams.length !== 1 ? 's' : ''} recorded
          </Text>
          <Text style={styles.statsDot}>·</Text>
          <Text style={styles.statsText}>
            {dreams.filter((d) => d.interpretation).length} interpreted
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.text,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  searchRow: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  search: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  list: { paddingHorizontal: SPACING.lg },
  groupHeader: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: FONT_SIZES.sm },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statsText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  statsDot: { color: COLORS.textMuted },
});
