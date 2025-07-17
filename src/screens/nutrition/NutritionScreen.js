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

const NutritionScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('today');

  const todayNutrition = {
    calories: { consumed: 1850, target: 2500 },
    protein: { consumed: 125, target: 180 },
    carbs: { consumed: 180, target: 250 },
    fat: { consumed: 75, target: 85 },
    water: { consumed: 6, target: 8 },
  };

  const recentMeals = [
    {
      name: 'Grilled Chicken Salad',
      time: '12:30 PM',
      type: 'Lunch',
      calories: 425,
      protein: 35,
    },
    {
      name: 'Protein Smoothie',
      time: '9:15 AM',
      type: 'Breakfast',
      calories: 320,
      protein: 25,
    },
    {
      name: 'Mixed Nuts',
      time: '3:00 PM',
      type: 'Snack',
      calories: 180,
      protein: 6,
    },
  ];

  const quickAddItems = [
    { name: 'Protein Shake', icon: 'fitness', calories: 150 },
    { name: 'Greek Yogurt', icon: 'nutrition', calories: 100 },
    { name: 'Banana', icon: 'leaf', calories: 105 },
    { name: 'Almonds (1oz)', icon: 'ellipse', calories: 160 },
  ];

  const weeklyProgress = [
    { day: 'Mon', calories: 2350 },
    { day: 'Tue', calories: 2180 },
    { day: 'Wed', calories: 2420 },
    { day: 'Thu', calories: 2290 },
    { day: 'Fri', calories: 2150 },
    { day: 'Sat', calories: 2380 },
    { day: 'Sun', calories: 1850 },
  ];

  const renderTodayTab = () => (
    <View>
      {/* Calorie Overview */}
      <View style={styles.section}>
        <View style={styles.calorieCard}>
          <View style={styles.calorieHeader}>
            <Text style={styles.calorieTitle}>Calories Today</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color="#2563eb" />
            </TouchableOpacity>
          </View>
          <View style={styles.calorieMain}>
            <Text style={styles.calorieConsumed}>{todayNutrition.calories.consumed}</Text>
            <Text style={styles.calorieTarget}>/ {todayNutrition.calories.target}</Text>
          </View>
          <View style={styles.calorieProgress}>
            <View 
              style={[
                styles.calorieProgressFill, 
                { width: `${(todayNutrition.calories.consumed / todayNutrition.calories.target) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.calorieRemaining}>
            {todayNutrition.calories.target - todayNutrition.calories.consumed} calories remaining
          </Text>
        </View>
      </View>

      {/* Macros */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Macronutrients</Text>
        <View style={styles.macrosGrid}>
          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroValue}>
              {todayNutrition.protein.consumed}g
            </Text>
            <Text style={styles.macroTarget}>
              /{todayNutrition.protein.target}g
            </Text>
            <View style={styles.macroProgress}>
              <View 
                style={[
                  styles.macroProgressFill,
                  { 
                    width: `${(todayNutrition.protein.consumed / todayNutrition.protein.target) * 100}%`,
                    backgroundColor: '#ef4444'
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroValue}>
              {todayNutrition.carbs.consumed}g
            </Text>
            <Text style={styles.macroTarget}>
              /{todayNutrition.carbs.target}g
            </Text>
            <View style={styles.macroProgress}>
              <View 
                style={[
                  styles.macroProgressFill,
                  { 
                    width: `${(todayNutrition.carbs.consumed / todayNutrition.carbs.target) * 100}%`,
                    backgroundColor: '#10b981'
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.macroCard}>
            <Text style={styles.macroLabel}>Fat</Text>
            <Text style={styles.macroValue}>
              {todayNutrition.fat.consumed}g
            </Text>
            <Text style={styles.macroTarget}>
              /{todayNutrition.fat.target}g
            </Text>
            <View style={styles.macroProgress}>
              <View 
                style={[
                  styles.macroProgressFill,
                  { 
                    width: `${(todayNutrition.fat.consumed / todayNutrition.fat.target) * 100}%`,
                    backgroundColor: '#f59e0b'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Add */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickAddGrid}>
          {quickAddItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.quickAddCard}>
              <View style={styles.quickAddIcon}>
                <Ionicons name={item.icon} size={24} color="#2563eb" />
              </View>
              <Text style={styles.quickAddName}>{item.name}</Text>
              <Text style={styles.quickAddCalories}>{item.calories} cal</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Meals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentMeals.map((meal, index) => (
          <TouchableOpacity key={index} style={styles.mealCard}>
            <View style={styles.mealInfo}>
              <Text style={styles.mealName}>{meal.name}</Text>
              <Text style={styles.mealMeta}>
                {meal.type} • {meal.time}
              </Text>
            </View>
            <View style={styles.mealStats}>
              <Text style={styles.mealCalories}>{meal.calories} cal</Text>
              <Text style={styles.mealProtein}>{meal.protein}g protein</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderWeeklyTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Weekly Overview</Text>
      
      {/* Weekly Chart */}
      <View style={styles.weeklyChart}>
        <Text style={styles.chartTitle}>Daily Calories</Text>
        <View style={styles.chartContainer}>
          {weeklyProgress.map((day, index) => (
            <View key={index} style={styles.chartBar}>
              <View 
                style={[
                  styles.chartBarFill, 
                  { height: `${(day.calories / 2500) * 100}%` }
                ]} 
              />
              <Text style={styles.chartDay}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Stats */}
      <View style={styles.weeklyStats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2,257</Text>
          <Text style={styles.statLabel}>Avg Calories</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>156g</Text>
          <Text style={styles.statLabel}>Avg Protein</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>7.2</Text>
          <Text style={styles.statLabel}>Glasses Water</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.activeTab]}
          onPress={() => setActiveTab('today')}
        >
          <Text style={[styles.tabText, activeTab === 'today' && styles.activeTabText]}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'weekly' && styles.activeTab]}
          onPress={() => setActiveTab('weekly')}
        >
          <Text style={[styles.tabText, activeTab === 'weekly' && styles.activeTabText]}>
            Weekly
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'today' ? renderTodayTab() : renderWeeklyTab()}
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
  calorieCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  calorieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addButton: {
    padding: 5,
  },
  calorieMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  calorieConsumed: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calorieTarget: {
    fontSize: 18,
    color: '#9ca3af',
    marginLeft: 5,
  },
  calorieProgress: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    marginBottom: 10,
  },
  calorieProgressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  calorieRemaining: {
    fontSize: 14,
    color: '#9ca3af',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '31%',
  },
  macroLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
    fontWeight: '600',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  macroTarget: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 10,
  },
  macroProgress: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickAddGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAddCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  quickAddIcon: {
    marginBottom: 8,
  },
  quickAddName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickAddCalories: {
    fontSize: 12,
    color: '#9ca3af',
  },
  mealCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  mealMeta: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  mealStats: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  mealProtein: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  weeklyChart: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarFill: {
    backgroundColor: '#2563eb',
    width: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  chartDay: {
    fontSize: 12,
    color: '#9ca3af',
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '31%',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default NutritionScreen;