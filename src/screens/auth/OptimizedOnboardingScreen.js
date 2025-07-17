import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';

import AnimatedButton from '../../components/common/AnimatedButton';
import FormInput from '../../components/forms/FormInput';
import { SlideTransition, FadeTransition } from '../../components/transitions/SlideTransition';
import { buttonPressHaptic, successHaptic, goalAchievedHaptic } from '../../utils/haptics';
import { useApp } from '../../context/AppContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Optimized onboarding flow based on male psychology and retention research
 * Features: Progressive disclosure, immediate value, social proof, commitment devices
 */

const ONBOARDING_STEPS = [
  'welcome',
  'goals',
  'experience',
  'physicalStats',
  'lifestyle',
  'commitment',
  'notifications',
  'complete',
];

const GOAL_OPTIONS = [
  {
    id: 'build_muscle',
    title: 'Build Muscle',
    subtitle: 'Gain strength and size',
    icon: 'fitness',
    color: '#ef4444',
    popular: true,
  },
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    subtitle: 'Burn fat and get lean',
    icon: 'trending-down',
    color: '#10b981',
    popular: true,
  },
  {
    id: 'improve_health',
    title: 'Improve Health',
    subtitle: 'Feel better overall',
    icon: 'heart',
    color: '#8b5cf6',
    popular: false,
  },
  {
    id: 'increase_energy',
    title: 'Increase Energy',
    subtitle: 'More vitality daily',
    icon: 'flash',
    color: '#f59e0b',
    popular: false,
  },
  {
    id: 'reduce_stress',
    title: 'Reduce Stress',
    subtitle: 'Better mental health',
    icon: 'leaf',
    color: '#06b6d4',
    popular: false,
  },
  {
    id: 'optimize_performance',
    title: 'Peak Performance',
    subtitle: 'Athletic excellence',
    icon: 'trophy',
    color: '#ec4899',
    popular: false,
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    title: 'New to Fitness',
    subtitle: 'Ready to start my journey',
    icon: 'school',
    description: 'Perfect! We\'ll guide you step by step.',
  },
  {
    id: 'intermediate',
    title: 'Some Experience',
    subtitle: 'I know the basics',
    icon: 'barbell',
    description: 'Great foundation! Let\'s build on it.',
  },
  {
    id: 'advanced',
    title: 'Experienced',
    subtitle: 'I train regularly',
    icon: 'medal',
    description: 'Impressive! We\'ll help you optimize.',
  },
];

const COMMITMENT_LEVELS = [
  {
    id: 'casual',
    title: '2-3 times per week',
    subtitle: 'Steady progress',
    commitment: 'low',
  },
  {
    id: 'regular',
    title: '4-5 times per week',
    subtitle: 'Serious results',
    commitment: 'medium',
    recommended: true,
  },
  {
    id: 'intense',
    title: '6+ times per week',
    subtitle: 'Maximum results',
    commitment: 'high',
  },
];

const physicalStatsSchema = yup.object({
  age: yup.number().min(16, 'Must be at least 16').max(100, 'Must be under 100').required('Age is required'),
  height: yup.number().min(120, 'Height seems too low').max(250, 'Height seems too high').required('Height is required'),
  weight: yup.number().min(30, 'Weight seems too low').max(500, 'Weight seems too high').required('Weight is required'),
  targetWeight: yup.number().min(30, 'Target weight seems too low').max(500, 'Target weight seems too high'),
});

