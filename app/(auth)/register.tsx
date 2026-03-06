import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
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

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const [emailSent, setEmailSent] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await signUp(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error: any) {
      if (error?.message === 'CHECK_EMAIL') {
        setEmailSent(true);
      } else {
        showErrorAlert(error, 'Registration Failed', 'RegisterScreen');
      }
    }
  };

  if (emailSent) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#0a0a0f', '#12092a', '#0a0a0f']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.confirmContainer}>
          <Text style={styles.confirmEmoji}>📧</Text>
          <Text style={styles.confirmTitle}>Check your email</Text>
          <Text style={styles.confirmText}>
            We sent a confirmation link to{'\n'}
            <Text style={styles.confirmEmail}>{getValues('email')}</Text>
          </Text>
          <Text style={styles.confirmHint}>
            Click the link to activate your account, then come back to sign in.
          </Text>
          <Button
            title="Go to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
            size="lg"
            style={{ marginTop: SPACING.xl }}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0a0a0f', '#12092a', '#0a0a0f']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>✨</Text>
          <Text style={styles.title}>Start your journey</Text>
          <Text style={styles.subtitle}>
            Join 10,000+ dreamers unlocking their subconscious
          </Text>
        </View>

        <View style={styles.form}>
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
                placeholder="At least 8 characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                isPassword
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={confirmRef}
                label="Confirm Password"
                placeholder="Repeat your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                isPassword
                returnKeyType="done"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          {/* Benefits */}
          <View style={styles.benefits}>
            {[
              '🌙 AI-powered dream interpretations',
              '📊 Track patterns & recurring themes',
              '🔮 Daily dream insights & affirmations',
              '💜 3 free interpretations per week',
            ].map((benefit) => (
              <Text key={benefit} style={styles.benefitItem}>
                {benefit}
              </Text>
            ))}
          </View>

          <Button
            title="Create Free Account"
            onPress={handleSubmit(onSubmit)}
            isLoading={isLoading}
            fullWidth
            size="lg"
          />

          <Text style={styles.terms}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign in</Text>
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
    paddingTop: 60,
    paddingBottom: SPACING['2xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  benefits: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  benefitItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  terms: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
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
  confirmContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  confirmEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  confirmTitle: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.md,
  },
  confirmEmail: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  confirmHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
