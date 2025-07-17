import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { buttonPressHaptic } from '../../utils/haptics';
import Card from '../common/Card';

/**
 * Streak display component with fire animations and motivational messaging
 * Research shows streaks are powerful motivators for male psychology
 */
const StreakDisplay = ({
  streakCount = 0,
  activityType = 'workout',
  longestStreak = 0,
  onPress,
  style,
  size = 'medium',
}) => {
  const flameAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate streak count
    Animated.timing(countAnim, {
      toValue: streakCount,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Flame animation for active streaks
    if (streakCount > 0) {
      const flameAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(flameAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(flameAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      flameAnimation.start();

      // Pulse animation for motivation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => {
        flameAnimation.stop();
        pulseAnimation.stop();
      };
    }
  }, [streakCount]);

  const getStreakMessage = () => {
    if (streakCount === 0) {
      return {
        message: "Start your streak today!",
        motivation: "Every champion was once a beginner.",
        color: '#6b7280',
      };
    } else if (streakCount < 3) {
      return {
        message: "Building momentum!",
        motivation: "Consistency is the key to greatness.",
        color: '#f59e0b',
      };
    } else if (streakCount < 7) {
      return {
        message: "You're on fire!",
        motivation: "Momentum is building. Keep pushing.",
        color: '#ef4444',
      };
    } else if (streakCount < 30) {
      return {
        message: "Unstoppable force!",
        motivation: "You're proving what discipline can achieve.",
        color: '#8b5cf6',
      };
    } else {
      return {
        message: "LEGENDARY STREAK!",
        motivation: "You've mastered the art of consistency.",
        color: '#10b981',
      };
    }
  };

  const getActivityConfig = () => {
    switch (activityType) {
      case 'workout':
        return {
          icon: 'fitness',
          label: 'Workout Streak',
          unit: 'workouts',
        };
      case 'nutrition':
        return {
          icon: 'restaurant',
          label: 'Nutrition Streak',
          unit: 'days',
        };
      case 'wellness':
        return {
          icon: 'heart',
          label: 'Wellness Streak',
          unit: 'check-ins',
        };
      default:
        return {
          icon: 'flame',
          label: 'Activity Streak',
          unit: 'days',
        };
    }
  };

  const streakInfo = getStreakMessage();
  const activityConfig = getActivityConfig();

  const handlePress = () => {
    if (onPress) {
      buttonPressHaptic();
      onPress();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          streakNumber: styles.smallStreakNumber,
          flameSize: 24,
          padding: 12,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          streakNumber: styles.largeStreakNumber,
          flameSize: 48,
          padding: 24,
        };
      default:
        return {
          container: styles.mediumContainer,
          streakNumber: styles.mediumStreakNumber,
          flameSize: 32,
          padding: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <Card style={[styles.card, sizeStyles.container, style]}>
        {/* Background Gradient */}
        <LinearGradient
          colors={[
            `${streakInfo.color}10`,
            `${streakInfo.color}05`,
            'transparent'
          ]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Ionicons 
              name={activityConfig.icon} 
              size={20} 
              color={streakInfo.color} 
            />
            <Text style={styles.label}>{activityConfig.label}</Text>
          </View>
          
          {size !== 'small' && longestStreak > 0 && (
            <View style={styles.recordSection}>
              <Text style={styles.recordLabel}>Record:</Text>
              <Text style={styles.recordValue}>{longestStreak}</Text>
            </View>
          )}
        </View>

        <Animated.View 
          style={[
            styles.streakContent,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          {/* Flame Icon with Animation */}
          <View style={styles.flameContainer}>
            <Animated.View
              style={[
                styles.flameBackground,
                {
                  opacity: flameAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                  transform: [
                    {
                      scale: flameAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1.1],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Ionicons
              name="flame"
              size={sizeStyles.flameSize}
              color={streakCount > 0 ? streakInfo.color : '#6b7280'}
            />
          </View>

          {/* Streak Count */}
          <Animated.Text
            style={[
              sizeStyles.streakNumber,
              { color: streakInfo.color }
            ]}
          >
            {streakCount}
          </Animated.Text>

          <Text style={styles.daysLabel}>
            {streakCount === 1 ? 
              activityConfig.unit.slice(0, -1) : 
              activityConfig.unit
            }
          </Text>
        </Animated.View>

        {/* Motivational Message */}
        {size !== 'small' && (
          <View style={styles.messageSection}>
            <Text style={[styles.streakMessage, { color: streakInfo.color }]}>
              {streakInfo.message}
            </Text>
            <Text style={styles.motivation}>
              {streakInfo.motivation}
            </Text>
          </View>
        )}

        {/* Progress Indicators */}
        {size === 'large' && (
          <View style={styles.milestones}>
            <Text style={styles.milestonesTitle}>Next Milestones</Text>
            <View style={styles.milestonesList}>
              {[3, 7, 30, 100].map((milestone) => (
                <View
                  key={milestone}
                  style={[
                    styles.milestoneItem,
                    streakCount >= milestone && styles.completedMilestone,
                  ]}
                >
                  <Text
                    style={[
                      styles.milestoneText,
                      streakCount >= milestone && styles.completedMilestoneText,
                    ]}
                  >
                    {milestone}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Call to Action */}
        {streakCount === 0 && size !== 'small' && (
          <View style={styles.ctaSection}>
            <Text style={styles.ctaText}>
              Ready to start your streak?
            </Text>
            <View style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Let's Go!</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </View>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  smallContainer: {
    padding: 12,
  },
  mediumContainer: {
    padding: 16,
  },
  largeContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  recordSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 4,
  },
  recordValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  streakContent: {
    alignItems: 'center',
    marginVertical: 8,
  },
  flameContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  flameBackground: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 50,
  },
  smallStreakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mediumStreakNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  largeStreakNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  daysLabel: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
    textAlign: 'center',
  },
  messageSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  streakMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  motivation: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  milestones: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  milestonesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  milestonesList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  milestoneItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedMilestone: {
    backgroundColor: '#10b981',
  },
  milestoneText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9ca3af',
  },
  completedMilestoneText: {
    color: '#ffffff',
  },
  ctaSection: {
    marginTop: 16,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
});

export default StreakDisplay;