const OptimizedOnboardingScreen = ({ navigation }) => {
  const { setUser } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(physicalStatsSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / ONBOARDING_STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleNext = (data = {}) => {
    buttonPressHaptic();
    setOnboardingData(prev => ({ ...prev, ...data }));
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    buttonPressHaptic();
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      goalAchievedHaptic();
      
      // Save onboarding data
      await AsyncStorage.setItem('onboarding_complete', 'true');
      await AsyncStorage.setItem('user_profile', JSON.stringify(onboardingData));
      
      // Update app context
      setUser({
        name: onboardingData.name || 'Champion',
        goals: onboardingData.goals || [],
        experience: onboardingData.experience || 'beginner',
        ...onboardingData,
      });

      // Navigate to main app
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderWelcomeStep = () => (
    <FadeTransition visible={isVisible}>
      <View style={styles.stepContainer}>
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeEmoji}>💪</Text>
          <Text style={styles.welcomeTitle}>Welcome to Bulge</Text>
          <Text style={styles.welcomeSubtitle}>
            Join 50,000+ men transforming their lives
          </Text>
        </View>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.benefitText}>Personalized workout plans</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.benefitText}>Nutrition tracking & guidance</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.benefitText}>Mental wellness support</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
            <Text style={styles.benefitText}>Community of champions</Text>
          </View>
        </View>

        <View style={styles.socialProof}>
          <Text style={styles.socialProofText}>⭐️ 4.9/5 stars from 10,000+ reviews</Text>
          <Text style={styles.socialProofSubtext}>"Finally, an app that gets men's health right"</Text>
        </View>

        <AnimatedButton
          title="Let's Build Something Great"
          onPress={() => handleNext()}
          style={styles.actionButton}
          icon={<Ionicons name="arrow-forward" size={20} color="#ffffff" />}
        />
      </View>
    </FadeTransition>
  );

  const renderGoalsStep = () => (
    <SlideTransition visible={isVisible} direction="left">
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>What's Your Main Goal?</Text>
        <Text style={styles.stepSubtitle}>
          Choose your primary focus. You can add more goals later.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.optionsGrid}>
            {GOAL_OPTIONS.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  onboardingData.primaryGoal === goal.id && styles.selectedGoalCard,
                ]}
                onPress={() => {
                  buttonPressHaptic();
                  setOnboardingData(prev => ({ ...prev, primaryGoal: goal.id }));
                }}
              >
                {goal.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}
                
                <View style={[styles.goalIcon, { backgroundColor: goal.color }]}>
                  <Ionicons name={goal.icon} size={28} color="#ffffff" />
                </View>
                
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalSubtitle}>{goal.subtitle}</Text>
                
                {onboardingData.primaryGoal === goal.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <AnimatedButton
          title="Continue"
          onPress={() => handleNext()}
          disabled={!onboardingData.primaryGoal}
          style={styles.actionButton}
        />
      </View>
    </SlideTransition>
  );

  const renderExperienceStep = () => (
    <SlideTransition visible={isVisible} direction="left">
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>What's Your Experience Level?</Text>
        <Text style={styles.stepSubtitle}>
          This helps us customize your program perfectly.
        </Text>

        <View style={styles.experienceOptions}>
          {EXPERIENCE_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.experienceCard,
                onboardingData.experience === level.id && styles.selectedCard,
              ]}
              onPress={() => {
                buttonPressHaptic();
                setOnboardingData(prev => ({ ...prev, experience: level.id }));
              }}
            >
              <Ionicons 
                name={level.icon} 
                size={32} 
                color={onboardingData.experience === level.id ? '#2563eb' : '#9ca3af'} 
              />
              <Text style={[
                styles.experienceTitle,
                onboardingData.experience === level.id && styles.selectedText,
              ]}>
                {level.title}
              </Text>
              <Text style={styles.experienceSubtitle}>{level.subtitle}</Text>
              <Text style={styles.experienceDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <AnimatedButton
          title="Continue"
          onPress={() => handleNext()}
          disabled={!onboardingData.experience}
          style={styles.actionButton}
        />
      </View>
    </SlideTransition>
  );

  const renderPhysicalStatsStep = () => (
    <SlideTransition visible={isVisible} direction="left">
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Tell Us About Yourself</Text>
        <Text style={styles.stepSubtitle}>
          This helps us calculate your personalized plan.
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Age"
                  placeholder="e.g., 30"
                  value={value?.toString()}
                  onChangeText={(text) => onChange(parseInt(text) || '')}
                  onBlur={onBlur}
                  error={errors.age?.message}
                  keyboardType="numeric"
                  leftIcon="calendar-outline"
                  variant="outlined"
                  required
                />
              )}
            />

            <View style={styles.formRow}>
              <Controller
                control={control}
                name="height"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Height (cm)"
                    placeholder="180"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || '')}
                    onBlur={onBlur}
                    error={errors.height?.message}
                    keyboardType="numeric"
                    leftIcon="resize-outline"
                    variant="outlined"
                    style={styles.halfInput}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="weight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Weight (kg)"
                    placeholder="80"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || '')}
                    onBlur={onBlur}
                    error={errors.weight?.message}
                    keyboardType="numeric"
                    leftIcon="scale-outline"
                    variant="outlined"
                    style={styles.halfInput}
                    required
                  />
                )}
              />
            </View>

            {onboardingData.primaryGoal === 'lose_weight' || onboardingData.primaryGoal === 'build_muscle' ? (
              <Controller
                control={control}
                name="targetWeight"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormInput
                    label="Target Weight (kg)"
                    placeholder="75"
                    value={value?.toString()}
                    onChangeText={(text) => onChange(parseInt(text) || '')}
                    onBlur={onBlur}
                    error={errors.targetWeight?.message}
                    keyboardType="numeric"
                    leftIcon="flag-outline"
                    variant="outlined"
                  />
                )}
              />
            ) : null}
          </View>
        </ScrollView>

        <AnimatedButton
          title="Continue"
          onPress={handleSubmit((data) => handleNext(data))}
          disabled={!isValid}
          style={styles.actionButton}
        />
      </View>
    </SlideTransition>
  );

  const renderCommitmentStep = () => (
    <SlideTransition visible={isVisible} direction="left">
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>How Often Can You Commit?</Text>
        <Text style={styles.stepSubtitle}>
          Consistency beats perfection. Choose what you can stick to.
        </Text>

        <View style={styles.commitmentOptions}>
          {COMMITMENT_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.commitmentCard,
                onboardingData.commitment === level.id && styles.selectedCard,
                level.recommended && styles.recommendedCard,
              ]}
              onPress={() => {
                buttonPressHaptic();
                setOnboardingData(prev => ({ ...prev, commitment: level.id }));
              }}
            >
              {level.recommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
              )}
              
              <Text style={[
                styles.commitmentTitle,
                onboardingData.commitment === level.id && styles.selectedText,
              ]}>
                {level.title}
              </Text>
              <Text style={styles.commitmentSubtitle}>{level.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.commitmentNote}>
          <Ionicons name="information-circle" size={20} color="#9ca3af" />
          <Text style={styles.commitmentNoteText}>
            You can adjust this anytime in settings. Start conservative and build up.
          </Text>
        </View>

        <AnimatedButton
          title="Set My Commitment"
          onPress={() => handleNext()}
          disabled={!onboardingData.commitment}
          style={styles.actionButton}
        />
      </View>
    </SlideTransition>
  );

  const renderCompleteStep = () => (
    <FadeTransition visible={isVisible}>
      <View style={styles.stepContainer}>
        <View style={styles.completeHeader}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>You're All Set!</Text>
          <Text style={styles.completeSubtitle}>
            Your personalized health journey starts now.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Your Plan</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Primary Goal:</Text>
            <Text style={styles.summaryValue}>
              {GOAL_OPTIONS.find(g => g.id === onboardingData.primaryGoal)?.title}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Experience:</Text>
            <Text style={styles.summaryValue}>
              {EXPERIENCE_LEVELS.find(e => e.id === onboardingData.experience)?.title}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Commitment:</Text>
            <Text style={styles.summaryValue}>
              {COMMITMENT_LEVELS.find(c => c.id === onboardingData.commitment)?.title}
            </Text>
          </View>
        </View>

        <View style={styles.readyMessage}>
          <Text style={styles.readyText}>
            "The journey of a thousand miles begins with a single step. You just took it."
          </Text>
          <Text style={styles.readyAuthor}>- Ancient Wisdom, Modern Application</Text>
        </View>

        <AnimatedButton
          title="Start My Journey"
          onPress={() => handleNext()}
          style={styles.actionButton}
          icon={<Ionicons name="rocket" size={20} color="#ffffff" />}
        />
      </View>
    </FadeTransition>
  );

  const renderCurrentStep = () => {
    switch (ONBOARDING_STEPS[currentStep]) {
      case 'welcome':
        return renderWelcomeStep();
      case 'goals':
        return renderGoalsStep();
      case 'experience':
        return renderExperienceStep();
      case 'physicalStats':
        return renderPhysicalStatsStep();
      case 'commitment':
        return renderCommitmentStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#111827', '#1f2937']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep + 1} of {ONBOARDING_STEPS.length}
        </Text>
      </View>

      {/* Back Button */}
      {currentStep > 0 && (
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
    minHeight: screenHeight - 150,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#9ca3af',
    textAlign: 'center',
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  socialProof: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  socialProofText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 4,
  },
  socialProofSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actionButton: {
    marginTop: 20,
  },
  optionsGrid: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedGoalCard: {
    borderColor: '#2563eb',
    backgroundColor: '#1e40af20',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  goalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  goalSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  selectedIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  experienceOptions: {
    gap: 16,
    marginBottom: 32,
  },
  experienceCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#2563eb',
    backgroundColor: '#1e40af20',
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 4,
  },
  experienceSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  selectedText: {
    color: '#2563eb',
  },
  formContainer: {
    gap: 16,
    marginBottom: 32,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  commitmentOptions: {
    gap: 16,
    marginBottom: 24,
  },
  commitmentCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  recommendedCard: {
    borderColor: '#10b981',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  commitmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  commitmentSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  commitmentNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  commitmentNoteText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  completeHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  completeEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  summaryValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  readyMessage: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  readyText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 8,
  },
  readyAuthor: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default OptimizedOnboardingScreen;