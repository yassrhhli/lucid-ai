import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { COLORS, FONT_SIZES, RADIUS, SPACING } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      isPassword = false,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.focused,
            !!error && styles.errorBorder,
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon ? styles.inputWithLeftIcon : null,
              (rightIcon || isPassword) ? styles.inputWithRightIcon : null,
              style,
            ]}
            placeholderTextColor={COLORS.textMuted}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            secureTextEntry={isPassword && !showPassword}
            autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
            autoCorrect={isPassword ? false : props.autoCorrect}
            {...props}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.showHideText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          )}

          {rightIcon && !isPassword && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {rightIcon}
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  focused: {
    borderColor: COLORS.primary,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    minHeight: 48,
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.xs,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.xs,
  },
  leftIcon: {
    paddingLeft: SPACING.md,
  },
  rightIcon: {
    paddingRight: SPACING.md,
  },
  showHideText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  error: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: 2,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginLeft: 2,
  },
});
