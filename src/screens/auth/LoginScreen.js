import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import FormInput from '../../components/forms/FormInput';
import { loginSchema } from '../../utils/validation';
import ApiService from '../../services/api';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data) => {
    setLoading(true);
    
    try {
      const response = await ApiService.auth.login(data.email, data.password);
      
      if (response.success) {
        // Store auth tokens if they exist
        if (response.data.accessToken) {
          await AsyncStorage.setItem('auth_token', response.data.accessToken);
        }
        if (response.data.refreshToken) {
          await AsyncStorage.setItem('refresh_token', response.data.refreshToken);
        }
        
        // Navigate to main app
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.statusCode === 401) {
        setError('password', { 
          type: 'manual', 
          message: 'Invalid email or password' 
        });
      } else if (error.statusCode === 422) {
        // Handle validation errors from server
        if (error.data?.errors) {
          Object.keys(error.data.errors).forEach(field => {
            setError(field, {
              type: 'manual',
              message: error.data.errors[field][0]
            });
          });
        }
      } else {
        Alert.alert(
          'Connection Error', 
          'Unable to connect to server. Please check your internet connection and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleDemoLogin = () => {
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.header}>
          <Text style={styles.logo}>💪</Text>
          <Text style={styles.title}>Welcome to Bulge</Text>
          <Text style={styles.subtitle}>
            Your complete men's health companion
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                leftIcon="mail-outline"
                variant="outlined"
                required
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormInput
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                leftIcon="lock-closed-outline"
                variant="outlined"
                required
              />
            )}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSubmit(handleLogin)}
            loading={loading}
            disabled={!isValid || loading}
            style={styles.loginButton}
          />
        </Card>

        {/* Sign Up */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Login */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={handleDemoLogin}
        >
          <Text style={styles.demoButtonText}>Continue as Demo User</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  loginButton: {
    marginTop: 8,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  signUpLink: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  demoButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  demoButtonText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;