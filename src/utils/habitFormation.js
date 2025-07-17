import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, startOfDay, differenceInDays } from 'date-fns';
import { successHaptic, warningHaptic } from './haptics';

/**
 * Habit formation system using behavioral psychology principles
 * Based on research for male health app engagement and retention
 */

export const HABIT_TYPES = {
  WORKOUT: 'workout',
  NUTRITION: 'nutrition',
  WELLNESS: 'wellness',
  SLEEP: 'sleep',
  HYDRATION: 'hydration',
};

export const NUDGE_TYPES = {
  REMINDER: 'reminder',
  ENCOURAGEMENT: 'encouragement',
  STREAK_PROTECTION: 'streak_protection',
  SOCIAL_PROOF: 'social_proof',
  LOSS_AVERSION: 'loss_aversion',
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  COMEBACK: 'comeback',
};

/**
 * Smart notification timing based on male behavior patterns
 */
const OPTIMAL_TIMES = {
  [HABIT_TYPES.WORKOUT]: [
    { hour: 6, minute: 30, label: 'Morning Energy' },
    { hour: 12, minute: 0, label: 'Lunch Break' },
    { hour: 17, minute: 30, label: 'After Work' },
  ],
  [HABIT_TYPES.NUTRITION]: [
    { hour: 8, minute: 0, label: 'Breakfast' },
    { hour: 12, minute: 30, label: 'Lunch' },
    { hour: 19, minute: 0, label: 'Dinner' },
  ],
  [HABIT_TYPES.WELLNESS]: [
    { hour: 9, minute: 0, label: 'Morning Check-in' },
    { hour: 15, minute: 0, label: 'Afternoon Reflection' },
    { hour: 21, minute: 0, label: 'Evening Wind-down' },
  ],
  [HABIT_TYPES.SLEEP]: [
    { hour: 21, minute: 30, label: 'Sleep Prep' },
    { hour: 22, minute: 30, label: 'Bedtime Reminder' },
  ],
  [HABIT_TYPES.HYDRATION]: [
    { hour: 7, minute: 0, label: 'Morning Hydration' },
    { hour: 14, minute: 0, label: 'Afternoon Hydration' },
    { hour: 17, minute: 0, label: 'Pre-Workout' },
  ],
};

/**
 * Motivational messages tailored for male psychology
 */
const MOTIVATIONAL_MESSAGES = {
  [HABIT_TYPES.WORKOUT]: {
    start: [
      "Time to forge strength. Your future self will thank you.",
      "Every rep builds the man you're becoming.",
      "Champions show up when they don't feel like it.",
      "Your only competition is who you were yesterday.",
    ],
    streak: [
      "Day {streak}: Consistency is your superpower.",
      "Streak of {streak}! You're building unstoppable momentum.",
      "Day {streak} of proving what discipline looks like.",
    ],
    comeback: [
      "Every champion has comeback stories. This is yours.",
      "Setbacks are setups for comebacks. Let's go.",
      "The best time to start was yesterday. The second best is now.",
    ],
  },
  [HABIT_TYPES.NUTRITION]: {
    start: [
      "Fuel your machine like the champion you are.",
      "Your body is your temple. Feed it like royalty.",
      "Great nutrition today = unstoppable energy tomorrow.",
    ],
    streak: [
      "{streak} days of feeding success. Your body notices.",
      "Nutrition streak: {streak}. You're programming excellence.",
    ],
    comeback: [
      "Back to fueling your success. One meal at a time.",
      "Your nutrition comeback starts with this meal.",
    ],
  },
  [HABIT_TYPES.WELLNESS]: {
    start: [
      "Mental strength is real strength. Check in with yourself.",
      "High performers track their inner game too.",
      "Your mindset shapes your reality. Tune it up.",
    ],
    streak: [
      "{streak} days of mental fitness. Mind = muscle.",
      "Wellness streak: {streak}. Your mental game is strong.",
    ],
    comeback: [
      "Mental fitness comeback time. Your mind matters.",
      "Champions work on their inner game. Welcome back.",
    ],
  },
};

/**
 * Habit formation manager with behavioral psychology
 */
