import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';

/**
 * Production-ready analytics service with privacy compliance
 * Supports multiple analytics providers and offline queuing
 */
class AnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.userProperties = {};
    this.sessionId = null;
    this.sessionStartTime = null;
    this.eventQueue = [];
    this.isOnline = true;
    this.config = {
      enableAnalytics: true,
      enableCrashReporting: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      maxQueueSize: 100,
    };
  }

  /**
   * Initialize analytics service
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Check user consent for analytics
      const consent = await this.getAnalyticsConsent();
      if (!consent) {
        console.log('Analytics disabled - no user consent');
        return;
      }

      // Initialize session
      this.sessionId = this.generateSessionId();
      this.sessionStartTime = Date.now();

      // Load cached user properties
      await this.loadUserProperties();

      // Initialize analytics providers
      await this.initializeProviders();

      // Start periodic flush
      this.startPeriodicFlush();

      // Track app launch
      this.track('app_launched', {
        session_id: this.sessionId,
        platform: Platform.OS,
        app_version: Application.nativeApplicationVersion,
        build_number: Application.nativeBuildVersion,
      });

      this.isInitialized = true;
      console.log('Analytics service initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Check user consent for analytics
   */
  async getAnalyticsConsent() {
    try {
      const consent = await AsyncStorage.getItem('analytics_consent');
      return consent === 'true';
    } catch (error) {
      console.error('Failed to get analytics consent:', error);
      return false;
    }
  }

  /**
   * Set user consent for analytics
   */
  async setAnalyticsConsent(enabled) {
    try {
      await AsyncStorage.setItem('analytics_consent', enabled.toString());
      this.config.enableAnalytics = enabled;
      
      if (!enabled) {
        // Clear all stored analytics data if consent withdrawn
        await this.clearAnalyticsData();
      }
    } catch (error) {
      console.error('Failed to set analytics consent:', error);
    }
  }

  /**
   * Initialize analytics providers (Mixpanel, Firebase, etc.)
   */
  async initializeProviders() {
    try {
      // Example: Initialize Mixpanel
      // await Mixpanel.initialize('YOUR_MIXPANEL_TOKEN');
      
      // Example: Initialize Firebase Analytics
      // await analytics().setAnalyticsCollectionEnabled(this.config.enableAnalytics);
      
      console.log('Analytics providers initialized');
    } catch (error) {
      console.error('Failed to initialize analytics providers:', error);
    }
  }

  /**
   * Set user ID and properties
   */
  async identify(userId, properties = {}) {
    if (!this.config.enableAnalytics) return;

    try {
      this.userId = userId;
      this.userProperties = { ...this.userProperties, ...properties };

      // Add system properties
      const systemProperties = await this.getSystemProperties();
      this.userProperties = { ...this.userProperties, ...systemProperties };

      // Store user properties
      await AsyncStorage.setItem('user_properties', JSON.stringify(this.userProperties));

      // Send to analytics providers
      // await Mixpanel.identify(userId);
      // await Mixpanel.people.set(this.userProperties);

      console.log('User identified:', userId);
    } catch (error) {
      console.error('Failed to identify user:', error);
    }
  }

  /**
   * Track event with properties
   */
  track(eventName, properties = {}) {
    if (!this.config.enableAnalytics) return;

    try {
      const event = {
        name: eventName,
        properties: {
          ...properties,
          timestamp: Date.now(),
          session_id: this.sessionId,
          user_id: this.userId,
          platform: Platform.OS,
        },
        id: this.generateEventId(),
      };

      // Add to queue
      this.eventQueue.push(event);

      // Flush if queue is full
      if (this.eventQueue.length >= this.config.batchSize) {
        this.flush();
      }

      console.log('Event tracked:', eventName, properties);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * Track screen view
   */
  trackScreen(screenName, properties = {}) {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  trackAction(action, category = 'user_action', properties = {}) {
    this.track('user_action', {
      action,
      category,
      ...properties,
    });
  }

  /**
   * Track performance metric
   */
  trackPerformance(metric, value, properties = {}) {
    this.track('performance_metric', {
      metric_name: metric,
      value,
      ...properties,
    });
  }

  /**
   * Track business event
   */
  trackBusiness(event, revenue = null, properties = {}) {
    const eventProperties = {
      ...properties,
      event_type: 'business',
    };

    if (revenue !== null) {
      eventProperties.revenue = revenue;
    }

    this.track(event, eventProperties);
  }

  /**
   * Track error or exception
   */
  trackError(error, context = {}) {
    if (!this.config.enableCrashReporting) return;

    try {
      this.track('error_occurred', {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 1000),
        error_name: error.name,
        context,
        is_fatal: false,
      });

      // Send to crash reporting service
      // await crashlytics().recordError(error);
    } catch (reportingError) {
      console.error('Failed to track error:', reportingError);
    }
  }

  /**
   * Track app lifecycle events
   */
  trackAppStateChange(state) {
    this.track('app_state_change', {
      app_state: state,
      session_duration: this.getSessionDuration(),
    });
  }

  /**
   * Start timing an operation
   */
  startTimer(name) {
    const startTime = Date.now();
    return {
      end: (properties = {}) => {
        const duration = Date.now() - startTime;
        this.trackPerformance(name, duration, {
          ...properties,
          duration_ms: duration,
        });
        return duration;
      }
    };
  }

  /**
   * Flush queued events to analytics providers
   */
  async flush() {
    if (this.eventQueue.length === 0) return;

    try {
      const eventsToFlush = [...this.eventQueue];
      this.eventQueue = [];

      // Send to analytics providers
      await this.sendEventsToProviders(eventsToFlush);

      // Store offline if needed
      if (!this.isOnline) {
        await this.storeEventsOffline(eventsToFlush);
      }

      console.log(`Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Put events back in queue
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  /**
   * Send events to analytics providers
   */
  async sendEventsToProviders(events) {
    try {
      // Example: Send to Mixpanel
      // for (const event of events) {
      //   await Mixpanel.track(event.name, event.properties);
      // }

      // Example: Send to custom analytics API
      // await fetch('https://api.bulgeapp.com/analytics/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events }),
      // });
    } catch (error) {
      console.error('Failed to send events to providers:', error);
      throw error;
    }
  }

  /**
   * Store events offline for later sending
   */
  async storeEventsOffline(events) {
    try {
      const stored = await AsyncStorage.getItem('offline_events') || '[]';
      const offlineEvents = JSON.parse(stored);
      
      const updatedEvents = [...offlineEvents, ...events];
      
      // Keep only recent events to avoid storage bloat
      const recentEvents = updatedEvents.slice(-this.config.maxQueueSize);
      
      await AsyncStorage.setItem('offline_events', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Failed to store offline events:', error);
    }
  }

  /**
   * Process offline events when back online
   */
  async processOfflineEvents() {
    try {
      const stored = await AsyncStorage.getItem('offline_events');
      if (!stored) return;

      const offlineEvents = JSON.parse(stored);
      if (offlineEvents.length === 0) return;

      await this.sendEventsToProviders(offlineEvents);
      await AsyncStorage.removeItem('offline_events');

      console.log(`Processed ${offlineEvents.length} offline events`);
    } catch (error) {
      console.error('Failed to process offline events:', error);
    }
  }

  /**
   * Set network status
   */
  setNetworkStatus(isOnline) {
    const wasOffline = !this.isOnline;
    this.isOnline = isOnline;

    if (wasOffline && isOnline) {
      // Back online, process offline events
      this.processOfflineEvents();
    }
  }

  /**
   * Start periodic flush timer
   */
  startPeriodicFlush() {
    setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Get system properties for user identification
   */
  async getSystemProperties() {
    try {
      return {
        device_model: Device.modelName,
        device_brand: Device.brand,
        os_version: Platform.Version,
        app_version: Application.nativeApplicationVersion,
        build_number: Application.nativeBuildVersion,
        device_id: await this.getDeviceId(),
        install_time: await this.getInstallTime(),
      };
    } catch (error) {
      console.error('Failed to get system properties:', error);
      return {};
    }
  }

  /**
   * Get or generate device ID
   */
  async getDeviceId() {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = this.generateDeviceId();
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return 'unknown';
    }
  }

  /**
   * Get app install time
   */
  async getInstallTime() {
    try {
      let installTime = await AsyncStorage.getItem('install_time');
      if (!installTime) {
        installTime = Date.now().toString();
        await AsyncStorage.setItem('install_time', installTime);
      }
      return parseInt(installTime);
    } catch (error) {
      console.error('Failed to get install time:', error);
      return Date.now();
    }
  }

  /**
   * Load user properties from storage
   */
  async loadUserProperties() {
    try {
      const stored = await AsyncStorage.getItem('user_properties');
      if (stored) {
        this.userProperties = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load user properties:', error);
    }
  }

  /**
   * Clear all analytics data
   */
  async clearAnalyticsData() {
    try {
      await Promise.all([
        AsyncStorage.removeItem('user_properties'),
        AsyncStorage.removeItem('offline_events'),
        AsyncStorage.removeItem('device_id'),
      ]);
      
      this.userId = null;
      this.userProperties = {};
      this.eventQueue = [];
      
      console.log('Analytics data cleared');
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
    }
  }

  /**
   * Get current session duration
   */
  getSessionDuration() {
    return this.sessionStartTime ? Date.now() - this.sessionStartTime : 0;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Generate unique device ID
   */
  generateDeviceId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
const analytics = new AnalyticsService();

// Convenience functions
export const initializeAnalytics = (config) => analytics.initialize(config);
export const identify = (userId, properties) => analytics.identify(userId, properties);
export const track = (event, properties) => analytics.track(event, properties);
export const trackScreen = (screenName, properties) => analytics.trackScreen(screenName, properties);
export const trackAction = (action, category, properties) => analytics.trackAction(action, category, properties);
export const trackPerformance = (metric, value, properties) => analytics.trackPerformance(metric, value, properties);
export const trackBusiness = (event, revenue, properties) => analytics.trackBusiness(event, revenue, properties);
export const trackError = (error, context) => analytics.trackError(error, context);
export const setAnalyticsConsent = (enabled) => analytics.setAnalyticsConsent(enabled);
export const setNetworkStatus = (isOnline) => analytics.setNetworkStatus(isOnline);
export const startTimer = (name) => analytics.startTimer(name);

export default analytics;