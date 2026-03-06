import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { showErrorAlert } from '@/utils/errorHandler';
import { COLORS, FONT_SIZES, SPACING, RADIUS } from '@/constants/theme';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const { resetPassword, isLoading } = useAuth();
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotForm) => {
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (error) {
      showErrorAlert(error, 'Reset Failed', 'ForgotPasswordScreen');
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
      />

      <View style={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {!sent ? (
          <>
            <Text style={styles.emoji}>🔑</Text>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a reset link.
            </Text>

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
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  containerStyle={{ marginTop: SPACING.lg }}
                />
              )}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSubmit(onSubmit)}
              isLoading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: SPACING.sm }}
            />
          </>
        ) : (
          <>
            <Text style={styles.emoji}>✅</Text>
            <Text style={styles.title}>Email Sent!</Text>
            <Text style={styles.subtitle}>
              We sent a reset link to{'\n'}
              <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
                {getValues('email')}
              </Text>
            </Text>
            <Button
              title="Back to Sign In"
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
              size="lg"
              style={{ marginTop: SPACING.xl }}
            />
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: SPACING['2xl'],
  },
  backText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
});
