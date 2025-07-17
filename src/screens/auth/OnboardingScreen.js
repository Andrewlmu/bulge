import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInfo, setUserInfo] = useState({
    goals: [],
    activityLevel: '',
    healthFocus: [],
    age: '',
    height: '',
    weight: '',
  });

  const steps = [
    {
      title: 'What are your main goals?',
      subtitle: 'Select all that apply',
      type: 'multiple',
      options: [
        { id: 'weight_loss', label: 'Lose Weight', icon: 'trending-down' },
        { id: 'muscle_gain', label: 'Build Muscle', icon: 'fitness' },
        { id: 'strength', label: 'Get Stronger', icon: 'barbell' },
        { id: 'endurance', label: 'Improve Endurance', icon: 'heart' },
        { id: 'health', label: 'Better Health', icon: 'medical' },
        { id: 'stress', label: 'Reduce Stress', icon: 'leaf' },
      ],
    },
    {
      title: 'How active are you?',
      subtitle: 'This helps us personalize your experience',
      type: 'single',
      options: [
        { id: 'sedentary', label: 'Sedentary', subtitle: 'Little to no exercise' },
        { id: 'light', label: 'Lightly Active', subtitle: '1-3 days per week' },
        { id: 'moderate', label: 'Moderately Active', subtitle: '3-5 days per week' },
        { id: 'very', label: 'Very Active', subtitle: '6-7 days per week' },
        { id: 'extremely', label: 'Extremely Active', subtitle: 'Multiple times per day' },
      ],
    },
    {
      title: 'What areas interest you most?',
      subtitle: 'We\'ll prioritize content for these topics',
      type: 'multiple',
      options: [
        { id: 'fitness', label: 'Fitness & Workouts', icon: 'fitness' },
        { id: 'nutrition', label: 'Nutrition & Diet', icon: 'restaurant' },
        { id: 'mental', label: 'Mental Wellness', icon: 'heart' },
        { id: 'sexual', label: 'Sexual Health', icon: 'pulse' },
        { id: 'sleep', label: 'Sleep Optimization', icon: 'moon' },
        { id: 'stress', label: 'Stress Management', icon: 'leaf' },
      ],
    },
  ];

  const currentStepData = steps[currentStep];

  const handleOptionSelect = (optionId) => {
    const stepKey = currentStep === 0 ? 'goals' : 
                   currentStep === 1 ? 'activityLevel' : 'healthFocus';

    if (currentStepData.type === 'multiple') {
      const currentArray = userInfo[stepKey] || [];
      const isSelected = currentArray.includes(optionId);
      
      setUserInfo({
        ...userInfo,
        [stepKey]: isSelected 
          ? currentArray.filter(id => id !== optionId)
          : [...currentArray, optionId]
      });
    } else {
      setUserInfo({
        ...userInfo,
        [stepKey]: optionId
      });
    }
  };

  const isOptionSelected = (optionId) => {
    const stepKey = currentStep === 0 ? 'goals' : 
                   currentStep === 1 ? 'activityLevel' : 'healthFocus';
    
    if (currentStepData.type === 'multiple') {
      return (userInfo[stepKey] || []).includes(optionId);
    } else {
      return userInfo[stepKey] === optionId;
    }
  };

  const canProceed = () => {
    const stepKey = currentStep === 0 ? 'goals' : 
                   currentStep === 1 ? 'activityLevel' : 'healthFocus';
    
    if (currentStepData.type === 'multiple') {
      return (userInfo[stepKey] || []).length > 0;
    } else {
      return userInfo[stepKey] !== '';
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      navigation.replace('MainTabs');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / steps.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of {steps.length}
          </Text>
        </View>
        
        {currentStep > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepSubtitle}>{currentStepData.subtitle}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {currentStepData.options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                isOptionSelected(option.id) && styles.selectedOption
              ]}
              onPress={() => handleOptionSelect(option.id)}
            >
              {option.icon && (
                <View style={styles.optionIcon}>
                  <Ionicons 
                    name={option.icon} 
                    size={24} 
                    color={isOptionSelected(option.id) ? '#ffffff' : '#6b7280'} 
                  />
                </View>
              )}
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionLabel,
                  isOptionSelected(option.id) && styles.selectedOptionText
                ]}>
                  {option.label}
                </Text>
                {option.subtitle && (
                  <Text style={[
                    styles.optionSubtitle,
                    isOptionSelected(option.id) && styles.selectedOptionSubtext
                  ]}>
                    {option.subtitle}
                  </Text>
                )}
              </View>
              {isOptionSelected(option.id) && (
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  selectedOptionText: {
    color: '#ffffff',
  },
  selectedOptionSubtext: {
    color: '#bfdbfe',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  continueButton: {
    marginTop: 8,
  },
});

export default OnboardingScreen;