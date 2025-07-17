import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { achievementManager, streakManager, ACHIEVEMENT_TYPES } from '../../utils/achievements';
import AchievementCard from '../../components/achievements/AchievementCard';
import StreakDisplay from '../../components/achievements/StreakDisplay';
import AnimatedCard, { StaggeredList } from '../../components/common/AnimatedCard';
import { buttonPressHaptic, successHaptic } from '../../utils/haptics';
import { ModalTransition } from '../../components/transitions/SlideTransition';

const { width: screenWidth } = Dimensions.get('window');

const AchievementsScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userStats, setUserStats] = useState({
    level: { level: 1, title: 'Beginner', points: 0, pointsToNext: 100 },
    achievements: {},
    streaks: {
      workout: 0,
      nutrition: 0,
      wellness: 0,
    },
    longestStreaks: {
      workout: 0,
      nutrition: 0,
      wellness: 0,
    },
  });

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      // In a real app, this would fetch from API/storage
      const level = achievementManager.getUserLevel();
      const achievements = achievementManager.getAchievementsByCategory();
      const streaks = {
        workout: streakManager.getCurrentStreak('workout'),
        nutrition: streakManager.getCurrentStreak('nutrition'),
        wellness: streakManager.getCurrentStreak('wellness'),
      };
      const longestStreaks = {
        workout: streakManager.getLongestStreak('workout'),
        nutrition: streakManager.getLongestStreak('nutrition'),
        wellness: streakManager.getLongestStreak('wellness'),
      };

      setUserStats({
        level,
        achievements,
        streaks,
        longestStreaks,
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserStats();
    setRefreshing(false);
    successHaptic();
  };

  const handleCategorySelect = (category) => {
    buttonPressHaptic();
    setSelectedCategory(category);
  };

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return Object.values(userStats.achievements).flat();
    }
    return userStats.achievements[selectedCategory] || [];
  };

  const getUnlockedCount = () => {
    return Object.values(userStats.achievements)
      .flat()
      .filter(a => a.unlocked).length;
  };

  const getTotalCount = () => {
    return Object.values(userStats.achievements).flat().length;
  };

  const categories = [
    { id: 'all', label: 'All', icon: 'trophy' },
    { id: ACHIEVEMENT_TYPES.WORKOUT, label: 'Fitness', icon: 'fitness' },
    { id: ACHIEVEMENT_TYPES.NUTRITION, label: 'Nutrition', icon: 'restaurant' },
    { id: ACHIEVEMENT_TYPES.WELLNESS, label: 'Wellness', icon: 'heart' },
    { id: ACHIEVEMENT_TYPES.CONSISTENCY, label: 'Streaks', icon: 'flame' },
    { id: ACHIEVEMENT_TYPES.MILESTONE, label: 'Goals', icon: 'flag' },
    { id: ACHIEVEMENT_TYPES.SOCIAL, label: 'Social', icon: 'people' },
  ];

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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievements</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leaderboard')}>
            <Ionicons name="podium" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* User Level and Progress */}
        <AnimatedCard animation="slideUp" delay={100} style={styles.levelCard}>
          <LinearGradient
            colors={['#2563eb20', '#8b5cf620']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          
          <View style={styles.levelContent}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelNumber}>Level {userStats.level.level}</Text>
              <Text style={styles.levelTitle}>{userStats.level.title}</Text>
              
              {userStats.level.pointsToNext > 0 && (
                <Text style={styles.pointsToNext}>
                  {userStats.level.pointsToNext} points to {userStats.level.nextLevelTitle}
                </Text>
              )}
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{achievementManager.totalPoints}</Text>
                <Text style={styles.statLabel}>Total Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getUnlockedCount()}</Text>
                <Text style={styles.statLabel}>Unlocked</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{getTotalCount()}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </View>

          {/* Level Progress Bar */}
          {userStats.level.pointsToNext > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.max(
                        10,
                        100 - (userStats.level.pointsToNext / 100) * 100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}
        </AnimatedCard>

        {/* Current Streaks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Streaks</Text>
          <View style={styles.streaksGrid}>
            <StreakDisplay
              streakCount={userStats.streaks.workout}
              longestStreak={userStats.longestStreaks.workout}
              activityType="workout"
              size="small"
              style={styles.streakItem}
              onPress={() => navigation.navigate('Fitness')}
            />
            <StreakDisplay
              streakCount={userStats.streaks.nutrition}
              longestStreak={userStats.longestStreaks.nutrition}
              activityType="nutrition"
              size="small"
              style={styles.streakItem}
              onPress={() => navigation.navigate('Nutrition')}
            />
            <StreakDisplay
              streakCount={userStats.streaks.wellness}
              longestStreak={userStats.longestStreaks.wellness}
              activityType="wellness"
              size="small"
              style={styles.streakItem}
              onPress={() => navigation.navigate('Wellness')}
            />
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.id && styles.selectedCategory,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                >
                  <Ionicons
                    name={category.icon}
                    size={24}
                    color={selectedCategory === category.id ? '#ffffff' : '#9ca3af'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.selectedCategoryLabel,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Achievements List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Achievements' : 
             categories.find(c => c.id === selectedCategory)?.label + ' Achievements'}
          </Text>
          
          <StaggeredList staggerDelay={100} animation="slideInLeft">
            {getFilteredAchievements().map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                unlocked={achievement.unlocked}
                progress={achievement.progress}
                onPress={handleAchievementPress}
                showProgress={true}
                size="medium"
              />
            ))}
          </StaggeredList>

          {getFilteredAchievements().length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="trophy-outline" size={64} color="#6b7280" />
              <Text style={styles.emptyTitle}>No Achievements Yet</Text>
              <Text style={styles.emptyDescription}>
                Start your journey to unlock amazing achievements!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Achievement Detail Modal */}
      <ModalTransition
        visible={showModal}
        onClose={() => setShowModal(false)}
      >
        {selectedAchievement && (
          <View style={styles.modalContent}>
            <AchievementCard
              achievement={selectedAchievement}
              unlocked={selectedAchievement.unlocked}
              progress={selectedAchievement.progress}
              showProgress={true}
              size="large"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
              
              {!selectedAchievement.unlocked && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={() => {
                    setShowModal(false);
                    // Navigate to relevant screen to work on achievement
                    if (selectedAchievement.type === ACHIEVEMENT_TYPES.WORKOUT) {
                      navigation.navigate('Fitness');
                    } else if (selectedAchievement.type === ACHIEVEMENT_TYPES.NUTRITION) {
                      navigation.navigate('Nutrition');
                    } else if (selectedAchievement.type === ACHIEVEMENT_TYPES.WELLNESS) {
                      navigation.navigate('Wellness');
                    }
                  }}
                >
                  <Text style={styles.primaryButtonText}>Work on This</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ModalTransition>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  levelCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  levelContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  pointsToNext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  streaksGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  streakItem: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#374151',
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#2563eb',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 4,
  },
  selectedCategoryLabel: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContent: {
    width: '100%',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default AchievementsScreen;