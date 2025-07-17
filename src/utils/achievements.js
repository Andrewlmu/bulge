import { successHaptic, goalAchievedHaptic } from './haptics';

/**
 * Achievement and streak system for user engagement and retention
 * Based on behavioral psychology research for male health app users
 */

export const ACHIEVEMENT_TYPES = {
  WORKOUT: 'workout',
  NUTRITION: 'nutrition', 
  WELLNESS: 'wellness',
  CONSISTENCY: 'consistency',
  MILESTONE: 'milestone',
  SOCIAL: 'social',
};

export const ACHIEVEMENT_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver', 
  GOLD: 'gold',
  PLATINUM: 'platinum',
  LEGENDARY: 'legendary',
};

// Achievement definitions based on male motivation research
export const ACHIEVEMENTS = {
  // Workout Achievements
  FIRST_WORKOUT: {
    id: 'first_workout',
    type: ACHIEVEMENT_TYPES.WORKOUT,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    title: 'Getting Started',
    description: 'Complete your first workout',
    icon: 'fitness',
    points: 10,
    requirement: { workouts: 1 },
    masculine_message: 'Every journey begins with a single rep. You\'ve taken the first step.',
  },
  WORKOUT_WARRIOR: {
    id: 'workout_warrior',
    type: ACHIEVEMENT_TYPES.WORKOUT,
    tier: ACHIEVEMENT_TIERS.SILVER,
    title: 'Workout Warrior',
    description: 'Complete 10 workouts',
    icon: 'barbell',
    points: 50,
    requirement: { workouts: 10 },
    masculine_message: 'Consistency beats perfection. You\'re building real strength.',
  },
  IRON_DEDICATION: {
    id: 'iron_dedication',
    type: ACHIEVEMENT_TYPES.WORKOUT,
    tier: ACHIEVEMENT_TIERS.GOLD,
    title: 'Iron Dedication',
    description: 'Complete 50 workouts',
    icon: 'medal',
    points: 200,
    requirement: { workouts: 50 },
    masculine_message: 'Iron sharpens iron. Your dedication is forging an unstoppable you.',
  },
  
  // Consistency Achievements (Critical for male psychology)
  THREE_DAY_STREAK: {
    id: 'three_day_streak',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    title: 'Building Momentum',
    description: 'Log activity for 3 consecutive days',
    icon: 'flame',
    points: 25,
    requirement: { streak: 3 },
    masculine_message: 'Momentum is building. Keep the fire burning.',
  },
  WEEK_WARRIOR: {
    id: 'week_warrior',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    tier: ACHIEVEMENT_TIERS.SILVER,
    title: 'Week Warrior',
    description: 'Log activity for 7 consecutive days',
    icon: 'trending-up',
    points: 75,
    requirement: { streak: 7 },
    masculine_message: 'A week of wins. You\'re proving what consistency can achieve.',
  },
  MONTH_MASTER: {
    id: 'month_master',
    type: ACHIEVEMENT_TYPES.CONSISTENCY,
    tier: ACHIEVEMENT_TIERS.GOLD,
    title: 'Month Master',
    description: 'Log activity for 30 consecutive days',
    icon: 'trophy',
    points: 300,
    requirement: { streak: 30 },
    masculine_message: 'Thirty days of discipline. You\'ve mastered the art of showing up.',
  },
  
  // Nutrition Achievements
  MACRO_TRACKER: {
    id: 'macro_tracker',
    type: ACHIEVEMENT_TYPES.NUTRITION,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    title: 'Macro Tracker',
    description: 'Log meals for 7 days',
    icon: 'restaurant',
    points: 30,
    requirement: { meal_days: 7 },
    masculine_message: 'Knowledge is power. You\'re taking control of your nutrition.',
  },
  PROTEIN_KING: {
    id: 'protein_king',
    type: ACHIEVEMENT_TYPES.NUTRITION,
    tier: ACHIEVEMENT_TIERS.SILVER,
    title: 'Protein King',
    description: 'Hit protein target for 14 days',
    icon: 'nutrition',
    points: 100,
    requirement: { protein_target_days: 14 },
    masculine_message: 'Building blocks of strength. Your muscles are getting the fuel they need.',
  },
  
  // Wellness Achievements (Mental health focus for 2024)
  MIND_WARRIOR: {
    id: 'mind_warrior',
    type: ACHIEVEMENT_TYPES.WELLNESS,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    title: 'Mind Warrior',
    description: 'Complete 5 wellness check-ins',
    icon: 'heart',
    points: 20,
    requirement: { wellness_checkins: 5 },
    masculine_message: 'Mental strength is real strength. You\'re investing in your mind.',
  },
  STRESS_SLAYER: {
    id: 'stress_slayer',
    type: ACHIEVEMENT_TYPES.WELLNESS,
    tier: ACHIEVEMENT_TIERS.SILVER,
    title: 'Stress Slayer',
    description: 'Complete 10 stress management sessions',
    icon: 'shield',
    points: 80,
    requirement: { stress_sessions: 10 },
    masculine_message: 'Pressure makes diamonds. You\'re turning stress into strength.',
  },
  
  // Milestone Achievements
  WEIGHT_GOAL_CRUSHER: {
    id: 'weight_goal_crusher',
    type: ACHIEVEMENT_TYPES.MILESTONE,
    tier: ACHIEVEMENT_TIERS.GOLD,
    title: 'Goal Crusher',
    description: 'Reach your weight goal',
    icon: 'checkmark-circle',
    points: 500,
    requirement: { weight_goal_reached: true },
    masculine_message: 'Goals aren\'t dreams when you have a plan. You just proved it.',
  },
  
  // Social Achievements (Community building)
  COMMUNITY_CONTRIBUTOR: {
    id: 'community_contributor',
    type: ACHIEVEMENT_TYPES.SOCIAL,
    tier: ACHIEVEMENT_TIERS.BRONZE,
    title: 'Community Contributor',
    description: 'Share your first progress update',
    icon: 'people',
    points: 15,
    requirement: { progress_shares: 1 },
    masculine_message: 'Real men lift each other up. Thanks for contributing to the brotherhood.',
  },
  MOTIVATOR: {
    id: 'motivator',
    type: ACHIEVEMENT_TYPES.SOCIAL,
    tier: ACHIEVEMENT_TIERS.SILVER,
    title: 'Motivator',
    description: 'Give encouragement to 10 community members',
    icon: 'thumbs-up',
    points: 60,
    requirement: { encouragements_given: 10 },
    masculine_message: 'Leaders create leaders. Your words are making a difference.',
  },
};

