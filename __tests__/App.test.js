import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-token' })),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Import components after mocking
import App from '../App';
import LoginScreen from '../src/screens/auth/LoginScreen';
import DashboardScreen from '../src/screens/main/DashboardScreen';
import { AuthProvider } from '../src/contexts/AuthContext';

// Test wrapper component
const TestWrapper = ({ children }) => (
  <NavigationContainer>
    <AuthProvider>
      {children}
    </AuthProvider>
  </NavigationContainer>
);

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
  });

  describe('App Launch', () => {
    test('renders loading screen initially', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      render(<App />);
      
      expect(screen.getByTestId('loading-screen')).toBeTruthy();
    });

    test('navigates to login when no token exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('login-screen')).toBeTruthy();
      });
    });

    test('navigates to dashboard when valid token exists', async () => {
      AsyncStorage.getItem.mockResolvedValue(JSON.stringify({
        token: 'valid-token',
        expiresAt: Date.now() + 3600000, // 1 hour from now
      }));
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-screen')).toBeTruthy();
      });
    });
  });

  describe('Authentication Flow', () => {
    test('successful login redirects to dashboard', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      // Fill in login form
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
      
      // Submit form
      fireEvent.press(getByTestId('login-button'));
      
      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'auth_token',
          expect.stringContaining('token')
        );
      });
    });

    test('invalid credentials show error message', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      fireEvent.changeText(getByPlaceholderText('Email'), 'invalid@example.com');
      fireEvent.changeText(getByPlaceholderText('Password'), 'wrong');
      fireEvent.press(getByTestId('login-button'));
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeTruthy();
      });
    });

    test('logout clears stored token', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      fireEvent.press(getByTestId('logout-button'));
      
      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
      });
    });
  });

  describe('Dashboard Functionality', () => {
    test('displays user stats correctly', async () => {
      const mockUserStats = {
        level: 5,
        points: 1250,
        streak: 14,
        weeklyWorkouts: 4,
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockUserStats));
      
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('user-level')).toHaveTextContent('5');
        expect(getByTestId('user-points')).toHaveTextContent('1,250');
        expect(getByTestId('user-streak')).toHaveTextContent('14');
      });
    });

    test('workout tracking updates stats', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      fireEvent.press(getByTestId('log-workout-button'));
      
      await waitFor(() => {
        expect(getByTestId('workout-form')).toBeTruthy();
      });

      // Fill workout form
      fireEvent.changeText(getByTestId('workout-type-input'), 'Push Day');
      fireEvent.changeText(getByTestId('workout-duration-input'), '45');
      fireEvent.press(getByTestId('save-workout-button'));

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'user_workouts',
          expect.stringContaining('Push Day')
        );
      });
    });
  });

  describe('Performance Tests', () => {
    test('dashboard loads within 2 seconds', async () => {
      const startTime = Date.now();
      
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-content')).toBeTruthy();
      });
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    test('form validation provides immediate feedback', async () => {
      const { getByTestId, getByPlaceholderText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Email');
      
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent(emailInput, 'blur');
      
      await waitFor(() => {
        expect(screen.getByText(/valid email/i)).toBeTruthy();
      }, { timeout: 100 });
    });
  });

  describe('Accessibility', () => {
    test('critical buttons have accessibility labels', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const loginButton = getByTestId('login-button');
      expect(loginButton.props.accessibilityLabel).toBeTruthy();
      expect(loginButton.props.accessibilityRole).toBe('button');
    });

    test('form inputs have proper accessibility hints', () => {
      const { getByPlaceholderText } = render(
        <TestWrapper>
          <LoginScreen />
        </TestWrapper>
      );

      const emailInput = getByPlaceholderText('Email');
      expect(emailInput.props.accessibilityHint).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    test('network error shows retry option', async () => {
      // Mock network failure
      global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
      
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeTruthy();
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    test('error boundary catches component crashes', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const { getByTestId } = render(
        <TestWrapper>
          <ThrowError />
        </TestWrapper>
      );

      expect(getByTestId('error-boundary-fallback')).toBeTruthy();
    });
  });

  describe('Offline Functionality', () => {
    test('cached data displays when offline', async () => {
      const cachedWorkouts = [
        { id: 1, type: 'Push Day', date: '2024-01-15' },
        { id: 2, type: 'Pull Day', date: '2024-01-14' },
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cachedWorkouts));
      
      // Simulate offline
      global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
      
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('workout-list')).toBeTruthy();
        expect(screen.getByText('Push Day')).toBeTruthy();
      });
    });

    test('offline indicator appears when network unavailable', async () => {
      // Mock network info
      jest.doMock('@react-native-community/netinfo', () => ({
        useNetInfo: () => ({ isConnected: false }),
      }));

      const { getByTestId } = render(<App />);

      await waitFor(() => {
        expect(getByTestId('offline-indicator')).toBeTruthy();
      });
    });
  });

  describe('Data Persistence', () => {
    test('user preferences persist across app restarts', async () => {
      const preferences = {
        notifications: true,
        darkMode: false,
        units: 'metric',
      };

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(preferences));
      
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('notifications-toggle')).toHaveProp('value', true);
        expect(getByTestId('dark-mode-toggle')).toHaveProp('value', false);
      });
    });

    test('workout data syncs to storage correctly', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );

      const workoutData = {
        type: 'Leg Day',
        duration: 60,
        exercises: [
          { name: 'Squats', sets: 3, reps: 12 },
          { name: 'Deadlifts', sets: 3, reps: 10 },
        ],
      };

      fireEvent.press(getByTestId('log-workout-button'));
      
      // Simulate form completion
      fireEvent(getByTestId('workout-form'), 'onSubmit', workoutData);

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          'user_workouts',
          expect.stringContaining('Leg Day')
        );
      });
    });
  });
});