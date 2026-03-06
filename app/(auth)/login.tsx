import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { handleError, showErrorAlert } from '@/utils/errorHandler';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { signIn, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0a0a0f', '#12092a', '#0a0a0f']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌙</Text>
          <Text style={styles.appName}>LUCID.AI</Text>
          <Text style={styles.tagline}>Your dreams, decoded.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your dream journey</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={passwordRef}
                label="Password"
                placeholder="••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotLink}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size="lg"
            style={styles.signInButton}
          />

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social auth */}
          <View style={styles.socialButtons}>
            {Platform.OS === 'ios' && (
              <Button
                title="Apple"
                onPress={signInWithApple}
                variant="secondary"
                size="md"
                style={styles.socialButton}
                isLoading={isLoading}
              />
            )}
            <Button
              title="Google"
              onPress={signInWithGoogle}
              variant="secondary"
              size="md"
              style={styles.socialButton}
              isLoading={isLoading}
            />
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 80,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logo: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  appName: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 6,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.xs,
    marginBottom: SPACING.md,
  },
  forgotText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  signInButton: {
    marginTop: SPACING.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  socialButton: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.sm,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
