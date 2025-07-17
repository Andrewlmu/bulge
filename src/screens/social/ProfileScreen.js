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

const ProfileScreen = ({ navigation }) => {
  const userStats = [
    { label: 'Current Weight', value: '185', unit: 'lbs' },
    { label: 'Goal Weight', value: '175', unit: 'lbs' },
    { label: 'Height', value: '6\'1"', unit: '' },
    { label: 'Age', value: '32', unit: 'years' },
  ];

  const achievements = [
    { title: '30 Day Streak', icon: 'flame', color: '#ef4444' },
    { title: 'Workout Warrior', icon: 'fitness', color: '#10b981' },
    { title: 'Nutrition Pro', icon: 'leaf', color: '#22c55e' },
    { title: 'Mindful Master', icon: 'heart', color: '#8b5cf6' },
  ];

  const menuItems = [
    {
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      icon: 'person',
      action: 'edit-profile',
    },
    {
      title: 'Health Goals',
      subtitle: 'Manage your fitness objectives',
      icon: 'flag',
      action: 'goals',
    },
    {
      title: 'Notifications',
      subtitle: 'Customize your alerts',
      icon: 'notifications',
      action: 'notifications',
    },
    {
      title: 'Privacy & Security',
      subtitle: 'Manage your data and privacy',
      icon: 'shield-checkmark',
      action: 'privacy',
    },
    {
      title: 'Connected Apps',
      subtitle: 'Sync with health & fitness apps',
      icon: 'link',
      action: 'integrations',
    },
    {
      title: 'Subscription',
      subtitle: 'Manage your premium features',
      icon: 'card',
      action: 'subscription',
    },
  ];

  const supportItems = [
    {
      title: 'Help Center',
      icon: 'help-circle',
      action: 'help',
    },
    {
      title: 'Contact Support',
      icon: 'mail',
      action: 'support',
    },
    {
      title: 'Share Feedback',
      icon: 'chatbubble',
      action: 'feedback',
    },
    {
      title: 'Rate the App',
      icon: 'star',
      action: 'rate',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>M</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>Mike Johnson</Text>
              <Text style={styles.userEmail}>mike.johnson@email.com</Text>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="create" size={16} color="#2563eb" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* User Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Stats</Text>
          <View style={styles.statsGrid}>
            {userStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statValue}>
                  {stat.value}
                  <Text style={styles.statUnit}> {stat.unit}</Text>
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementCard}>
                <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                  <Ionicons name={achievement.icon} size={24} color="white" />
                </View>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color="#6b7280" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color="#6b7280" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfo}>
            <Text style={styles.appName}>Bulge</Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#1f2937',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    marginLeft: 4,
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
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statUnit: {
    fontSize: 16,
    color: '#9ca3af',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  menuItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appVersion: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  signOutButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginLeft: 8,
  },
});

export default ProfileScreen;