/**
 * Streak tracking for habit formation
 */
export class StreakManager {
  constructor() {
    this.currentStreaks = new Map();
    this.longestStreaks = new Map();
  }

  /**
   * Update streak for a specific activity
   * @param {string} activityType - Type of activity (workout, nutrition, wellness)
   * @param {boolean} completed - Whether activity was completed today
   * @param {Date} date - Date of activity (defaults to today)
   */
  updateStreak(activityType, completed, date = new Date()) {
    const dateKey = this.getDateKey(date);
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = this.getDateKey(yesterday);

    if (!this.currentStreaks.has(activityType)) {
      this.currentStreaks.set(activityType, { count: 0, lastDate: null });
    }

    const streak = this.currentStreaks.get(activityType);

    if (completed) {
      // If this is continuation of streak or first day
      if (!streak.lastDate || streak.lastDate === yesterdayKey) {
        streak.count += 1;
        streak.lastDate = dateKey;
        
        // Update longest streak
        const longestStreak = this.longestStreaks.get(activityType) || 0;
        if (streak.count > longestStreak) {
          this.longestStreaks.set(activityType, streak.count);
        }

        // Check for streak achievements
        this.checkStreakAchievements(activityType, streak.count);
      } else if (streak.lastDate !== dateKey) {
        // Reset streak if gap in days
        streak.count = 1;
        streak.lastDate = dateKey;
      }
    } else {
      // Reset streak if activity not completed
      if (streak.lastDate === yesterdayKey) {
        streak.count = 0;
        streak.lastDate = null;
      }
    }

    this.currentStreaks.set(activityType, streak);
    return streak.count;
  }

  /**
   * Get current streak for activity type
   */
  getCurrentStreak(activityType) {
    const streak = this.currentStreaks.get(activityType);
    return streak ? streak.count : 0;
  }

  /**
   * Get longest streak for activity type
   */
  getLongestStreak(activityType) {
    return this.longestStreaks.get(activityType) || 0;
  }

  /**
   * Check if streak qualifies for achievements
   */
  checkStreakAchievements(activityType, streakCount) {
    const streakAchievements = [
      { count: 3, achievement: ACHIEVEMENTS.THREE_DAY_STREAK },
      { count: 7, achievement: ACHIEVEMENTS.WEEK_WARRIOR },
      { count: 30, achievement: ACHIEVEMENTS.MONTH_MASTER },
    ];

    for (const { count, achievement } of streakAchievements) {
      if (streakCount === count) {
        this.unlockAchievement(achievement);
        break;
      }
    }
  }

  getDateKey(date) {
    return date.toISOString().split('T')[0];
  }

  unlockAchievement(achievement) {
    // Trigger achievement unlock with haptic feedback
    goalAchievedHaptic();
    
    // This would typically save to storage and show UI
    console.log(`🏆 Achievement Unlocked: ${achievement.title}!`);
    
    return {
      achievement,
      timestamp: new Date(),
      points: achievement.points,
    };
  }
}

