import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { useApp } from '../../context/AppContext';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import ProgressChart, { ProgressRing } from '../../components/charts/ProgressChart';
import Card from '../../components/common/Card';
import AnimatedCard, { StaggeredList } from '../../components/common/AnimatedCard';
import AnimatedButton from '../../components/common/AnimatedButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FadeTransition } from '../../components/transitions/SlideTransition';
import { pullRefreshHaptic, buttonPressHaptic } from '../../utils/haptics';
import ApiService from '../../services/api';

const { width: screenWidth } = Dimensions.get('window');

const EnhancedDashboardScreen = ({ navigation }) => {
  const { user, todayStats, updateTodayStats } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Simulate API call for demo purposes
      const mockWeeklyData = generateMockWeeklyData();
      setWeeklyData(mockWeeklyData);
      
      // In production, this would be:
      // const response = await ApiService.analytics.getDashboardData(selectedPeriod);
      // setWeeklyData(response.data);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    pullRefreshHaptic();
    await loadDashboardData();
    setRefreshing(false);
  };

  const generateMockWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const workoutData = [3, 0, 4, 2, 5, 1, 3];
    const caloriesData = [2200, 2100, 2400, 2300, 2500, 1900, 2150];
    const stepsData = [8500, 6200, 9800, 7500, 11200, 5400, 8400];
    const sleepData = [7.5, 6.8, 8.2, 7.1, 6.5, 8.9, 7.3];

    return {
      labels: days,
      workouts: workoutData,
      calories: caloriesData,
      steps: stepsData,
      sleep: sleepData,
      weeklyStats: {
        totalWorkouts: workoutData.reduce((a, b) => a + b, 0),
        avgCalories: Math.round(caloriesData.reduce((a, b) => a + b, 0) / days.length),
        avgSteps: Math.round(stepsData.reduce((a, b) => a + b, 0) / days.length),
        avgSleep: (sleepData.reduce((a, b) => a + b, 0) / days.length).toFixed(1),
      },
    };
  };

  const quickActions = [
    { 
      title: 'Log Workout', 
      icon: 'fitness', 
      color: '#ef4444',
      screen: 'WorkoutDetail',
      badge: '2 pending'
    },
    { 
      title: 'Log Meal', 
      icon: 'restaurant', 
      color: '#10b981',
      screen: 'AddMeal',
      badge: null
    },
    { 
      title: 'Mood Check', 
      icon: 'heart', 
      color: '#8b5cf6',
      screen: 'WellnessEntry',
      badge: '!',
    },
    { 
      title: 'Health Tips', 
      icon: 'medical', 
      color: '#06b6d4',
      screen: 'HealthArticles',
      badge: '3 new'
    },
  ];

  const progressData = {
    labels: ['Fitness', 'Nutrition', 'Sleep', 'Wellness'],
    data: [
      todayStats.steps / todayStats.stepsTarget,
      todayStats.calories / todayStats.caloriesTarget,
      todayStats.sleep / todayStats.sleepTarget,
      todayStats.mood / 5,
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#1f2937',
    backgroundGradientTo: '#374151',
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
  };

  const periodOptions = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
  ];

  if (loading && !weeklyData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner 
            size="large" 
            variant="pulse" 
            text="Loading dashboard..." 
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
            <Text style={styles.username}>{user.name.split(' ')[0]}!</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0)}
              </Text>
              {todayStats.mood >= 4 && (
                <View style={styles.moodIndicator}>
                  <Text style={styles.moodEmoji}>😊</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periodOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.periodButton,
                selectedPeriod === option.value && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(option.value)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === option.value && styles.periodButtonTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Progress Overview */}
        <FadeTransition visible={!loading}>
          <AnimatedCard 
            animation="slideUp" 
            delay={100}
            style={styles.progressOverview}
          >
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <ProgressChart
              data={progressData}
              size={screenWidth - 120}
              strokeWidth={12}
              radius={25}
              colors={['#ef4444', '#10b981', '#3b82f6', '#8b5cf6']}
            />
          </AnimatedCard>
        </FadeTransition>

        {/* Quick Stats Grid */}
        <View style={styles.quickStatsGrid}>
          <ProgressRing
            progress={todayStats.steps / todayStats.stepsTarget}
            size={100}
            strokeWidth={8}
            color="#ef4444"
            label="Steps"
            value={`${todayStats.steps.toLocaleString()}`}
            style={styles.progressRing}
          />
          <ProgressRing
            progress={todayStats.calories / todayStats.caloriesTarget}
            size={100}
            strokeWidth={8}
            color="#10b981"
            label="Calories"
            value={`${todayStats.calories}`}
            style={styles.progressRing}
          />
          <ProgressRing
            progress={todayStats.water / todayStats.waterTarget}
            size={100}
            strokeWidth={8}
            color="#3b82f6"
            label="Water"
            value={`${todayStats.water}`}
            style={styles.progressRing}
          />
        </View>

        {/* Weekly Activity Chart */}
        {weeklyData && (
          <LineChart
            data={{
              labels: weeklyData.labels,
              datasets: [{
                data: weeklyData.steps,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              }]
            }}
            title="Weekly Steps"
            subtitle={`Average: ${weeklyData.weeklyStats.avgSteps.toLocaleString()} steps/day`}
            height={200}
            chartConfig={chartConfig}
            suffix=""
            onDataPointClick={(data) => {
              console.log('Chart data point clicked:', data);
              // Navigate to detailed view
            }}
          />
        )}

        {/* Workout Activity */}
        {weeklyData && (
          <BarChart
            data={{
              labels: weeklyData.labels,
              datasets: [{
                data: weeklyData.workouts,
              }]
            }}
            title="Weekly Workouts"
            subtitle={`Total: ${weeklyData.weeklyStats.totalWorkouts} workouts this week`}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            }}
            suffix=" workouts"
            showValuesOnTopOfBars={true}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <StaggeredList staggerDelay={150} animation="slideInLeft">
            {quickActions.map((action, index) => (
              <AnimatedCard
                key={index}
                pressable
                onPress={() => {
                  buttonPressHaptic();
                  if (action.screen === 'WorkoutDetail') {
                    navigation.navigate('Fitness');
                  } else {
                    navigation.navigate(action.screen || 'Fitness');
                  }
                }}
                style={[styles.actionCard, { borderLeftColor: action.color }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  {action.badge && (
                    <Text style={styles.actionBadge}>{action.badge}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </AnimatedCard>
            ))}
          </StaggeredList>
        </View>

        {/* Weekly Insights */}
        <AnimatedCard 
          animation="slideInRight" 
          delay={400}
          style={styles.insightsCard}
        >
          <Text style={styles.sectionTitle}>Weekly Insights</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: '#10b981' }]}>
                <Ionicons name="trending-up" size={20} color="white" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Great Progress!</Text>
                <Text style={styles.insightDescription}>
                  You're 20% more active than last week. Keep it up!
                </Text>
              </View>
            </View>
            
            <View style={styles.insightItem}>
              <View style={[styles.insightIcon, { backgroundColor: '#f59e0b' }]}>
                <Ionicons name="bulb" size={20} color="white" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Sleep Tip</Text>
                <Text style={styles.insightDescription}>
                  Try going to bed 30 minutes earlier to reach your 8-hour goal.
                </Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Goal Progress */}
        <AnimatedCard 
          animation="scaleIn" 
          delay={500}
          style={styles.goalsCard}
        >
          <View style={styles.goalsHeader}>
            <Text style={styles.sectionTitle}>Current Goals</Text>
            <AnimatedButton
              title="View All"
              variant="outline"
              size="small"
              onPress={() => {
                buttonPressHaptic();
                navigation.navigate('Goals');
              }}
              style={styles.viewAllButton}
            />
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Lose 10 pounds</Text>
              <Text style={styles.goalProgress}>185 lbs → 175 lbs</Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.goalPercentage}>60%</Text>
          </View>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Exercise 5x per week</Text>
              <Text style={styles.goalProgress}>4/5 workouts this week</Text>
            </View>
            <View style={styles.goalProgressBar}>
              <View style={[styles.goalProgressFill, { width: '80%' }]} />
            </View>
            <Text style={styles.goalPercentage}>80%</Text>
          </View>
        </AnimatedCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#9ca3af',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileButton: {
    padding: 5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarText: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 45,
  },
  moodIndicator: {
    position: 'absolute',
    right: -5,
    top: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#2563eb',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  progressOverview: {
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  progressRing: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 15,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionBadge: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
    marginTop: 2,
  },
  insightsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  goalsCard: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
    marginRight: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  goalProgress: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  goalProgressBar: {
    flex: 2,
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    marginRight: 12,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  goalPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    width: 40,
    textAlign: 'right',
  },
  viewAllButton: {
    minWidth: 80,
    paddingHorizontal: 12,
  },
});

export default EnhancedDashboardScreen;