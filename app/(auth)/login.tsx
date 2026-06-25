import { Ionicons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { showErrorAlert } from '@/utils/errorHandler';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error) {
      showErrorAlert(error, 'Sign In Failed', 'LoginScreen');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient */}
      <LinearGradient colors={['#060610', '#0D0825', '#060610']} style={StyleSheet.absoluteFillObject} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />

      {/* Glow orb */}
      <View style={styles.glow} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <LinearGradient colors={['#4A2D8A', '#7B5EA7']} style={styles.logoIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="moon" size={32} color="#fff" />
          </LinearGradient>
          <Text style={styles.appName}>LUCID.AI</Text>
          <Text style={styles.tagline}>Your dreams, decoded.</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSub}>Sign in to continue your dream journey</Text>

          <View style={styles.fields}>
            <Controller
              control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email" placeholder="you@example.com"
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address" autoCapitalize="none"
                  autoComplete="email" returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              )}
            />
            <Controller
              control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={passwordRef}
                  label="Password" placeholder="••••••••"
                  value={value} onChangeText={onChange} onBlur={onBlur}
                  error={errors.password?.message}
                  isPassword returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />
          </View>

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          <Button title="Sign In" onPress={handleSubmit(onSubmit)} isLoading={isLoading} fullWidth size="lg" />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <View style={styles.socialRow}>
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.socialBtn} onPress={signInWithApple} activeOpacity={0.8}>
                <Ionicons name="logo-apple" size={18} color={COLORS.text} />
                <Text style={styles.socialBtnText}>Apple</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.socialBtn} onPress={signInWithGoogle} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={16} color={COLORS.text} />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign up free</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  glow: {
    position: 'absolute', top: 40, alignSelf: 'center',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(123,94,167,0.12)',
  },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: 80, paddingBottom: SPACING['2xl'] },

  // Logo
  logoWrap: { alignItems: 'center', marginBottom: SPACING['2xl'], gap: SPACING.sm },
  logoIcon: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7B5EA7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 18, elevation: 10,
  },
  appName: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.text, letterSpacing: 8 },
  tagline: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, fontStyle: 'italic' },

  // Card
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  cardTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '800', color: COLORS.text, marginBottom: 4, letterSpacing: -0.3 },
  cardSub: { fontSize: FONT_SIZES.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },

  fields: { gap: SPACING.sm, marginBottom: SPACING.xs },

  forgotLink: { alignSelf: 'flex-end', marginBottom: SPACING.lg },
  forgotText: { fontSize: FONT_SIZES.sm, color: COLORS.primaryBright, fontWeight: '500' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginVertical: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.borderSubtle },
  dividerText: { fontSize: FONT_SIZES.xs, color: COLORS.textMuted, letterSpacing: 0.5 },

  socialRow: { flexDirection: 'row', gap: SPACING.sm },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.surfaceElevated, borderRadius: RADIUS.lg,
    paddingVertical: 12, borderWidth: 1, borderColor: COLORS.borderSubtle,
  },
  socialBtnText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: SPACING.xl },
  footerText: { color: COLORS.textMuted, fontSize: FONT_SIZES.sm },
  footerLink: { color: COLORS.primaryBright, fontSize: FONT_SIZES.sm, fontWeight: '700' },
});
