import * as Haptics from 'expo-haptics';

// Centralized haptic feedback helpers.
// Keep calls sparse and meaningful — reserve for primary actions,
// confirmations, and success/error states, not every tap.

export const haptics = {
  /** Light tap — navigation, opening a screen/modal, selecting a tab-like option */
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Medium tap — primary CTA presses (record dream, save) */
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  /** Confirmation of a successful action (dream saved, purchase complete) */
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  /** A warning or destructive action is about to happen (delete confirmation) */
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  /** An action failed (purchase error, save error) */
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  /** Selection change — toggling between plan options, tags, filters */
  selection: () => Haptics.selectionAsync(),
};
