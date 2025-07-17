import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Production-ready push notification service
 * Handles registration, scheduling, and intelligent delivery
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.pushToken = null;
    this.isInitialized = false;
    this.lastNotificationTime = {};
    this.config = {
      enableNotifications: true,
      quietHours: { start: 22, end: 7 }, // 10 PM to 7 AM
      maxDailyNotifications: 3,
      intelligentTiming: true,
    };
  }

  /**
   * Initialize notification service
   */
  async initialize() {
    try {
      // Check device capability
      if (!Device.isDevice) {
        console.log('Notifications require a physical device');
        return;
      }

      // Check user consent
      const consent = await this.getNotificationConsent();
      if (!consent) {
        console.log('Notifications disabled - no user consent');
        return;
      }

      // Request permissions
      const { status } = await this.requestPermissions();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return;
      }

      // Get push token
      this.pushToken = await this.getPushToken();
      
      // Load user preferences
      await this.loadUserPreferences();

      // Set up notification listeners
      this.setupNotificationListeners();

      // Schedule intelligent notifications
      await this.scheduleIntelligentNotifications();

      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return { status: finalStatus };
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return { status: 'denied' };
    }
  }

  /**
   * Get push notification token
   */
  async getPushToken() {
    try {
      let token = await AsyncStorage.getItem('push_token');
      
      if (!token) {
        const { data } = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        token = data;
        await AsyncStorage.setItem('push_token', token);
      }

      console.log('Push token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Check user consent for notifications
   */
  async getNotificationConsent() {
    try {
      const consent = await AsyncStorage.getItem('notification_consent');
      return consent === 'true';
    } catch (error) {
      console.error('Failed to get notification consent:', error);
      return false;
    }
  }

  /**
   * Set user consent for notifications
   */
  async setNotificationConsent(enabled) {
    try {
      await AsyncStorage.setItem('notification_consent', enabled.toString());
      this.config.enableNotifications = enabled;

      if (!enabled) {
        // Cancel all scheduled notifications
        await this.cancelAllNotifications();
      } else if (this.isInitialized) {
        // Re-schedule notifications
        await this.scheduleIntelligentNotifications();
      }
    } catch (error) {
      console.error('Failed to set notification consent:', error);
    }
  }

  /**
   * Load user notification preferences
   */
  async loadUserPreferences() {
    try {
      const preferences = await AsyncStorage.getItem('notification_preferences');
      if (preferences) {
        this.config = { ...this.config, ...JSON.parse(preferences) };
      }
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(preferences) {
    try {
      this.config = { ...this.config, ...preferences };
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.config));
      
      // Re-schedule notifications with new preferences
      await this.scheduleIntelligentNotifications();
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  }

  /**
   * Set up notification event listeners
   */
  setupNotificationListeners() {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      this.handleNotificationReceived(notification);
    });

    // Handle notification response (user tapped notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Handle notification received in foreground
   */
  handleNotificationReceived(notification) {
    // Track notification analytics
    // analytics.track('notification_received', {
    //   type: notification.request.content.data?.type,
    //   title: notification.request.content.title,
    // });
  }

  /**
   * Handle user response to notification
   */
  handleNotificationResponse(response) {
    const { notification } = response;
    const data = notification.request.content.data;

    // Track notification engagement
    // analytics.track('notification_opened', {
    //   type: data?.type,
    //   action: response.actionIdentifier,
    // });

    // Handle deep linking based on notification data
    if (data?.screen) {
      // navigation.navigate(data.screen, data.params);
    }
  }

  /**
   * Schedule intelligent notifications based on user behavior
   */
  async scheduleIntelligentNotifications() {
    if (!this.config.enableNotifications) return;

    try {
      // Cancel existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule workout reminders
      await this.scheduleWorkoutReminders();

      // Schedule achievement celebrations
      await this.scheduleAchievementNotifications();

      // Schedule streak maintenance
      await this.scheduleStreakReminders();

      // Schedule health tips
      await this.scheduleHealthTips();

      console.log('Intelligent notifications scheduled');
    } catch (error) {
      console.error('Failed to schedule notifications:', error);
    }
  }

  /**
   * Schedule workout reminder notifications
   */
  async scheduleWorkoutReminders() {
    const userStats = await this.getUserStats();
    const preferredWorkoutTime = userStats?.preferredWorkoutTime || 18; // 6 PM default

    // Schedule daily workout reminders
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Build Strength 💪",
        body: "Your body is ready for today's workout. Let's crush those goals!",
        data: { type: 'workout_reminder', screen: 'Workout' },
        sound: 'notification-sound.wav',
      },
      trigger: {
        hour: preferredWorkoutTime,
        minute: 0,
        repeats: true,
      },
    });

    // Schedule rest day reminders (every 3 days)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Recovery Day 🧘‍♂️",
        body: "Your muscles grow during rest. Consider some light stretching or meditation.",
        data: { type: 'rest_reminder', screen: 'Recovery' },
      },
      trigger: {
        hour: preferredWorkoutTime - 2,
        minute: 0,
        weekday: 3, // Wednesday
        repeats: true,
      },
    });
  }

  /**
   * Schedule achievement celebration notifications
   */
  async scheduleAchievementNotifications() {
    // These would be triggered dynamically when achievements are earned
    // This is a placeholder for the scheduling logic
  }

  /**
   * Schedule streak reminder notifications
   */
  async scheduleStreakReminders() {
    // Evening streak reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Maintain Your Streak 🔥",
        body: "You're doing great! Log today's progress to keep your streak alive.",
        data: { type: 'streak_reminder', screen: 'Dashboard' },
      },
      trigger: {
        hour: 20, // 8 PM
        minute: 0,
        repeats: true,
      },
    });
  }

  /**
   * Schedule health tip notifications
   */
  async scheduleHealthTips() {
    const tips = [
      {
        title: "Hydration Boost 💧",
        body: "Drink a glass of water. Your body is 60% water - keep it topped up!",
      },
      {
        title: "Posture Check 🏃‍♂️",
        body: "Stand tall, shoulders back. Good posture boosts confidence and health.",
      },
      {
        title: "Deep Breath 🫁",
        body: "Take 3 deep breaths. Proper breathing reduces stress and improves focus.",
      },
      {
        title: "Move More 🚶‍♂️",
        body: "Take a 5-minute walk. Movement is medicine for both body and mind.",
      },
    ];

    // Schedule random tips throughout the week
    for (let i = 0; i < tips.length; i++) {
      const tip = tips[i];
      await Notifications.scheduleNotificationAsync({
        content: {
          title: tip.title,
          body: tip.body,
          data: { type: 'health_tip', screen: 'Dashboard' },
        },
        trigger: {
          hour: 14, // 2 PM
          minute: 0,
          weekday: (i + 1) % 7, // Spread across weekdays
          repeats: true,
        },
      });
    }
  }

  /**
   * Send immediate notification for achievements
   */
  async sendAchievementNotification(achievement) {
    if (!this.config.enableNotifications) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🏆 ${achievement.title} Unlocked!`,
          body: achievement.masculine_message || achievement.description,
          data: { 
            type: 'achievement_unlocked', 
            achievementId: achievement.id,
            screen: 'Achievements' 
          },
          badge: 1,
        },
        trigger: null, // Send immediately
      });

      console.log('Achievement notification sent:', achievement.title);
    } catch (error) {
      console.error('Failed to send achievement notification:', error);
    }
  }

  /**
   * Send streak milestone notification
   */
  async sendStreakMilestone(streak, milestone) {
    if (!this.config.enableNotifications) return;

    const messages = {
      7: "One week strong! You're building unstoppable momentum.",
      30: "30 days of commitment! You're in the top 10% of men who stick to their goals.",
      100: "100 days! You've transformed discipline into lifestyle. Legendary status achieved.",
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔥 ${milestone} Day Streak!`,
          body: messages[milestone] || `${milestone} days of consistency! You're unstoppable.`,
          data: { 
            type: 'streak_milestone', 
            streak: streak,
            milestone: milestone,
            screen: 'Dashboard' 
          },
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send streak milestone notification:', error);
    }
  }

  /**
   * Check if notification should be sent (respects quiet hours and limits)
   */
  shouldSendNotification(type) {
    const now = new Date();
    const hour = now.getHours();
    
    // Check quiet hours
    if (hour >= this.config.quietHours.start || hour < this.config.quietHours.end) {
      return false;
    }

    // Check daily limits
    const today = now.toDateString();
    const todayCount = this.lastNotificationTime[today] || 0;
    
    if (todayCount >= this.config.maxDailyNotifications) {
      return false;
    }

    return true;
  }

  /**
   * Track notification sent
   */
  trackNotificationSent(type) {
    const today = new Date().toDateString();
    this.lastNotificationTime[today] = (this.lastNotificationTime[today] || 0) + 1;
  }

  /**
   * Get user stats for intelligent scheduling
   */
  async getUserStats() {
    try {
      const stats = await AsyncStorage.getItem('user_stats');
      return stats ? JSON.parse(stats) : {};
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {};
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return {
        scheduledCount: scheduled.length,
        pushToken: this.pushToken,
        isEnabled: this.config.enableNotifications,
        preferences: this.config,
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {};
    }
  }
}

// Export singleton instance
const notificationService = new NotificationService();

// Convenience functions
export const initializeNotifications = () => notificationService.initialize();
export const requestNotificationPermissions = () => notificationService.requestPermissions();
export const setNotificationConsent = (enabled) => notificationService.setNotificationConsent(enabled);
export const updateNotificationPreferences = (preferences) => notificationService.updatePreferences(preferences);
export const sendAchievementNotification = (achievement) => notificationService.sendAchievementNotification(achievement);
export const sendStreakMilestone = (streak, milestone) => notificationService.sendStreakMilestone(streak, milestone);
export const cancelAllNotifications = () => notificationService.cancelAllNotifications();
export const getNotificationStats = () => notificationService.getNotificationStats();

export default notificationService;