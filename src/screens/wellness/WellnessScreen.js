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

const WellnessScreen = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moodOptions = [
    { emoji: '😄', label: 'Great', value: 5 },
    { emoji: '😊', label: 'Good', value: 4 },
    { emoji: '😐', label: 'Okay', value: 3 },
    { emoji: '😔', label: 'Low', value: 2 },
    { emoji: '😢', label: 'Bad', value: 1 },
  ];

  const wellnessTools = [
    {
      title: 'Meditation',
      subtitle: '5-30 min sessions',
      icon: 'leaf',
      color: '#10b981',
    },
    {
      title: 'Breathing',
      subtitle: 'Quick stress relief',
      icon: 'heart',
      color: '#8b5cf6',
    },
    {
      title: 'Sleep Tracker',
      subtitle: 'Monitor sleep quality',
      icon: 'moon',
      color: '#3b82f6',
    },
    {
      title: 'Stress Check',
      subtitle: 'Assess stress levels',
      icon: 'pulse',
      color: '#f59e0b',
    },
  ];

  const todayStats = {
    mood: 4,
    stress: 3,
    energy: 4,
    sleep: 7.5,
    meditation: 15,
  };

  const weeklyInsights = [
    {
      title: 'Sleep Quality Improved',
      description: 'Your average sleep increased by 30 minutes this week',
      icon: 'trending-up',
      color: '#10b981',
    },
    {
      title: 'Stress Management',
      description: 'Consider meditation when stress levels are high',
      icon: 'bulb',
      color: '#f59e0b',
    },
    {
      title: 'Consistency Goal',
      description: 'You meditated 5 days this week. Great progress!',
      icon: 'checkmark-circle',
      color: '#8b5cf6',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Daily Check-in */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodContainer}>
            {moodOptions.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodOption,
                  selectedMood === mood.value && styles.selectedMood
                ]}
                onPress={() => setSelectedMood(mood.value)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Wellness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Wellness</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="happy" size={20} color="#10b981" />
                <Text style={styles.statLabel}>Mood</Text>
              </View>
              <View style={styles.statValue}>
                <Text style={styles.statNumber}>{todayStats.mood}</Text>
                <Text style={styles.statUnit}>/5</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="pulse" size={20} color="#f59e0b" />
                <Text style={styles.statLabel}>Stress</Text>
              </View>
              <View style={styles.statValue}>
                <Text style={styles.statNumber}>{todayStats.stress}</Text>
                <Text style={styles.statUnit}>/5</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="flash" size={20} color="#ef4444" />
                <Text style={styles.statLabel}>Energy</Text>
              </View>
              <View style={styles.statValue}>
                <Text style={styles.statNumber}>{todayStats.energy}</Text>
                <Text style={styles.statUnit}>/5</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <Ionicons name="moon" size={20} color="#3b82f6" />
                <Text style={styles.statLabel}>Sleep</Text>
              </View>
              <View style={styles.statValue}>
                <Text style={styles.statNumber}>{todayStats.sleep}</Text>
                <Text style={styles.statUnit}>hrs</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wellness Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wellness Tools</Text>
          <View style={styles.toolsGrid}>
            {wellnessTools.map((tool, index) => (
              <TouchableOpacity key={index} style={styles.toolCard}>
                <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                  <Ionicons name={tool.icon} size={24} color="white" />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={styles.toolTitle}>{tool.title}</Text>
                  <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#6b7280" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Insights</Text>
          {weeklyInsights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <View style={[styles.insightIcon, { backgroundColor: insight.color }]}>
                <Ionicons name={insight.icon} size={20} color="white" />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="leaf" size={20} color="white" />
              <Text style={styles.quickActionText}>Start Meditation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickActionButton, styles.secondaryButton]}>
              <Ionicons name="heart" size={20} color="#2563eb" />
              <Text style={[styles.quickActionText, styles.secondaryButtonText]}>
                Breathing Exercise
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
  },
  selectedMood: {
    backgroundColor: '#2563eb',
  },
  moodEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
    fontWeight: '600',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 2,
  },
  toolsGrid: {
    gap: 12,
  },
  toolCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  toolSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  insightCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#2563eb',
  },
});

export default WellnessScreen;