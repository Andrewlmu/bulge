import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * Generic placeholder screen for screens that are referenced but not yet implemented
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object
 * @param {Object} props.route - Route object with screen title
 */
const PlaceholderScreen = ({ navigation, route }) => {
  const screenTitle = route.params?.title || route.name || 'Coming Soon';
  const description = route.params?.description || 'This feature is currently under development and will be available in a future update.';
  const icon = route.params?.icon || 'construct-outline';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.placeholderCard}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={64} color="#6b7280" />
          </View>
          
          <Text style={styles.title}>{screenTitle}</Text>
          <Text style={styles.description}>{description}</Text>
          
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Planned Features:</Text>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
              <Text style={styles.featureText}>Modern, intuitive interface</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
              <Text style={styles.featureText}>Real-time data synchronization</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
              <Text style={styles.featureText}>Comprehensive tracking and analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#10b981" />
              <Text style={styles.featureText}>Personalized recommendations</Text>
            </View>
          </View>

          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
        </Card>

        <Card style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Help Us Improve</Text>
          <Text style={styles.feedbackDescription}>
            Your feedback is valuable! Let us know what features you'd like to see implemented first.
          </Text>
          <Button
            title="Send Feedback"
            onPress={() => {
              // In a real app, this would open a feedback form or email
              console.log('Send feedback pressed');
            }}
            size="small"
            style={styles.feedbackButton}
          />
        </Card>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  placeholderCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    width: '100%',
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#d1d5db',
    marginLeft: 12,
  },
  backButton: {
    width: '100%',
  },
  feedbackCard: {
    alignItems: 'center',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  feedbackButton: {
    width: '100%',
  },
});

export default PlaceholderScreen;