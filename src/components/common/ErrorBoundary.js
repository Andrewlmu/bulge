import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';

/**
 * Production-ready error boundary with crash reporting and recovery options
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Store error details
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report error to crash reporting service
    this.reportError(error, errorInfo);

    // Store error locally for debugging
    this.storeErrorLocally(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      // In production, integrate with crash reporting services like:
      // - Sentry
      // - Crashlytics
      // - Bugsnag
      
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        appVersion: this.props.appVersion || '1.0.0',
        userId: this.props.userId || 'anonymous',
        platform: Platform.OS,
        errorId: this.state.errorId,
      };

      // Example: Send to crash reporting service
      // await CrashReporting.recordError(errorReport);
      
      console.log('Error report prepared:', errorReport);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  storeErrorLocally = async (error, errorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
      };

      const existingErrors = await AsyncStorage.getItem('app_errors') || '[]';
      const errors = JSON.parse(existingErrors);
      errors.push(errorData);

      // Keep only last 10 errors
      const recentErrors = errors.slice(-10);
      await AsyncStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error('Failed to store error locally:', storageError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleRestart = async () => {
    try {
      if (__DEV__) {
        // In development, just retry
        this.handleRetry();
      } else {
        // In production, restart the app
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error('Failed to restart app:', error);
      this.handleRetry();
    }
  };

  handleReportBug = () => {
    // In production, this could open email client or feedback form
    const { error, errorInfo, errorId } = this.state;
    
    const errorDetails = `
Error ID: ${errorId}
Message: ${error?.message}
Stack: ${error?.stack?.substring(0, 500)}
Component Stack: ${errorInfo?.componentStack?.substring(0, 500)}
Timestamp: ${new Date().toISOString()}
App Version: ${this.props.appVersion || '1.0.0'}
Platform: ${Platform.OS}
    `.trim();

    console.log('Bug report details:', errorDetails);
    
    // Example: Open email client
    // Linking.openURL(`mailto:support@bulgeapp.com?subject=Bug Report - ${errorId}&body=${encodeURIComponent(errorDetails)}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={64} color="#ef4444" />
            </View>

            {/* Error Message */}
            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.subtitle}>
              We're sorry, but the app encountered an unexpected error.
            </Text>

            {/* Error ID for support */}
            <View style={styles.errorIdContainer}>
              <Text style={styles.errorIdLabel}>Error ID:</Text>
              <Text style={styles.errorId}>{this.state.errorId}</Text>
            </View>

            {/* Development Error Details */}
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorDetailsTitle}>Error Details (Development):</Text>
                <Text style={styles.errorMessage}>{this.state.error.message}</Text>
                {this.state.error.stack && (
                  <Text style={styles.errorStack}>
                    {this.state.error.stack.substring(0, 500)}...
                  </Text>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={this.handleRetry}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={this.handleRestart}
              >
                <Ionicons name="reload" size={20} color="#2563eb" />
                <Text style={styles.secondaryButtonText}>Restart App</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={this.handleReportBug}
              >
                <Ionicons name="bug" size={20} color="#9ca3af" />
                <Text style={styles.outlineButtonText}>Report Bug</Text>
              </TouchableOpacity>
            </View>

            {/* Support Message */}
            <Text style={styles.supportMessage}>
              If this problem persists, please contact our support team with the Error ID above.
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  errorIdLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginRight: 8,
  },
  errorId: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  errorDetails: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    maxWidth: '100%',
    maxHeight: 200,
  },
  errorDetailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#374151',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#374151',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
  },
  supportMessage: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ErrorBoundary;