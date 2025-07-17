import { Haptics } from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utility for consistent tactile feedback across the app
 */
class HapticManager {
  constructor() {
    this.isEnabled = true;
    this.isSupported = Platform.OS === 'ios' || (Platform.OS === 'android' && Platform.Version >= 23);
  }

  /**
   * Enable or disable haptic feedback globally
   * @param {boolean} enabled - Whether haptics should be enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Check if haptics are enabled and supported
   * @returns {boolean} - Whether haptics can be used
   */
  canUseHaptics() {
    return this.isEnabled && this.isSupported;
  }

  /**
   * Light impact feedback - for subtle interactions
   * Use for: Button taps, toggle switches, small UI interactions
   */
  light() {
    if (!this.canUseHaptics()) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Medium impact feedback - for standard interactions
   * Use for: Primary button presses, navigation actions, form submissions
   */
  medium() {
    if (!this.canUseHaptics()) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Heavy impact feedback - for significant interactions
   * Use for: Important actions, errors, completion of major tasks
   */
  heavy() {
    if (!this.canUseHaptics()) return;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Success notification feedback
   * Use for: Successful form submissions, task completions, achievements
   */
  success() {
    if (!this.canUseHaptics()) return;
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Warning notification feedback
   * Use for: Validation errors, warnings, attention-needed states
   */
  warning() {
    if (!this.canUseHaptics()) return;
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Error notification feedback
   * Use for: Critical errors, failed operations, destructive actions
   */
  error() {
    if (!this.canUseHaptics()) return;
    
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Selection feedback
   * Use for: Picker selections, menu item selections, option changes
   */
  selection() {
    if (!this.canUseHaptics()) return;
    
    try {
      Haptics.selectionAsync();
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Custom pattern for specific interactions
   * @param {Array} pattern - Array of impact types and delays
   * Example: [{ type: 'light', delay: 0 }, { type: 'medium', delay: 100 }]
   */
  async customPattern(pattern) {
    if (!this.canUseHaptics()) return;
    
    for (const step of pattern) {
      if (step.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
      }
      
      switch (step.type) {
        case 'light':
          this.light();
          break;
        case 'medium':
          this.medium();
          break;
        case 'heavy':
          this.heavy();
          break;
        case 'success':
          this.success();
          break;
        case 'warning':
          this.warning();
          break;
        case 'error':
          this.error();
          break;
        case 'selection':
          this.selection();
          break;
      }
    }
  }

  /**
   * Contextual feedback based on action type
   * @param {string} action - The type of action performed
   * @param {Object} options - Additional options
   */
  contextual(action, options = {}) {
    const { intensity = 'medium', success = true } = options;
    
    switch (action) {
      case 'button_press':
        this[intensity]();
        break;
        
      case 'form_submit':
        if (success) {
          this.success();
        } else {
          this.error();
        }
        break;
        
      case 'navigation':
        this.light();
        break;
        
      case 'toggle':
        this.selection();
        break;
        
      case 'swipe':
        this.light();
        break;
        
      case 'long_press':
        this.medium();
        break;
        
      case 'pull_refresh':
        this.light();
        break;
        
      case 'workout_complete':
        this.customPattern([
          { type: 'medium', delay: 0 },
          { type: 'heavy', delay: 200 },
          { type: 'success', delay: 400 },
        ]);
        break;
        
      case 'goal_achieved':
        this.customPattern([
          { type: 'light', delay: 0 },
          { type: 'medium', delay: 100 },
          { type: 'heavy', delay: 200 },
          { type: 'success', delay: 300 },
        ]);
        break;
        
      case 'error_shake':
        this.customPattern([
          { type: 'warning', delay: 0 },
          { type: 'light', delay: 100 },
          { type: 'light', delay: 200 },
        ]);
        break;
        
      default:
        this.light();
    }
  }
}

// Export singleton instance
const haptics = new HapticManager();

// Convenience functions for common use cases
export const lightHaptic = () => haptics.light();
export const mediumHaptic = () => haptics.medium();
export const heavyHaptic = () => haptics.heavy();
export const successHaptic = () => haptics.success();
export const warningHaptic = () => haptics.warning();
export const errorHaptic = () => haptics.error();
export const selectionHaptic = () => haptics.selection();

// Context-specific haptics
export const buttonPressHaptic = () => haptics.contextual('button_press');
export const navigationHaptic = () => haptics.contextual('navigation');
export const toggleHaptic = () => haptics.contextual('toggle');
export const swipeHaptic = () => haptics.contextual('swipe');
export const longPressHaptic = () => haptics.contextual('long_press');
export const pullRefreshHaptic = () => haptics.contextual('pull_refresh');
export const workoutCompleteHaptic = () => haptics.contextual('workout_complete');
export const goalAchievedHaptic = () => haptics.contextual('goal_achieved');
export const errorShakeHaptic = () => haptics.contextual('error_shake');

export default haptics;