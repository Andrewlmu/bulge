import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FitnessScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('workouts');

  const workoutCategories = [
    { 
      title: 'Strength Training', 
      icon: 'barbell', 
      duration: '45-60 min',
      exercises: '8-12',
      color: '#ef4444'
    },
    { 
      title: 'HIIT Cardio', 
      icon: 'flash', 
      duration: '20-30 min',
      exercises: '6-8',
      color: '#f59e0b'
    },
    { 
      title: 'Full Body', 
      icon: 'body', 
      duration: '60-75 min',
      exercises: '12-15',
      color: '#10b981'
    },
    { 
      title: 'Core & Abs', 
      icon: 'fitness', 
      duration: '15-25 min',
      exercises: '8-10',
      color: '#8b5cf6'
    },
  ];

  const recentWorkouts = [
    {
      name: 'Upper Body Strength',
      date: 'Today',
      duration: '52 min',
      exercises: 8,
      calories: 324,
    },
    {
      name: 'HIIT Cardio Blast',
      date: 'Yesterday',
      duration: '25 min',
      exercises: 6,
      calories: 285,
    },
    {
      name: 'Leg Day',
      date: '2 days ago',
      duration: '58 min',
      exercises: 10,
      calories: 412,
    },
  ];

  const progressStats = [
    { label: 'This Week', value: '4', unit: 'workouts' },
    { label: 'Total Time', value: '3.2', unit: 'hours' },
    { label: 'Calories Burned', value: '1,245', unit: 'kcal' },
    { label: 'Avg Duration', value: '48', unit: 'minutes' },
  ];

  const renderWorkoutsTab = () => (
    <View>
      {/* Quick Start */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.quickStartButton}>
          <View style={styles.quickStartContent}>
            <View>
              <Text style={styles.quickStartTitle}>Quick Start Workout</Text>
              <Text style={styles.quickStartSubtitle}>
                Upper body • 45 minutes
              </Text>
            </View>
            <View style={styles.playButton}>
              <Ionicons name="play" size={24} color="white" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Workout Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Workout Categories</Text>
        <View style={styles.categoriesGrid}>
          {workoutCategories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryCard}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon} size={24} color="white" />
              </View>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categoryDuration}>{category.duration}</Text>
              <Text style={styles.categoryExercises}>{category.exercises} exercises</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        {recentWorkouts.map((workout, index) => (
          <TouchableOpacity key={index} style={styles.workoutCard}>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutDate}>{workout.date}</Text>
            </View>
            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color="#9ca3af" />
                <Text style={styles.statText}>{workout.duration}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="fitness-outline" size={14} color="#9ca3af" />
                <Text style={styles.statText}>{workout.exercises} exercises</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="flame-outline" size={14} color="#9ca3af" />
                <Text style={styles.statText}>{workout.calories} cal</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProgressTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>This Week's Progress</Text>
      <View style={styles.progressGrid}>
        {progressStats.map((stat, index) => (
          <View key={index} style={styles.progressCard}>
            <Text style={styles.progressValue}>{stat.value}</Text>
            <Text style={styles.progressUnit}>{stat.unit}</Text>
            <Text style={styles.progressLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      
      {/* Chart placeholder */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Weekly Activity</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartPlaceholderText}>
            Weekly progress chart will be displayed here
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'workouts' && styles.activeTab]}
          onPress={() => setActiveTab('workouts')}
        >
          <Text style={[styles.tabText, activeTab === 'workouts' && styles.activeTabText]}>
            Workouts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'progress' && styles.activeTab]}
          onPress={() => setActiveTab('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.activeTabText]}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'workouts' ? renderWorkoutsTab() : renderProgressTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  activeTabText: {
    color: 'white',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  seeAllButton: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  quickStartButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 20,
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  quickStartSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 4,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  categoryExercises: {
    fontSize: 12,
    color: '#9ca3af',
  },
  workoutCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutInfo: {
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  workoutDate: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 4,
  },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  progressUnit: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  progressLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  chartPlaceholderText: {
    color: '#9ca3af',
    fontSize: 14,
  },
});

export default FitnessScreen;