export class HabitFormationManager {
  constructor() {
    this.habits = new Map();
    this.nudgeHistory = [];
    this.userPreferences = {};
    this.storageKey = 'habit_formation_data';
  }

  /**
   * Initialize habit tracking for a user
   */
  async initialize(userId) {
    try {
      const stored = await AsyncStorage.getItem(`${this.storageKey}_${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        this.habits = new Map(data.habits || []);
        this.nudgeHistory = data.nudgeHistory || [];
        this.userPreferences = data.userPreferences || {};
      }
    } catch (error) {
      console.error('Error initializing habit formation:', error);
    }
  }

  /**
   * Save habit data to storage
   */
  async saveData(userId) {
    try {
      const data = {
        habits: Array.from(this.habits.entries()),
        nudgeHistory: this.nudgeHistory,
        userPreferences: this.userPreferences,
        lastUpdated: new Date().toISOString(),
      };
      await AsyncStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving habit formation data:', error);
    }
  }

  /**
   * Track habit completion
   */
  async trackHabit(habitType, completed = true, timestamp = new Date()) {
    const dateKey = format(startOfDay(timestamp), 'yyyy-MM-dd');
    
    if (!this.habits.has(habitType)) {
      this.habits.set(habitType, {
        streak: 0,
        longestStreak: 0,
        totalCompletions: 0,
        completionDates: [],
        lastCompleted: null,
        preferences: {
          reminderTime: this.getOptimalTime(habitType),
          enabled: true,
        },
      });
    }

    const habit = this.habits.get(habitType);

    if (completed) {
      // Don't double-count same day
      if (!habit.completionDates.includes(dateKey)) {
        habit.completionDates.push(dateKey);
        habit.totalCompletions += 1;
        habit.lastCompleted = dateKey;

        // Update streak
        this.updateStreak(habitType, timestamp);
        
        // Trigger positive feedback
        successHaptic();
        
        // Schedule next nudge
        this.scheduleNextNudge(habitType);
      }
    }

    this.habits.set(habitType, habit);
    return habit;
  }

  /**
   * Update streak calculation with smart logic
   */
  updateStreak(habitType, timestamp = new Date()) {
    const habit = this.habits.get(habitType);
    if (!habit) return;

    const today = format(startOfDay(timestamp), 'yyyy-MM-dd');
    const yesterday = format(startOfDay(new Date(timestamp.getTime() - 24 * 60 * 60 * 1000)), 'yyyy-MM-dd');

    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = habit.completionDates.sort().reverse();

    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const expectedDate = format(
        startOfDay(new Date(timestamp.getTime() - i * 24 * 60 * 60 * 1000)),
        'yyyy-MM-dd'
      );

      if (date === expectedDate) {
        currentStreak++;
      } else {
        break;
      }
    }

    habit.streak = currentStreak;
    habit.longestStreak = Math.max(habit.longestStreak, currentStreak);
    
    this.habits.set(habitType, habit);
  }

  /**
   * Get optimal notification time for habit type
   */
  getOptimalTime(habitType) {
    const times = OPTIMAL_TIMES[habitType] || OPTIMAL_TIMES[HABIT_TYPES.WORKOUT];
    const now = new Date();
    const currentHour = now.getHours();

    // Find next optimal time after current time
    for (const time of times) {
      if (time.hour > currentHour || (time.hour === currentHour && time.minute > now.getMinutes())) {
        return time;
      }
    }

    // If no time today, return first time tomorrow
    return times[0];
  }

  /**
   * Generate smart nudge based on context and user behavior
   */
  generateNudge(habitType, context = {}) {
    const habit = this.habits.get(habitType) || {};
    const { streak = 0, lastCompleted } = habit;
    const { userStats = {}, timeOfDay = 'morning' } = context;

    // Determine nudge type based on context
    let nudgeType = NUDGE_TYPES.REMINDER;
    let urgency = 'low';
    
    const daysSinceLastCompleted = lastCompleted ? 
      differenceInDays(new Date(), new Date(lastCompleted)) : 999;

    if (streak >= 7 && daysSinceLastCompleted === 1) {
      nudgeType = NUDGE_TYPES.STREAK_PROTECTION;
      urgency = 'high';
    } else if (streak >= 3 && daysSinceLastCompleted === 0) {
      nudgeType = NUDGE_TYPES.ENCOURAGEMENT;
      urgency = 'medium';
    } else if (daysSinceLastCompleted >= 3) {
      nudgeType = NUDGE_TYPES.COMEBACK;
      urgency = 'high';
    } else if (userStats.achievements?.recent) {
      nudgeType = NUDGE_TYPES.ACHIEVEMENT_UNLOCK;
      urgency = 'medium';
    }

    return this.createNudgeMessage(habitType, nudgeType, { streak, urgency, timeOfDay });
  }

  /**
   * Create contextual nudge message
   */
  createNudgeMessage(habitType, nudgeType, context = {}) {
    const { streak = 0, urgency = 'low', timeOfDay = 'morning' } = context;
    const messages = MOTIVATIONAL_MESSAGES[habitType] || MOTIVATIONAL_MESSAGES[HABIT_TYPES.WORKOUT];

    let title = '';
    let body = '';
    let actionLabel = 'Let\'s Go';

    switch (nudgeType) {
      case NUDGE_TYPES.STREAK_PROTECTION:
        title = `Don't Break the Chain!`;
        body = `Your ${streak}-day streak is counting on you. Champions protect their momentum.`;
        actionLabel = 'Protect My Streak';
        break;

      case NUDGE_TYPES.ENCOURAGEMENT:
        const encouragementMsg = messages.streak[Math.floor(Math.random() * messages.streak.length)];
        title = 'Keep the Momentum';
        body = encouragementMsg.replace('{streak}', streak);
        actionLabel = 'Continue Streak';
        break;

      case NUDGE_TYPES.COMEBACK:
        const comebackMsg = messages.comeback[Math.floor(Math.random() * messages.comeback.length)];
        title = 'Your Comeback Starts Now';
        body = comebackMsg;
        actionLabel = 'Make a Comeback';
        break;

      case NUDGE_TYPES.SOCIAL_PROOF:
        title = 'Join the Top Performers';
        body = `85% of users who maintain ${habitType} habits achieve their goals faster. You're almost there.`;
        actionLabel = 'Join the Elite';
        break;

      case NUDGE_TYPES.ACHIEVEMENT_UNLOCK:
        title = 'Achievement Within Reach';
        body = `One more ${habitType} session unlocks your next achievement. Finish strong.`;
        actionLabel = 'Unlock Achievement';
        break;

      default:
        const startMsg = messages.start[Math.floor(Math.random() * messages.start.length)];
        title = this.getTimeBasedTitle(timeOfDay);
        body = startMsg;
        actionLabel = 'Start Now';
    }

    return {
      id: Date.now().toString(),
      habitType,
      nudgeType,
      title,
      body,
      actionLabel,
      urgency,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  /**
   * Get time-based greeting
   */
  getTimeBasedTitle(timeOfDay) {
    switch (timeOfDay) {
      case 'morning':
        return 'Rise and Grind';
      case 'afternoon':
        return 'Power Through';
      case 'evening':
        return 'Finish Strong';
      default:
        return 'Time to Level Up';
    }
  }

  /**
   * Schedule next nudge with smart timing
   */
  scheduleNextNudge(habitType) {
    const habit = this.habits.get(habitType);
    if (!habit || !habit.preferences.enabled) return;

    const optimalTime = habit.preferences.reminderTime || this.getOptimalTime(habitType);
    
    // Create nudge for next day
    const nextNudgeTime = new Date();
    nextNudgeTime.setDate(nextNudgeTime.getDate() + 1);
    nextNudgeTime.setHours(optimalTime.hour, optimalTime.minute, 0, 0);

    // Store for notification scheduling (would integrate with notification service)
    this.nudgeHistory.push({
      habitType,
      scheduledFor: nextNudgeTime.toISOString(),
      type: 'scheduled_reminder',
    });
  }

  /**
   * Get habit insights for dashboard
   */
  getHabitInsights(habitType) {
    const habit = this.habits.get(habitType);
    if (!habit) return null;

    const completionRate = this.getCompletionRate(habitType, 30); // Last 30 days
    const consistency = this.getConsistencyScore(habitType);
    const trend = this.getTrend(habitType);

    return {
      ...habit,
      completionRate,
      consistency,
      trend,
      insights: this.generateInsights(habitType, { completionRate, consistency, trend }),
    };
  }

  /**
   * Calculate completion rate for period
   */
  getCompletionRate(habitType, days = 30) {
    const habit = this.habits.get(habitType);
    if (!habit) return 0;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const completedDays = habit.completionDates.filter(date => {
      return new Date(date) >= startDate;
    }).length;

    return Math.round((completedDays / days) * 100);
  }

  /**
   * Calculate consistency score (streak stability)
   */
  getConsistencyScore(habitType) {
    const habit = this.habits.get(habitType);
    if (!habit || habit.completionDates.length < 7) return 0;

    // Look at last 30 days and calculate streak stability
    const recentDates = habit.completionDates.slice(-30);
    let streaks = [];
    let currentStreak = 0;

    for (let i = 0; i < recentDates.length; i++) {
      if (i === 0 || this.isConsecutive(recentDates[i - 1], recentDates[i])) {
        currentStreak++;
      } else {
        if (currentStreak > 0) streaks.push(currentStreak);
        currentStreak = 1;
      }
    }
    if (currentStreak > 0) streaks.push(currentStreak);

    // Higher score for fewer, longer streaks
    const avgStreakLength = streaks.reduce((a, b) => a + b, 0) / streaks.length;
    const maxStreak = Math.max(...streaks);
    
    return Math.min(100, Math.round((avgStreakLength * 0.6 + maxStreak * 0.4) * 10));
  }

  /**
   * Check if two dates are consecutive
   */
  isConsecutive(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return differenceInDays(d2, d1) === 1;
  }

  /**
   * Get trend direction
   */
  getTrend(habitType, days = 14) {
    const habit = this.habits.get(habitType);
    if (!habit) return 'stable';

    const now = new Date();
    const midPoint = new Date(now.getTime() - (days / 2) * 24 * 60 * 60 * 1000);
    const startPoint = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const firstHalf = habit.completionDates.filter(date => {
      const d = new Date(date);
      return d >= startPoint && d < midPoint;
    }).length;

    const secondHalf = habit.completionDates.filter(date => {
      const d = new Date(date);
      return d >= midPoint && d <= now;
    }).length;

    const difference = secondHalf - firstHalf;
    
    if (difference >= 2) return 'improving';
    if (difference <= -2) return 'declining';
    return 'stable';
  }

  /**
   * Generate actionable insights
   */
  generateInsights(habitType, metrics) {
    const { completionRate, consistency, trend } = metrics;
    const insights = [];

    if (completionRate < 50) {
      insights.push({
        type: 'improvement',
        title: 'Build Momentum',
        message: 'Start with small wins. Consistency beats perfection.',
        action: 'Set a smaller daily goal',
      });
    } else if (completionRate > 80) {
      insights.push({
        type: 'achievement',
        title: 'Strong Performance',
        message: 'You\'re in the top 20% of users. Keep it up!',
        action: 'Consider increasing your goal',
      });
    }

    if (consistency < 40) {
      insights.push({
        type: 'strategy',
        title: 'Improve Consistency',
        message: 'Focus on building longer streaks rather than perfect completion.',
        action: 'Set streak goals',
      });
    }

    if (trend === 'declining') {
      insights.push({
        type: 'warning',
        title: 'Trend Alert',
        message: 'Your habit is declining. Time to recommit.',
        action: 'Review your strategy',
      });
    } else if (trend === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Upward Trend',
        message: 'You\'re building unstoppable momentum!',
        action: 'Keep the pressure on',
      });
    }

    return insights;
  }
}

// Export singleton instance
export const habitFormationManager = new HabitFormationManager();

// Utility functions
export const trackWorkout = () => habitFormationManager.trackHabit(HABIT_TYPES.WORKOUT, true);
export const trackNutrition = () => habitFormationManager.trackHabit(HABIT_TYPES.NUTRITION, true);
export const trackWellness = () => habitFormationManager.trackHabit(HABIT_TYPES.WELLNESS, true);

export default habitFormationManager;