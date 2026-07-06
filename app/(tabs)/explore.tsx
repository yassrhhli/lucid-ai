import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/hooks/useAuth';
import { BannerAdComponent } from '@/components/ads/BannerAd';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';
import { haptics } from '@/utils/haptics';
import { logger } from '@/utils/errorHandler';
import type { FeedPost } from '@/types/dream';

export default function ExploreScreen() {
  const { user, isPro } = useAuth();
  const router = useRouter();
  const [posts, setPosts]       = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  const fetchFeed = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*, dream:dreams(content, title, emotions, tags, is_lucid)')
        .is('is_reported', false)          // masquer les posts signalés
        .order('vote_count', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setPosts((data ?? []) as FeedPost[]);
    } catch (err) {
      logger.error('[Explore] fetchFeed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchVotes = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('feed_votes')
      .select('post_id')
      .eq('user_id', user.id);
    if (data) setVotedIds(new Set(data.map((v: any) => v.post_id)));
  }, [user?.id]);

  useEffect(() => {
    fetchFeed();
    fetchVotes();
  }, []);

  // ── Vote atomique via RPC (évite race conditions) ──────────
  const handleVote = async (post: FeedPost) => {
    if (!user?.id) return;
    const hasVoted = votedIds.has(post.id);

    // Mise à jour optimiste immédiate
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? { ...p, vote_count: Math.max(0, p.vote_count + (hasVoted ? -1 : 1)) }
          : p
      )
    );
    setVotedIds(prev => {
      const next = new Set(prev);
      hasVoted ? next.delete(post.id) : next.add(post.id);
      return next;
    });

    // Appel RPC atomique côté serveur
    const { error } = await supabase.rpc('toggle_feed_vote', {
      p_post_id: post.id,
      p_user_id: user.id,
    });

    if (error) {
      // Rollback si erreur
      setPosts(prev =>
        prev.map(p =>
          p.id === post.id
            ? { ...p, vote_count: Math.max(0, p.vote_count + (hasVoted ? 1 : -1)) }
            : p
        )
      );
      setVotedIds(prev => {
        const next = new Set(prev);
        hasVoted ? next.add(post.id) : next.delete(post.id);
        return next;
      });
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchFeed(), fetchVotes()]);
    setRefreshing(false);
  }, [fetchFeed, fetchVotes]);

  const renderItem = ({ item, index }: { item: FeedPost; index: number }) => {
    const hasVoted = votedIds.has(item.id);
    const content  = item.dream?.content ?? '';
    const preview  = content.length > 200 ? content.slice(0, 200).trim() + '…' : content;
    const showAd   = !isPro && index > 0 && index % 5 === 0;

    return (
      <>
        {showAd && (
          <BannerAdComponent size="banner" style={{ marginVertical: SPACING.xs }} />
        )}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push(`/dream/${item.dream_id}`)}
          accessibilityLabel={`Open shared dream${item.dream?.title ? `: ${item.dream.title}` : ''}`}
          accessibilityRole="button"
        >
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.anonymous_name ?? 'A')[0].toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.anonymous_name ?? 'Anonymous Dreamer'}</Text>
              <Text style={styles.date}>{format(new Date(item.created_at), 'MMM d · h:mm a')}</Text>
            </View>
            {item.dream?.is_lucid && (
              <View style={styles.lucidBadge}>
                <Ionicons name="moon" size={11} color="#a78bfa" />
                <Text style={styles.lucidText}>Lucid</Text>
              </View>
            )}
          </View>

          {item.dream?.title && (
            <Text style={styles.cardTitle} numberOfLines={1}>{item.dream.title}</Text>
          )}
          <Text style={styles.cardContent} numberOfLines={4}>{preview}</Text>

          {(item.dream?.tags ?? []).length > 0 && (
            <View style={styles.tags}>
              {(item.dream?.tags ?? []).slice(0, 3).map(t => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>#{t}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.cardFooter}>
            <TouchableOpacity
              onPress={() => { haptics.light(); handleVote(item); }}
              style={[styles.voteBtn, hasVoted && styles.voteBtnActive]}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={hasVoted ? 'Remove like' : 'Like this dream'}
              accessibilityRole="button"
            >
              <Ionicons
                name={hasVoted ? 'heart' : 'heart-outline'}
                size={15}
                color={hasVoted ? '#f472b6' : COLORS.textSecondary}
              />
              <Text style={[styles.voteCount, hasVoted && styles.voteCountActive]}>
                {item.vote_count ?? 0}
              </Text>
            </TouchableOpacity>

            <View style={styles.readMoreRow}>
              <Ionicons name="arrow-forward-circle-outline" size={15} color={COLORS.textMuted} />
              <Text style={styles.readMore}>Read dream</Text>
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Dream Feed</Text>
        <Text style={styles.sub}>Anonymous dreams from around the world</Text>
      </View>

      {isLoading ? (
        <LoadingSpinner label="Loading dreams..." />
      ) : (
        <FlashList
          data={posts}
          renderItem={renderItem}
          estimatedItemSize={220}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="globe-outline" size={36} color={COLORS.accent} />
              </View>
              <Text style={styles.emptyTitle}>No dreams yet</Text>
              <Text style={styles.emptySub}>
                Be the first to share a dream anonymously from the journal!
              </Text>
            </View>
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
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm,
  },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  sub: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 3 },
  list: { paddingHorizontal: SPACING.lg },

  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.md, borderWidth: 1, borderColor: COLORS.borderSubtle,
    marginBottom: SPACING.sm, gap: SPACING.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  avatar: {
    width: 34, height: 34, borderRadius: 12,
    backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.borderBright,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.accent },
  name: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  date: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  lucidBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(167,139,250,0.15)', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: 'rgba(167,139,250,0.25)',
  },
  lucidText: { fontSize: 10, color: '#a78bfa', fontWeight: '600' },

  cardTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.text },
  cardContent: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 21 },

  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  tag: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 2,
  },
  tagText: { fontSize: 10, color: COLORS.textMuted },

  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  voteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: RADIUS.full, backgroundColor: COLORS.background,
    borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  voteBtnActive: { backgroundColor: 'rgba(244,114,182,0.1)', borderColor: 'rgba(244,114,182,0.3)' },
  voteCount: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.textMuted },
  voteCountActive: { color: '#f472b6' },
  readMoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto',
  },
  readMore: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted },

  empty: { alignItems: 'center', paddingTop: 80, gap: SPACING.md, paddingHorizontal: SPACING.xl },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: COLORS.primaryGlow, alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});
