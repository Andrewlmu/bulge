import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Dashboard Screens
import EnhancedDashboardScreen from '../screens/dashboard/EnhancedDashboardScreen';

// Existing Screens
import FitnessScreen from '../screens/fitness/FitnessScreen';
import WorkoutDetailScreen from '../screens/fitness/WorkoutDetailScreen';
import NutritionScreen from '../screens/nutrition/NutritionScreen';
import AddMealScreen from '../screens/nutrition/AddMealScreen';
import WellnessScreen from '../screens/wellness/WellnessScreen';
import HealthScreen from '../screens/health/HealthScreen';
import ProfileScreen from '../screens/social/ProfileScreen';

// Placeholder for screens under development
import PlaceholderScreen from '../screens/PlaceholderScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack Navigators for each tab
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1f2937' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="DashboardMain" 
      component={EnhancedDashboardScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Goals" 
      component={PlaceholderScreen}
      options={{ title: 'My Goals' }}
      initialParams={{ 
        title: 'Goals', 
        description: 'Track your health and fitness goals with progress monitoring and achievement milestones.',
        icon: 'flag-outline'
      }}
    />
    <Stack.Screen 
      name="Analytics" 
      component={PlaceholderScreen}
      options={{ title: 'Analytics' }}
      initialParams={{ 
        title: 'Analytics', 
        description: 'Detailed insights and analytics about your health and fitness progress.',
        icon: 'analytics-outline'
      }}
    />
  </Stack.Navigator>
);

const FitnessStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1f2937' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="FitnessMain" 
      component={FitnessScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="WorkoutDetail" 
      component={WorkoutDetailScreen}
      options={{ title: 'Workout' }}
    />
    <Stack.Screen 
      name="ExerciseLibrary" 
      component={PlaceholderScreen}
      options={{ title: 'Exercise Library' }}
      initialParams={{ 
        title: 'Exercise Library', 
        description: 'Browse thousands of exercises with detailed instructions and video demonstrations.',
        icon: 'library-outline'
      }}
    />
    <Stack.Screen 
      name="WorkoutHistory" 
      component={PlaceholderScreen}
      options={{ title: 'Workout History' }}
      initialParams={{ 
        title: 'Workout History', 
        description: 'Review your past workouts with detailed analytics and progress tracking.',
        icon: 'time-outline'
      }}
    />
    <Stack.Screen 
      name="CreateWorkout" 
      component={PlaceholderScreen}
      options={{ 
        title: 'Create Workout',
        presentation: 'modal',
      }}
      initialParams={{ 
        title: 'Create Workout', 
        description: 'Design custom workouts tailored to your goals and preferences.',
        icon: 'add-circle-outline'
      }}
    />
  </Stack.Navigator>
);

const NutritionStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1f2937' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="NutritionMain" 
      component={NutritionScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddMeal" 
      component={AddMealScreen}
      options={{ 
        title: 'Add Meal',
        presentation: 'modal',
      }}
    />
    <Stack.Screen 
      name="FoodSearch" 
      component={PlaceholderScreen}
      options={{ title: 'Search Food' }}
      initialParams={{ 
        title: 'Food Search', 
        description: 'Search our comprehensive food database with nutritional information.',
        icon: 'search-outline'
      }}
    />
    <Stack.Screen 
      name="NutritionGoals" 
      component={PlaceholderScreen}
      options={{ title: 'Nutrition Goals' }}
      initialParams={{ 
        title: 'Nutrition Goals', 
        description: 'Set and track your daily nutrition targets and macro goals.',
        icon: 'trophy-outline'
      }}
    />
    <Stack.Screen 
      name="MealHistory" 
      component={PlaceholderScreen}
      options={{ title: 'Meal History' }}
      initialParams={{ 
        title: 'Meal History', 
        description: 'Review your nutrition history with detailed analytics and trends.',
        icon: 'calendar-outline'
      }}
    />
  </Stack.Navigator>
);

const WellnessStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1f2937' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="WellnessMain" 
      component={WellnessScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Meditation" 
      component={PlaceholderScreen}
      options={{ title: 'Meditation' }}
      initialParams={{ 
        title: 'Meditation', 
        description: 'Guided meditation sessions for stress relief and mindfulness.',
        icon: 'leaf-outline'
      }}
    />
    <Stack.Screen 
      name="SleepTracking" 
      component={PlaceholderScreen}
      options={{ title: 'Sleep Tracking' }}
      initialParams={{ 
        title: 'Sleep Tracking', 
        description: 'Monitor your sleep patterns and quality for better rest.',
        icon: 'moon-outline'
      }}
    />
    <Stack.Screen 
      name="StressManagement" 
      component={PlaceholderScreen}
      options={{ title: 'Stress Management' }}
      initialParams={{ 
        title: 'Stress Management', 
        description: 'Tools and techniques for managing stress and anxiety.',
        icon: 'shield-outline'
      }}
    />
    <Stack.Screen 
      name="WellnessEntry" 
      component={PlaceholderScreen}
      options={{ 
        title: 'Wellness Check-in',
        presentation: 'modal',
      }}
      initialParams={{ 
        title: 'Wellness Check-in', 
        description: 'Log your daily mood, stress, and energy levels.',
        icon: 'heart-outline'
      }}
    />
  </Stack.Navigator>
);

const HealthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1f2937' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="HealthMain" 
      component={HealthScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="HealthMetrics" 
      component={PlaceholderScreen}
      options={{ title: 'Health Metrics' }}
      initialParams={{ 
        title: 'Health Metrics', 
        description: 'Track vital health measurements and biomarkers.',
        icon: 'pulse-outline'
      }}
    />
    <Stack.Screen 
      name="HealthArticles" 
      component={PlaceholderScreen}
      options={{ title: 'Health Articles' }}
      initialParams={{ 
        title: 'Health Articles', 
        description: 'Evidence-based health articles and educational content.',
        icon: 'document-text-outline'
      }}
    />
    <Stack.Screen 
      name="Telehealth" 
      component={PlaceholderScreen}
      options={{ title: 'Telehealth' }}
      initialParams={{ 
        title: 'Telehealth', 
        description: 'Connect with healthcare professionals remotely.',
        icon: 'videocam-outline'
      }}
    />
    <Stack.Screen 
      name="SymptomChecker" 
      component={PlaceholderScreen}
      options={{ title: 'Symptom Checker' }}
      initialParams={{ 
        title: 'Symptom Checker', 
        description: 'AI-powered symptom assessment and health guidance.',
        icon: 'medical-outline'
      }}
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#1f2937' },
      headerTintColor: '#ffffff',
      headerTitleStyle: { fontWeight: 'bold' },
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={PlaceholderScreen}
      options={{ title: 'Edit Profile' }}
      initialParams={{ 
        title: 'Edit Profile', 
        description: 'Update your personal information and preferences.',
        icon: 'create-outline'
      }}
    />
    <Stack.Screen 
      name="Settings" 
      component={PlaceholderScreen}
      options={{ title: 'Settings' }}
      initialParams={{ 
        title: 'Settings', 
        description: 'Customize your app experience and preferences.',
        icon: 'settings-outline'
      }}
    />
    <Stack.Screen 
      name="NotificationsSettings" 
      component={PlaceholderScreen}
      options={{ title: 'Notifications' }}
      initialParams={{ 
        title: 'Notifications', 
        description: 'Manage your notification preferences and alerts.',
        icon: 'notifications-outline'
      }}
    />
    <Stack.Screen 
      name="PrivacySettings" 
      component={PlaceholderScreen}
      options={{ title: 'Privacy & Security' }}
      initialParams={{ 
        title: 'Privacy & Security', 
        description: 'Control your data privacy and security settings.',
        icon: 'lock-closed-outline'
      }}
    />
    <Stack.Screen 
      name="Subscription" 
      component={PlaceholderScreen}
      options={{ title: 'Subscription' }}
      initialParams={{ 
        title: 'Subscription', 
        description: 'Manage your premium subscription and billing.',
        icon: 'card-outline'
      }}
    />
  </Stack.Navigator>
);

// Main Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Fitness':
              iconName = focused ? 'fitness' : 'fitness-outline';
              break;
            case 'Nutrition':
              iconName = focused ? 'restaurant' : 'restaurant-outline';
              break;
            case 'Wellness':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Health':
              iconName = focused ? 'medical' : 'medical-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#1f2937',
          borderTopColor: '#374151',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardStack}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Fitness" 
        component={FitnessStack}
        options={{ title: 'Workouts' }}
      />
      <Tab.Screen 
        name="Nutrition" 
        component={NutritionStack}
        options={{ title: 'Nutrition' }}
      />
      <Tab.Screen 
        name="Wellness" 
        component={WellnessStack}
        options={{ title: 'Wellness' }}
      />
      <Tab.Screen 
        name="Health" 
        component={HealthStack}
        options={{ title: 'Health' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#111827' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
  </Stack.Navigator>
);

// Root App Navigator
const EnhancedAppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [authToken, onboardingComplete] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('onboarding_complete'),
      ]);

      setIsAuthenticated(!!authToken);
      setHasCompletedOnboarding(!!onboardingComplete);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // You could show a splash screen here
  }

  const linking = {
    prefixes: ['bulge://'],
    config: {
      screens: {
        AuthStack: {
          screens: {
            Login: 'login',
            SignUp: 'signup',
            ForgotPassword: 'forgot-password',
            Onboarding: 'onboarding',
          },
        },
        MainTabs: {
          screens: {
            Dashboard: {
              screens: {
                DashboardMain: 'dashboard',
                Goals: 'goals',
                Analytics: 'analytics',
              },
            },
            Fitness: {
              screens: {
                FitnessMain: 'fitness',
                WorkoutDetail: 'workout/:id',
                ExerciseLibrary: 'exercises',
                WorkoutHistory: 'workout-history',
                CreateWorkout: 'create-workout',
              },
            },
            Nutrition: {
              screens: {
                NutritionMain: 'nutrition',
                AddMeal: 'add-meal',
                FoodSearch: 'food-search',
                NutritionGoals: 'nutrition-goals',
                MealHistory: 'meal-history',
              },
            },
            Wellness: {
              screens: {
                WellnessMain: 'wellness',
                Meditation: 'meditation',
                SleepTracking: 'sleep',
                StressManagement: 'stress',
                WellnessEntry: 'wellness-entry',
              },
            },
            Health: {
              screens: {
                HealthMain: 'health',
                HealthMetrics: 'health-metrics',
                HealthArticles: 'articles',
                Telehealth: 'telehealth',
                SymptomChecker: 'symptoms',
              },
            },
            Profile: {
              screens: {
                ProfileMain: 'profile',
                EditProfile: 'edit-profile',
                Settings: 'settings',
                NotificationsSettings: 'notifications',
                PrivacySettings: 'privacy',
                Subscription: 'subscription',
              },
            },
          },
        },
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default EnhancedAppNavigator;