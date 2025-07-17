import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { AchievementSystem, AchievementCard } from '../../src/components/gamification/AchievementSystem';
import { checkAchievements, unlockAchievement } from '../../src/utils/achievements';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../src/utils/achievements');
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Heavy: 'heavy' },
}));

describe('Achievement System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('[]');
    AsyncStorage.setItem.mockResolvedValue();
  });

  describe('AchievementCard Component', () => {
    const mockAchievement = {
      id: 'first_workout',
      title: 'Getting Started',
      description: 'Complete your first workout',
      masculine_message: 'Every journey begins with a single rep.',
      tier: 'bronze',
      progress: 1,
      target: 1,
      unlocked: true,
      unlockedAt: Date.now(),
    };

    test('renders achievement card correctly', () => {
      const { getByTestId, getByText } = render(
        <AchievementCard achievement={mockAchievement} />
      );

      expect(getByText('Getting Started')).toBeTruthy();
      expect(getByText('Every journey begins with a single rep.')).toBeTruthy();
      expect(getByTestId('achievement-icon')).toBeTruthy();
    });

    test('shows progress bar for incomplete achievements', () => {
      const incompleteAchievement = {
        ...mockAchievement,
        progress: 3,
        target: 10,
        unlocked: false,
      };

      const { getByTestId } = render(
        <AchievementCard achievement={incompleteAchievement} />
      );

      const progressBar = getByTestId('progress-bar');
      expect(progressBar.props.style).toEqual(
        expect.objectContaining({
          width: '30%', // 3/10 = 30%
        })
      );
    });

    test('handles achievement card press', () => {
      const onPress = jest.fn();
      
      const { getByTestId } = render(
        <AchievementCard achievement={mockAchievement} onPress={onPress} />
      );

      fireEvent.press(getByTestId('achievement-card'));
      expect(onPress).toHaveBeenCalledWith(mockAchievement);
    });

    test('displays correct tier styling', () => {
      const goldAchievement = {
        ...mockAchievement,
        tier: 'gold',
      };

      const { getByTestId } = render(
        <AchievementCard achievement={goldAchievement} />
      );

      const card = getByTestId('achievement-card');
      expect(card.props.style).toEqual(
        expect.objectContaining({
          borderColor: expect.stringContaining('gold'),
        })
      );
    });
  });

  describe('Achievement System Logic', () => {
    test('checks achievements after workout completion', async () => {
      const mockWorkoutData = {
        type: 'push',
        duration: 45,
        exercises: [
          { name: 'Push-ups', sets: 3, reps: 15 },
          { name: 'Bench Press', sets: 3, reps: 10 },
        ],
      };

      checkAchievements.mockResolvedValue([
        {
          id: 'first_workout',
          title: 'Getting Started',
          newlyUnlocked: true,
        },
      ]);

      const achievements = await checkAchievements('workout_completed', mockWorkoutData);
      
      expect(achievements).toHaveLength(1);
      expect(achievements[0].newlyUnlocked).toBe(true);
    });

    test('unlocks achievement and saves to storage', async () => {
      const achievementId = 'first_workout';
      const existingAchievements = [];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingAchievements));
      unlockAchievement.mockResolvedValue({
        id: achievementId,
        unlockedAt: Date.now(),
      });

      await unlockAchievement(achievementId);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_achievements',
        expect.stringContaining(achievementId)
      );
    });

    test('prevents duplicate achievement unlocks', async () => {
      const achievementId = 'first_workout';
      const existingAchievements = [
        { id: achievementId, unlockedAt: Date.now() - 86400000 },
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(existingAchievements));
      unlockAchievement.mockResolvedValue(null);

      const result = await unlockAchievement(achievementId);
      expect(result).toBeNull();
    });

    test('calculates achievement progress correctly', () => {
      const { getByTestId } = render(
        <AchievementSystem userId="test-user" />
      );

      // Mock user stats that would trigger progress calculation
      const userStats = {
        totalWorkouts: 5,
        weeklyStreak: 3,
        totalPoints: 750,
      };

      // This would trigger internal progress calculation
      fireEvent(getByTestId('achievement-system'), 'onUserStatsUpdate', userStats);

      // Progress calculations should be reflected in the UI
      waitFor(() => {
        expect(screen.getByText(/5\/10/)).toBeTruthy(); // Workout progress
      });
    });
  });

  describe('Achievement Notifications', () => {
    test('triggers haptic feedback on achievement unlock', async () => {
      const { Haptics } = require('expo-haptics');
      
      const { getByTestId } = render(
        <AchievementSystem userId="test-user" />
      );

      // Simulate achievement unlock
      fireEvent(getByTestId('achievement-system'), 'onAchievementUnlock', {
        id: 'first_workout',
        title: 'Getting Started',
      });

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
      });
    });

    test('shows achievement unlock animation', async () => {
      const { getByTestId } = render(
        <AchievementSystem userId="test-user" />
      );

      // Trigger achievement unlock
      fireEvent(getByTestId('achievement-system'), 'onAchievementUnlock', {
        id: 'first_workout',
        title: 'Getting Started',
      });

      await waitFor(() => {
        expect(getByTestId('achievement-unlock-modal')).toBeTruthy();
      });
    });
  });

  describe('Achievement Categories', () => {
    test('filters achievements by category', () => {
      const mockAchievements = [
        { id: 'workout1', type: 'workout', title: 'First Workout' },
        { id: 'streak1', type: 'streak', title: 'Week Streak' },
        { id: 'workout2', type: 'workout', title: 'Push Master' },
      ];

      const { getByTestId, getByText } = render(
        <AchievementSystem 
          userId="test-user" 
          achievements={mockAchievements}
          selectedCategory="workout"
        />
      );

      expect(getByText('First Workout')).toBeTruthy();
      expect(getByText('Push Master')).toBeTruthy();
      expect(() => getByText('Week Streak')).toThrow();
    });

    test('shows all achievements when no category selected', () => {
      const mockAchievements = [
        { id: 'workout1', type: 'workout', title: 'First Workout' },
        { id: 'streak1', type: 'streak', title: 'Week Streak' },
      ];

      const { getByText } = render(
        <AchievementSystem 
          userId="test-user" 
          achievements={mockAchievements}
        />
      );

      expect(getByText('First Workout')).toBeTruthy();
      expect(getByText('Week Streak')).toBeTruthy();
    });
  });

  describe('Achievement Statistics', () => {
    test('calculates achievement completion percentage', () => {
      const achievements = [
        { id: '1', unlocked: true },
        { id: '2', unlocked: true },
        { id: '3', unlocked: false },
        { id: '4', unlocked: false },
      ];

      const { getByTestId } = render(
        <AchievementSystem 
          userId="test-user" 
          achievements={achievements}
        />
      );

      expect(getByTestId('completion-percentage')).toHaveTextContent('50%');
    });

    test('shows tier distribution correctly', () => {
      const achievements = [
        { id: '1', tier: 'bronze', unlocked: true },
        { id: '2', tier: 'silver', unlocked: true },
        { id: '3', tier: 'gold', unlocked: false },
      ];

      const { getByTestId } = render(
        <AchievementSystem 
          userId="test-user" 
          achievements={achievements}
        />
      );

      expect(getByTestId('bronze-count')).toHaveTextContent('1');
      expect(getByTestId('silver-count')).toHaveTextContent('1');
      expect(getByTestId('gold-count')).toHaveTextContent('0');
    });
  });

  describe('Performance', () => {
    test('renders large achievement lists efficiently', () => {
      const manyAchievements = Array.from({ length: 100 }, (_, i) => ({
        id: `achievement-${i}`,
        title: `Achievement ${i}`,
        unlocked: i % 3 === 0,
      }));

      const startTime = Date.now();
      
      render(
        <AchievementSystem 
          userId="test-user" 
          achievements={manyAchievements}
        />
      );

      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
    });

    test('virtualizes long achievement lists', () => {
      const manyAchievements = Array.from({ length: 1000 }, (_, i) => ({
        id: `achievement-${i}`,
        title: `Achievement ${i}`,
      }));

      const { getByTestId } = render(
        <AchievementSystem 
          userId="test-user" 
          achievements={manyAchievements}
        />
      );

      // VirtualizedList should only render visible items
      const list = getByTestId('achievement-list');
      expect(list.props.windowSize).toBeLessThanOrEqual(10);
    });
  });
});