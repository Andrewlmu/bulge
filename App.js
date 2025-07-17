import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import EnhancedAppNavigator from './src/navigation/EnhancedAppNavigator';
import { AppProvider } from './src/context/AppContext';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { initializeAnalytics } from './src/services/analytics';
import { initializeSecurity } from './src/services/security';
import { initializeNotifications } from './src/services/notifications';

function AppContent() {
  useEffect(() => {
    // Initialize production services
    const initializeServices = async () => {
      try {
        // Initialize core services
        await initializeSecurity();
        await initializeAnalytics({
          enableAnalytics: !__DEV__, // Disable in development
          enableCrashReporting: !__DEV__,
        });
        await initializeNotifications();
        
        console.log('Production services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize production services:', error);
      }
    };

    initializeServices();
  }, []);

  return (
    <AppProvider>
      <EnhancedAppNavigator />
      <StatusBar style="light" backgroundColor="#111827" />
    </AppProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary appVersion="1.0.0">
      <AppContent />
    </ErrorBoundary>
  );
}
