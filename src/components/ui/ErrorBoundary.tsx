import React, { Component, ErrorInfo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log vers analytics en production
    console.error('[ErrorBoundary] Caught error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>⚠️</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            The app encountered an unexpected error. Your dreams are safe.
          </Text>

          {__DEV__ && this.state.error && (
            <ScrollView style={styles.debugBox}>
              <Text style={styles.debugText}>{this.state.error.message}</Text>
              <Text style={styles.debugStack}>
                {this.state.errorInfo?.componentStack}
              </Text>
            </ScrollView>
          )}

          <TouchableOpacity onPress={this.handleReset} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  debugBox: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    maxHeight: 200,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.error + '44',
  },
  debugText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.xs,
    fontFamily: 'monospace',
    marginBottom: SPACING.sm,
  },
  debugStack: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.sm,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: FONT_SIZES.md,
  },
});
