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
import { ACHIEVEMENT_TIERS } from '../../utils/achievements';
import { successHaptic } from '../../utils/haptics';
import AnimatedCard from '../common/AnimatedCard';

/**
 * Achievement card component with tier-based styling and animations
 * @param {Object} props - Component props
 * @param {Object} props.achievement - Achievement object
 * @param {boolean} props.unlocked - Whether achievement is unlocked
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {Function} props.onPress - Press handler
 * @param {boolean} props.showProgress - Whether to show progress bar
 * @param {string} props.size - Card size (small, medium, large)
 */
const AchievementCard = ({
  achievement,
  unlocked = false,
  progress = 0,
  onPress,
  showProgress = true,
  size = 'medium',
  ...props
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Shimmer effect for unlocked achievements
    if (unlocked) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
    }
  }, [progress, unlocked]);

  const getTierColors = (tier) => {
    switch (tier) {
      case ACHIEVEMENT_TIERS.BRONZE:
        return {
          gradient: ['#CD7F32', '#E6A85C'],
          accent: '#CD7F32',
          glow: '#CD7F3250',
        };
      case ACHIEVEMENT_TIERS.SILVER:
        return {
          gradient: ['#C0C0C0', '#E8E8E8'],
          accent: '#C0C0C0',
          glow: '#C0C0C050',
        };
      case ACHIEVEMENT_TIERS.GOLD:
        return {
          gradient: ['#FFD700', '#FFA500'],
          accent: '#FFD700',
          glow: '#FFD70050',
        };
      case ACHIEVEMENT_TIERS.PLATINUM:
        return {
          gradient: ['#E5E4E2', '#B0C4DE'],
          accent: '#E5E4E2',
          glow: '#E5E4E250',
        };
      case ACHIEVEMENT_TIERS.LEGENDARY:
        return {
          gradient: ['#9932CC', '#4B0082'],
          accent: '#9932CC',
          glow: '#9932CC50',
        };
      default:
        return {
          gradient: ['#6b7280', '#9ca3af'],
          accent: '#6b7280',
          glow: '#6b728050',
        };
    }
  };

  const tierColors = getTierColors(achievement.tier);
  const isLocked = !unlocked && progress < 100;

  const handlePress = () => {
    if (onPress) {
      successHaptic();
      onPress(achievement);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          icon: 32,
          title: styles.smallTitle,
          description: styles.smallDescription,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          icon: 64,
          title: styles.largeTitle,
          description: styles.largeDescription,
        };
      default:
        return {
          container: styles.mediumContainer,
          icon: 48,
          title: styles.mediumTitle,
          description: styles.mediumDescription,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
      {...props}
    >
      <AnimatedCard
        animation="scaleIn"
        style={[
          styles.card,
          sizeStyles.container,
          unlocked && {
            borderColor: tierColors.accent,
            borderWidth: 2,
            shadowColor: tierColors.glow,
            elevation: 8,
          },
        ]}
      >
        {/* Background Gradient for Unlocked */}
        {unlocked && (
          <LinearGradient
            colors={[`${tierColors.gradient[0]}20`, `${tierColors.gradient[1]}20`]}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {/* Shimmer Effect for Unlocked */}
        {unlocked && (
          <Animated.View
            style={[
              styles.shimmer,
              {
                opacity: shimmerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
                transform: [
                  {
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 100],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        <View style={styles.content}>
          {/* Achievement Icon */}
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: unlocked ? tierColors.accent : '#374151',
              shadowColor: unlocked ? tierColors.glow : '#00000050',
            },
            isLocked && styles.lockedIcon,
          ]}>
            <Ionicons
              name={isLocked ? 'lock-closed' : achievement.icon}
              size={sizeStyles.icon}
              color={unlocked ? '#ffffff' : '#9ca3af'}
            />
            
            {/* Tier Badge */}
            {unlocked && (
              <View style={[styles.tierBadge, { backgroundColor: tierColors.accent }]}>
                <Text style={styles.tierText}>
                  {achievement.tier.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Achievement Info */}
          <View style={styles.info}>
            <Text style={[
              sizeStyles.title,
              { color: unlocked ? '#ffffff' : '#9ca3af' },
            ]}>
              {achievement.title}
            </Text>
            
            <Text style={[
              sizeStyles.description,
              { color: unlocked ? '#d1d5db' : '#6b7280' },
            ]}>
              {achievement.description}
            </Text>

            {/* Points */}
            {size !== 'small' && (
              <View style={styles.pointsContainer}>
                <Ionicons name="star" size={16} color={tierColors.accent} />
                <Text style={[styles.points, { color: tierColors.accent }]}>
                  {achievement.points} pts
                </Text>
              </View>
            )}

            {/* Masculine Message for Unlocked */}
            {unlocked && achievement.masculine_message && size === 'large' && (
              <Text style={styles.masculineMessage}>
                "{achievement.masculine_message}"
              </Text>
            )}
          </View>
        </View>

        {/* Progress Bar */}
        {showProgress && !unlocked && progress > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Progress</Text>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: tierColors.accent,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Unlock Notification */}
        {unlocked && (
          <View style={styles.unlockedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.unlockedText}>UNLOCKED</Text>
          </View>
        )}
      </AnimatedCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  smallContainer: {
    padding: 12,
    marginVertical: 4,
  },
  mediumContainer: {
    padding: 16,
    marginVertical: 8,
  },
  largeContainer: {
    padding: 20,
    marginVertical: 12,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '20deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    borderRadius: 50,
    padding: 12,
    marginRight: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  lockedIcon: {
    opacity: 0.5,
  },
  tierBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tierText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  info: {
    flex: 1,
  },
  smallTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  mediumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  largeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  smallDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  mediumDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  largeDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  masculineMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#9ca3af',
    marginTop: 8,
    lineHeight: 20,
  },
  progressSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98120',
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unlockedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#10b981',
    marginLeft: 4,
  },
});

export default AchievementCard;