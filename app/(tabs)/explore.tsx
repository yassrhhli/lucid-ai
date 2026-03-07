import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { BannerAdComponent } from '@/components/ads/BannerAd';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import type { FeedPost } from '@/types/dream';

export default function ExploreScreen() {
  const { user, isPro } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const fetchFeed = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*, dream:dreams(content, title, emotions, tags, is_lucid)')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setPosts((data ?? []) as FeedPost[]);
    } catch (err) {
      console.error('[Explore] fetchFeed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchVotes = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('feed_votes').select('post_id').eq('user_id', user.id);
    if (data) setVotedIds(new Set(data.map((v: any) => v.post_id)));
  }, [user?.id]);

  useEffect(() => { fetchFeed(); fetchVotes(); }, []);

  const handleVote = async (post: FeedPost) => {
    if (!user?.id) return;
    const hasVoted = votedIds.has(post.id);
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, vote_count: p.vote_count + (hasVoted ? -1 : 1) } : p));
    setVotedIds(prev => { const n = new Set(prev); hasVoted ? n.delete(post.id) : n.add(post.id); return n; });
    if (hasVoted) {
      await supabase.from('feed_votes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      await supabase.from('feed_votes').insert({ post_id: post.id, user_id: user.id });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeed(), fetchVotes()]);
    setRefreshing(false);
  }, [fetchFeed, fetchVotes]);

  const renderItem = ({ item, index }: { item: FeedPost; index: number }) => {
    const hasVoted = votedIds.has(item.id);
    const preview = (item.dream?.content ?? '').slice(0, 200).trim() + ((item.dream?.content?.length ?? 0) > 200 ? '…' : '');
    const showAd = !isPro && index > 0 && index % 4 === 0;

    return (
      <>
        {showAd && <BannerAdComponent size="banner" style={{ marginVertical: SPACING.xs }} />}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push(`/dream/${item.dream_id}`)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.anonymous_name ?? 'A')[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.anonymous_name ?? 'Anonymous Dreamer'}</Text>
              <Text style={styles.date}>{format(new Date(item.created_at), 'MMM d · h:mm a')}</Text>
            </View>
            {item.dream?.is_lucid && (
              <View style={styles.lucidBadge}><Ionicons name='moon' size={12} color='#a78bfa' /><Text style={styles.lucidText}> Lucid</Text></View>
            )}
          </View>
          {item.dream?.title && <Text style={styles.cardTitle}>{item.dream.title}</Text>}
          <Text style={styles.cardContent}>{preview}</Text>
          {(item.dream?.tags ?? []).length > 0 && (
            <View style={styles.tags}>
              {(item.dream?.tags ?? []).slice(0, 3).map(t => (
                <View key={t} style={styles.tag}><Text style={styles.tagText}>#{t}</Text></View>
              ))}
            </View>
          )}
          <View style={styles.cardFooter}>
            <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleVote(item); }} style={[styles.voteBtn, hasVoted && styles.voteBtnActive]} activeOpacity={0.7}>
              <Ionicons name={hasVoted ? 'heart' : 'heart-outline'} size={16} color={hasVoted ? '#f472b6' : COLORS.textSecondary} />
              <Text style={[styles.voteCount, hasVoted && styles.voteCountActive]}>{item.vote_count ?? 0}</Text>
            </TouchableOpacity>
            <View style={styles.cardFooterRight}>
              <Ionicons name="eye-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.readMore}>Read dream</Text>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Dream Feed</Text>
        <Text style={styles.sub}>Anonymous dreams from around the world</Text>
      </View>
      {isLoading ? <LoadingSpinner label="Loading dreams..." /> : (
        <FlashList
          data={posts}
          renderItem={renderItem}
          estimatedItemSize={220}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="globe-outline" size={64} color="#6b5fa6" />
              <Text style={styles.emptyTitle}>No dreams yet</Text>
              <Text style={styles.emptySub}>Be the first to share a dream anonymously!</Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text },
  sub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginTop: 2 },
  list: { paddingHorizontal: SPACING.lg },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm, gap: SPACING.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary + '33', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.primary },
  name: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  date: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },
  lucidText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardContent: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  tags: { flexDirection: 'row', gap: SPACING.xs },
  tag: { backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
  tagText: { fontSize: 10, color: COLORS.textMuted },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  voteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: RADIUS.full, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  voteBtnActive: { backgroundColor: '#f472b622', borderColor: '#f472b644' },
  voteCount: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted },
  voteCountActive: { color: '#f472b6' },
  cardFooterRight: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  readMore: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary },
  lucidBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary + '22', borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderWidth: 1, borderColor: COLORS.primary + '44' },
  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center' },
});
