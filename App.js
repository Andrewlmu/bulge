import React from 'react';
import { StatusBar } from 'expo-status-bar';
import EnhancedAppNavigator from './src/navigation/EnhancedAppNavigator';
import { AppProvider } from './src/context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <EnhancedAppNavigator />
      <StatusBar style="light" backgroundColor="#111827" />
    </AppProvider>
  );
}