/**
 * Achievement tracking system
 */
export class AchievementManager {
  constructor() {
    this.unlockedAchievements = new Set();
    this.progress = new Map();
    this.totalPoints = 0;
  }

  /**
   * Update progress towards achievements
   * @param {string} metricType - Type of metric being updated
   * @param {number} value - New value for the metric
   */
  updateProgress(metricType, value) {
    this.progress.set(metricType, value);
    this.checkAchievements();
  }

  /**
   * Check all achievements for unlock conditions
   */
  checkAchievements() {
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!this.unlockedAchievements.has(achievement.id)) {
        if (this.meetsRequirement(achievement.requirement)) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }

  /**
   * Check if user meets achievement requirement
   */
  meetsRequirement(requirement) {
    for (const [key, requiredValue] of Object.entries(requirement)) {
      const currentValue = this.progress.get(key) || 0;
      if (currentValue < requiredValue) {
        return false;
      }
    }
    return true;
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievement) {
    this.unlockedAchievements.add(achievement.id);
    this.totalPoints += achievement.points;
    
    // Haptic feedback based on tier
    switch (achievement.tier) {
      case ACHIEVEMENT_TIERS.LEGENDARY:
      case ACHIEVEMENT_TIERS.PLATINUM:
        goalAchievedHaptic();
        break;
      case ACHIEVEMENT_TIERS.GOLD:
        goalAchievedHaptic();
        break;
      default:
        successHaptic();
    }

    // Return achievement data for UI display
    return {
      achievement,
      timestamp: new Date(),
      isNewUnlock: true,
      totalPoints: this.totalPoints,
    };
  }

  /**
   * Get achievement progress as percentage
   */
  getAchievementProgress(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    if (!achievement) return 0;

    if (this.unlockedAchievements.has(achievementId)) {
      return 100;
    }

    const requirement = achievement.requirement;
    let totalProgress = 0;
    let totalRequirements = 0;

    for (const [key, requiredValue] of Object.entries(requirement)) {
      const currentValue = Math.min(this.progress.get(key) || 0, requiredValue);
      totalProgress += (currentValue / requiredValue) * 100;
      totalRequirements += 100;
    }

    return totalRequirements > 0 ? Math.round(totalProgress / totalRequirements) : 0;
  }

  /**
   * Get user's current level based on total points
   */
  getUserLevel() {
    const levels = [
      { level: 1, points: 0, title: 'Beginner' },
      { level: 2, points: 100, title: 'Committed' },
      { level: 3, points: 300, title: 'Dedicated' },
      { level: 4, points: 600, title: 'Warrior' },
      { level: 5, points: 1000, title: 'Champion' },
      { level: 6, points: 1500, title: 'Legend' },
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (this.totalPoints >= levels[i].points) {
        const nextLevel = levels[i + 1];
        return {
          ...levels[i],
          pointsToNext: nextLevel ? nextLevel.points - this.totalPoints : 0,
          nextLevelTitle: nextLevel?.title,
        };
      }
    }

    return levels[0];
  }

  /**
   * Get achievements by category for display
   */
  getAchievementsByCategory() {
    const categories = {};
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!categories[achievement.type]) {
        categories[achievement.type] = [];
      }
      
      categories[achievement.type].push({
        ...achievement,
        unlocked: this.unlockedAchievements.has(achievement.id),
        progress: this.getAchievementProgress(achievement.id),
      });
    });

    return categories;
  }

  /**
   * Get recent achievements for display
   */
  getRecentAchievements(limit = 5) {
    // This would typically come from storage with timestamps
    return Array.from(this.unlockedAchievements)
      .map(id => Object.values(ACHIEVEMENTS).find(a => a.id === id))
      .slice(-limit);
  }
}

// Export singleton instances
export const streakManager = new StreakManager();
export const achievementManager = new AchievementManager();

// Utility functions for easy integration
export const updateWorkoutStreak = (completed) => {
  return streakManager.updateStreak('workout', completed);
};

export const updateNutritionStreak = (completed) => {
  return streakManager.updateStreak('nutrition', completed);
};

export const updateWellnessStreak = (completed) => {
  return streakManager.updateStreak('wellness', completed);
};

export const updateWorkoutCount = (count) => {
  achievementManager.updateProgress('workouts', count);
};

export const updateMealDays = (days) => {
  achievementManager.updateProgress('meal_days', days);
};

export const updateWellnessCheckins = (count) => {
  achievementManager.updateProgress('wellness_checkins', count);
};

export default {
  streakManager,
  achievementManager,
  ACHIEVEMENTS,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_TIERS,
};