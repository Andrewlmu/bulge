import {
  ACHIEVEMENTS,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_TIERS,
  checkAchievements,
  unlockAchievement,
  getAchievementProgress,
  calculateUserLevel,
  getStreakAchievements,
} from '../../src/utils/achievements';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('Achievement Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('[]');
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('Achievement Constants', () => {
    test('has all required achievement types', () => {
      expect(ACHIEVEMENT_TYPES).toHaveProperty('WORKOUT');
      expect(ACHIEVEMENT_TYPES).toHaveProperty('STREAK');
      expect(ACHIEVEMENT_TYPES).toHaveProperty('NUTRITION');
      expect(ACHIEVEMENT_TYPES).toHaveProperty('SOCIAL');
      expect(ACHIEVEMENT_TYPES).toHaveProperty('MILESTONE');
    });

    test('has proper tier hierarchy', () => {
      expect(ACHIEVEMENT_TIERS.BRONZE).toBe(1);
      expect(ACHIEVEMENT_TIERS.SILVER).toBe(2);
      expect(ACHIEVEMENT_TIERS.GOLD).toBe(3);
      expect(ACHIEVEMENT_TIERS.PLATINUM).toBe(4);
      expect(ACHIEVEMENT_TIERS.LEGENDARY).toBe(5);
    });

    test('achievements have required properties', () => {
      Object.values(ACHIEVEMENTS).forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('title');
        expect(achievement).toHaveProperty('type');
        expect(achievement).toHaveProperty('tier');
        expect(achievement).toHaveProperty('masculine_message');
      });
    });
  });

  describe('checkAchievements Function', () => {
    test('detects first workout achievement', async () => {
      const userStats = {
        totalWorkouts: 1,
        unlockedAchievements: [],
      };

      const results = await checkAchievements('workout_completed', userStats);
      
      const firstWorkout = results.find(a => a.id === 'FIRST_WORKOUT');
      expect(firstWorkout).toBeTruthy();
      expect(firstWorkout.newlyUnlocked).toBe(true);
    });

    test('detects week streak achievement', async () => {
      const userStats = {
        currentStreak: 7,
        unlockedAchievements: [],
      };

      const results = await checkAchievements('streak_updated', userStats);
      
      const weekStreak = results.find(a => a.id === 'WEEK_WARRIOR');
      expect(weekStreak).toBeTruthy();
      expect(weekStreak.newlyUnlocked).toBe(true);
    });

    test('does not re-unlock existing achievements', async () => {
      const userStats = {
        totalWorkouts: 10,
        unlockedAchievements: ['FIRST_WORKOUT', 'WORKOUT_ENTHUSIAST'],
      };

      const results = await checkAchievements('workout_completed', userStats);
      
      const firstWorkout = results.find(a => a.id === 'FIRST_WORKOUT');
      expect(firstWorkout?.newlyUnlocked).toBeFalsy();
    });

    test('handles multiple achievement unlocks', async () => {
      const userStats = {
        totalWorkouts: 10,
        currentStreak: 7,
        totalPoints: 1000,
        unlockedAchievements: [],
      };

      const results = await checkAchievements('workout_completed', userStats);
      
      expect(results.length).toBeGreaterThan(1);
      expect(results.filter(a => a.newlyUnlocked)).toHaveLength(
        expect.any(Number)
      );
    });
  });

  describe('unlockAchievement Function', () => {
    test('unlocks new achievement successfully', async () => {
      AsyncStorage.getItem.mockResolvedValue('[]');
      
      const result = await unlockAchievement('FIRST_WORKOUT', { userId: 'test-user' });
      
      expect(result).toHaveProperty('id', 'FIRST_WORKOUT');
      expect(result).toHaveProperty('unlockedAt');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_achievements',
        expect.stringContaining('FIRST_WORKOUT')
      );
    });

    test('prevents duplicate achievement unlock', async () => {
      const existingAchievements = [
        { id: 'FIRST_WORKOUT', unlockedAt: Date.now() - 86400000 }
      ];
      
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingAchievements));
      
      const result = await unlockAchievement('FIRST_WORKOUT', { userId: 'test-user' });
      
      expect(result).toBeNull();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    test('handles storage errors gracefully', async () => {
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      
      const result = await unlockAchievement('FIRST_WORKOUT', { userId: 'test-user' });
      
      expect(result).toBeNull();
    });
  });

  describe('getAchievementProgress Function', () => {
    test('calculates workout achievement progress', () => {
      const userStats = {
        totalWorkouts: 5,
        pushWorkouts: 3,
        pullWorkouts: 2,
        legWorkouts: 1,
      };

      const progress = getAchievementProgress('WORKOUT_ENTHUSIAST', userStats);
      
      expect(progress).toEqual({
        current: 5,
        target: 10,
        percentage: 50,
        completed: false,
      });
    });

    test('calculates streak achievement progress', () => {
      const userStats = {
        currentStreak: 5,
        longestStreak: 12,
      };

      const progress = getAchievementProgress('WEEK_WARRIOR', userStats);
      
      expect(progress.current).toBe(5);
      expect(progress.target).toBe(7);
      expect(progress.percentage).toBeCloseTo(71.4, 1);
    });

    test('marks completed achievements correctly', () => {
      const userStats = {
        totalWorkouts: 15,
      };

      const progress = getAchievementProgress('WORKOUT_ENTHUSIAST', userStats);
      
      expect(progress.completed).toBe(true);
      expect(progress.percentage).toBe(100);
    });

    test('handles missing user stats gracefully', () => {
      const progress = getAchievementProgress('FIRST_WORKOUT', {});
      
      expect(progress.current).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe('calculateUserLevel Function', () => {
    test('calculates level based on total points', () => {
      expect(calculateUserLevel(0)).toBe(1);
      expect(calculateUserLevel(100)).toBe(1);
      expect(calculateUserLevel(500)).toBe(2);
      expect(calculateUserLevel(1200)).toBe(3);
      expect(calculateUserLevel(2500)).toBe(4);
      expect(calculateUserLevel(5000)).toBe(5);
    });

    test('returns level progression info', () => {
      const levelInfo = calculateUserLevel(750);
      
      expect(levelInfo).toHaveProperty('level', 2);
      expect(levelInfo).toHaveProperty('currentLevelPoints');
      expect(levelInfo).toHaveProperty('nextLevelPoints');
      expect(levelInfo).toHaveProperty('progressToNext');
    });

    test('handles maximum level correctly', () => {
      const levelInfo = calculateUserLevel(50000);
      
      expect(levelInfo.level).toBeGreaterThanOrEqual(10);
      expect(levelInfo.progressToNext).toBeLessThanOrEqual(100);
    });
  });

  describe('getStreakAchievements Function', () => {
    test('returns streak-based achievements', () => {
      const streakAchievements = getStreakAchievements();
      
      expect(streakAchievements).toContain(
        expect.objectContaining({
          id: 'WEEK_WARRIOR',
          type: ACHIEVEMENT_TYPES.STREAK,
        })
      );
    });

    test('sorts achievements by streak requirement', () => {
      const streakAchievements = getStreakAchievements();
      
      for (let i = 0; i < streakAchievements.length - 1; i++) {
        expect(streakAchievements[i].requirement)
          .toBeLessThanOrEqual(streakAchievements[i + 1].requirement);
      }
    });
  });

  describe('Achievement Point Values', () => {
    test('higher tier achievements give more points', () => {
      const bronzeAchievement = Object.values(ACHIEVEMENTS)
        .find(a => a.tier === ACHIEVEMENT_TIERS.BRONZE);
      const goldAchievement = Object.values(ACHIEVEMENTS)
        .find(a => a.tier === ACHIEVEMENT_TIERS.GOLD);
      
      expect(goldAchievement.points).toBeGreaterThan(bronzeAchievement.points);
    });

    test('all achievements have point values', () => {
      Object.values(ACHIEVEMENTS).forEach(achievement => {
        expect(achievement.points).toBeGreaterThan(0);
        expect(typeof achievement.points).toBe('number');
      });
    });
  });

  describe('Achievement Dependencies', () => {
    test('prerequisite achievements are checked', () => {
      // Some achievements require others to be unlocked first
      const advancedAchievement = Object.values(ACHIEVEMENTS)
        .find(a => a.prerequisites);
      
      if (advancedAchievement) {
        expect(Array.isArray(advancedAchievement.prerequisites)).toBe(true);
      }
    });

    test('prevents unlocking achievements without prerequisites', async () => {
      const userStats = {
        totalWorkouts: 100,
        unlockedAchievements: [], // No prerequisites unlocked
      };

      const results = await checkAchievements('workout_completed', userStats);
      
      // Advanced achievements should not be unlocked without prerequisites
      const advancedAchievements = results.filter(a => 
        a.tier >= ACHIEVEMENT_TIERS.PLATINUM && a.newlyUnlocked
      );
      
      expect(advancedAchievements.length).toBe(0);
    });
  });

  describe('Achievement Categories', () => {
    test('categorizes achievements correctly', () => {
      const workoutAchievements = Object.values(ACHIEVEMENTS)
        .filter(a => a.type === ACHIEVEMENT_TYPES.WORKOUT);
      const streakAchievements = Object.values(ACHIEVEMENTS)
        .filter(a => a.type === ACHIEVEMENT_TYPES.STREAK);
      
      expect(workoutAchievements.length).toBeGreaterThan(0);
      expect(streakAchievements.length).toBeGreaterThan(0);
    });

    test('each category has balanced distribution', () => {
      const categories = Object.values(ACHIEVEMENT_TYPES);
      
      categories.forEach(category => {
        const categoryAchievements = Object.values(ACHIEVEMENTS)
          .filter(a => a.type === category);
        
        // Each category should have at least 2 achievements
        expect(categoryAchievements.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Performance', () => {
    test('checkAchievements executes quickly', async () => {
      const userStats = {
        totalWorkouts: 50,
        currentStreak: 14,
        totalPoints: 2500,
        unlockedAchievements: ['FIRST_WORKOUT', 'WEEK_WARRIOR'],
      };

      const startTime = Date.now();
      await checkAchievements('workout_completed', userStats);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(100); // Should execute in under 100ms
    });

    test('handles large achievement lists efficiently', () => {
      const largeUserStats = {
        totalWorkouts: 1000,
        unlockedAchievements: Array.from({ length: 50 }, (_, i) => `achievement_${i}`),
      };

      const startTime = Date.now();
      getAchievementProgress('FIRST_WORKOUT', largeUserStats);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(10); // Should be very fast
    });
  });
});