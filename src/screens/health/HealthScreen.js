import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HealthScreen = ({ navigation }) => {
  const healthCategories = [
    {
      title: 'Sexual Health',
      subtitle: 'Private & confidential guidance',
      icon: 'heart',
      color: '#ef4444',
      articles: 3,
    },
    {
      title: 'Mental Health',
      subtitle: 'Stress, anxiety & mood support',
      icon: 'brain',
      color: '#8b5cf6',
      articles: 5,
    },
    {
      title: 'Heart Health',
      subtitle: 'Cardiovascular wellness',
      icon: 'pulse',
      color: '#dc2626',
      articles: 4,
    },
    {
      title: 'Nutrition',
      subtitle: 'Healthy eating guidance',
      icon: 'leaf',
      color: '#10b981',
      articles: 6,
    },
  ];

  const recentArticles = [
    {
      title: 'The Importance of Regular Health Checkups',
      category: 'General Health',
      readTime: '5 min read',
      date: '2 days ago',
    },
    {
      title: 'Managing Stress in Your 30s and 40s',
      category: 'Mental Health',
      readTime: '7 min read',
      date: '3 days ago',
    },
    {
      title: 'Heart-Healthy Foods for Men',
      category: 'Nutrition',
      readTime: '6 min read',
      date: '5 days ago',
    },
  ];

  const healthTools = [
    {
      title: 'Symptom Checker',
      subtitle: 'Check symptoms safely',
      icon: 'medical',
      color: '#06b6d4',
    },
    {
      title: 'Find a Doctor',
      subtitle: 'Connect with specialists',
      icon: 'person',
      color: '#3b82f6',
    },
    {
      title: 'Health Records',
      subtitle: 'Track your health data',
      icon: 'document-text',
      color: '#10b981',
    },
    {
      title: 'Medication Reminders',
      subtitle: 'Never miss a dose',
      icon: 'alarm',
      color: '#f59e0b',
    },
  ];

  const upcomingReminders = [
    {
      title: 'Annual Physical Checkup',
      date: 'Due in 2 weeks',
      type: 'appointment',
      icon: 'calendar',
    },
    {
      title: 'Blood Pressure Check',
      date: 'Tomorrow',
      type: 'measurement',
      icon: 'pulse',
    },
    {
      title: 'Vitamin D Supplement',
      date: 'Daily at 8:00 AM',
      type: 'medication',
      icon: 'medical',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Health Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Topics</Text>
          <View style={styles.categoriesGrid}>
            {healthCategories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon} size={24} color="white" />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                <Text style={styles.categoryArticles}>
                  {category.articles} articles
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tools</Text>
          <View style={styles.toolsGrid}>
            {healthTools.map((tool, index) => (
              <TouchableOpacity key={index} style={styles.toolCard}>
                <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                  <Ionicons name={tool.icon} size={20} color="white" />
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

        {/* Health Reminders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Reminders</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>Manage</Text>
            </TouchableOpacity>
          </View>
          {upcomingReminders.map((reminder, index) => (
            <TouchableOpacity key={index} style={styles.reminderCard}>
              <View style={styles.reminderIcon}>
                <Ionicons name={reminder.icon} size={20} color="#2563eb" />
              </View>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderDate}>{reminder.date}</Text>
              </View>
              <View style={styles.reminderType}>
                <Text style={styles.reminderTypeText}>{reminder.type}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Articles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Articles</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentArticles.map((article, index) => (
            <TouchableOpacity key={index} style={styles.articleCard}>
              <View style={styles.articleContent}>
                <Text style={styles.articleTitle}>{article.title}</Text>
                <View style={styles.articleMeta}>
                  <Text style={styles.articleCategory}>{article.category}</Text>
                  <Text style={styles.articleDot}>•</Text>
                  <Text style={styles.articleReadTime}>{article.readTime}</Text>
                  <Text style={styles.articleDot}>•</Text>
                  <Text style={styles.articleDate}>{article.date}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.emergencyCard}>
            <View style={styles.emergencyIcon}>
              <Ionicons name="call" size={24} color="white" />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Emergency Contact</Text>
              <Text style={styles.emergencySubtitle}>
                24/7 health support line
              </Text>
            </View>
            <Text style={styles.emergencyNumber}>911</Text>
          </TouchableOpacity>
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
  categorySubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryArticles: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
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
    width: 35,
    height: 35,
    borderRadius: 17.5,
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
  reminderCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reminderDate: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  reminderType: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reminderTypeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  articleCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleContent: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleCategory: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  articleDot: {
    fontSize: 12,
    color: '#6b7280',
    marginHorizontal: 6,
  },
  articleReadTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  articleDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emergencyCard: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  emergencySubtitle: {
    fontSize: 14,
    color: '#fecaca',
    marginTop: 2,
  },
  emergencyNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default HealthScreen;