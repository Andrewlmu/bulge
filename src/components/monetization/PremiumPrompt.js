import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { buttonPressHaptic, successHaptic } from '../../utils/haptics';
import AnimatedButton from '../common/AnimatedButton';
import { ScaleTransition } from '../transitions/SlideTransition';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Premium upgrade prompt component with strategic timing and persuasive messaging
 * Based on behavioral economics research for male health app users
 */
const PremiumPrompt = ({
  visible = false,
  onClose,
  onUpgrade,
  trigger = 'feature_limit',
  userStats = {},
  style,
}) => {
  const [showModal, setShowModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      
      // Entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      // Pulse animation for CTA
      const pulse = Animated.loop(
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
      pulse.start();

      return () => pulse.stop();
    } else {
      // Exit animation
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setShowModal(false));
    }
  }, [visible]);

  const getPromptContent = () => {
    switch (trigger) {
      case 'workout_limit':
        return {
          title: 'Unlock Your Full Potential',
          subtitle: 'Ready to take your workouts to the next level?',
          description: 'You\'ve crushed the basics. Time to access premium workout programs designed by elite trainers.',
          benefits: [
            'Unlimited workout programs',
            'Advanced strength protocols', 
            'Personalized training plans',
            'Video coaching sessions',
          ],
          cta: 'Upgrade to Beast Mode',
          urgency: 'Join 50,000+ men building strength',
          socialProof: '⭐️ 4.9/5 stars from premium members',
        };
        
      case 'nutrition_limit':
        return {
          title: 'Fuel Your Success',
          subtitle: 'Ready to optimize your nutrition like a pro?',
          description: 'You\'re tracking your meals. Now unlock the nutrition secrets that build champions.',
          benefits: [
            'Unlimited meal tracking',
            'Custom macro calculations',
            'Premium recipe database',
            'Supplement recommendations',
          ],
          cta: 'Upgrade Your Nutrition',
          urgency: 'Transform your physique in 30 days',
          socialProof: '💪 Average 15lbs gained by premium users',
        };
        
      case 'analytics_limit':
        return {
          title: 'Master Your Metrics',
          subtitle: 'Data-driven men achieve 3x better results',
          description: 'You\'re making progress. Unlock advanced analytics to accelerate your transformation.',
          benefits: [
            'Advanced progress analytics',
            'Body composition tracking',
            'Performance predictions',
            'Export your data',
          ],
          cta: 'Unlock Analytics',
          urgency: 'Limited time: 50% off first month',
          socialProof: '📊 Premium users see 40% faster progress',
        };
        
      case 'streak_bonus':
        return {
          title: 'Streak Master!',
          subtitle: `${userStats.streak || 7} days of consistency deserves premium features`,
          description: 'Your dedication is impressive. Unlock premium tools to maintain your momentum.',
          benefits: [
            'Advanced streak tracking',
            'Habit optimization tools',
            'Exclusive challenge access',
            'Priority coach support',
          ],
          cta: 'Reward Your Consistency',
          urgency: 'Exclusive offer for streak masters',
          socialProof: '🔥 Premium users maintain 2x longer streaks',
        };
        
      case 'achievement_milestone':
        return {
          title: 'Achievement Unlocked!',
          subtitle: 'You\'re in the top 10% of users',
          description: 'Your progress is exceptional. Join the elite with premium features.',
          benefits: [
            'Exclusive achievement tiers',
            'Advanced goal setting',
            'Elite community access',
            'One-on-one coaching',
          ],
          cta: 'Join the Elite',
          urgency: 'Limited spots available',
          socialProof: '👑 Premium users achieve goals 60% faster',
        };
        
      default:
        return {
          title: 'Unlock Your Potential',
          subtitle: 'Ready to accelerate your transformation?',
          description: 'Join thousands of men who upgraded their health journey with premium features.',
          benefits: [
            'Unlimited access to all features',
            'Priority customer support',
            'Advanced analytics & insights',
            'Exclusive content & challenges',
          ],
          cta: 'Upgrade Now',
          urgency: 'Limited time offer',
          socialProof: '⭐️ Join 50,000+ premium members',
        };
    }
  };

  const handleClose = () => {
    buttonPressHaptic();
    onClose?.();
  };

  const handleUpgrade = (plan) => {
    successHaptic();
    onUpgrade?.(plan);
  };

  const content = getPromptContent();

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
        
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
            style,
          ]}
        >
          {/* Premium Badge */}
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={StyleSheet.absoluteFillObject}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons name="crown" size={24} color="#ffffff" />
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#9ca3af" />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.subtitle}>{content.subtitle}</Text>
            <Text style={styles.description}>{content.description}</Text>

            {/* Benefits List */}
            <View style={styles.benefits}>
              {content.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Social Proof */}
            <View style={styles.socialProof}>
              <Text style={styles.socialProofText}>{content.socialProof}</Text>
            </View>

            {/* Pricing Options */}
            <View style={styles.pricing}>
              {/* Monthly Plan */}
              <TouchableOpacity
                style={styles.planCard}
                onPress={() => handleUpgrade('monthly')}
              >
                <Text style={styles.planLabel}>Monthly</Text>
                <Text style={styles.planPrice}>$9.99</Text>
                <Text style={styles.planSubtext}>per month</Text>
              </TouchableOpacity>

              {/* Annual Plan (Recommended) */}
              <View style={styles.recommendedPlan}>
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>SAVE 50%</Text>
                </View>
                <TouchableOpacity
                  style={[styles.planCard, styles.recommendedCard]}
                  onPress={() => handleUpgrade('annual')}
                >
                  <Text style={styles.planLabel}>Annual</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.originalPrice}>$119.88</Text>
                    <Text style={styles.planPrice}>$59.99</Text>
                  </View>
                  <Text style={styles.planSubtext}>$5/month • Save $60</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Main CTA Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <AnimatedButton
                title={content.cta}
                onPress={() => handleUpgrade('annual')}
                variant="primary"
                size="large"
                style={styles.ctaButton}
                icon={<Ionicons name="arrow-forward" size={20} color="#ffffff" />}
              />
            </Animated.View>

            {/* Urgency Message */}
            <Text style={styles.urgency}>{content.urgency}</Text>

            {/* Trust Indicators */}
            <View style={styles.trustIndicators}>
              <View style={styles.trustItem}>
                <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                <Text style={styles.trustText}>Cancel anytime</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="card" size={16} color="#10b981" />
                <Text style={styles.trustText}>Secure payment</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="refresh" size={16} color="#10b981" />
                <Text style={styles.trustText}>7-day free trial</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#1f2937',
    borderRadius: 20,
    padding: 24,
    maxWidth: screenWidth - 40,
    maxHeight: screenHeight - 100,
    width: '100%',
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  benefits: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 12,
  },
  socialProof: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  socialProofText: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '600',
  },
  pricing: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommendedPlan: {
    flex: 1,
    position: 'relative',
  },
  recommendedCard: {
    backgroundColor: '#2563eb',
    borderColor: '#FFD700',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -30,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  planLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  priceContainer: {
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  planSubtext: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  ctaButton: {
    marginBottom: 16,
  },
  urgency: {
    fontSize: 12,
    color: '#f59e0b',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: 10,
    color: '#9ca3af',
    marginLeft: 4,
  },
});

export default PremiumPrompt;