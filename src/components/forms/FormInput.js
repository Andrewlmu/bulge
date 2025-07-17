import React, { useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Enhanced form input component with validation, animations, and accessibility
 * @param {Object} props - Component props
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.value - Input value
 * @param {function} props.onChangeText - Text change handler
 * @param {function} props.onBlur - Blur event handler
 * @param {function} props.onFocus - Focus event handler
 * @param {string} props.error - Error message
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.keyboardType - Keyboard type
 * @param {boolean} props.secureTextEntry - Whether to hide text
 * @param {string} props.autoCapitalize - Auto capitalization setting
 * @param {boolean} props.autoCorrect - Whether to enable auto-correct
 * @param {string} props.autoComplete - Auto-complete setting
 * @param {number} props.maxLength - Maximum input length
 * @param {boolean} props.multiline - Whether input supports multiple lines
 * @param {number} props.numberOfLines - Number of lines for multiline input
 * @param {string} props.leftIcon - Left icon name
 * @param {string} props.rightIcon - Right icon name
 * @param {function} props.onRightIconPress - Right icon press handler
 * @param {string} props.helperText - Helper text below input
 * @param {Object} props.style - Container style
 * @param {Object} props.inputStyle - Input style
 * @param {string} props.variant - Input variant (default, outlined, filled)
 */
const FormInput = forwardRef(({
  label,
  placeholder,
  value = '',
  onChangeText,
  onBlur,
  onFocus,
  error,
  required = false,
  disabled = false,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoComplete = 'off',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightIcon,
  onRightIconPress,
  helperText,
  style = {},
  inputStyle = {},
  variant = 'default',
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedLabel = new Animated.Value(value ? 1 : 0);

  const handleFocus = (e) => {
    setIsFocused(true);
    Animated.timing(animatedLabel, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedLabel, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    if (onBlur) onBlur(e);
  };

  const handleTextChange = (text) => {
    if (!value && text) {
      Animated.timing(animatedLabel, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else if (value && !text) {
      Animated.timing(animatedLabel, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    if (onChangeText) onChangeText(text);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (variant === 'outlined') {
      baseStyle.push(styles.outlined);
      if (isFocused) baseStyle.push(styles.outlinedFocused);
      if (error) baseStyle.push(styles.outlinedError);
    } else if (variant === 'filled') {
      baseStyle.push(styles.filled);
      if (isFocused) baseStyle.push(styles.filledFocused);
      if (error) baseStyle.push(styles.filledError);
    } else {
      baseStyle.push(styles.default);
      if (isFocused) baseStyle.push(styles.defaultFocused);
      if (error) baseStyle.push(styles.defaultError);
    }
    
    if (disabled) baseStyle.push(styles.disabled);
    
    return [...baseStyle, style];
  };

  const getInputStyle = () => {
    const baseStyle = [styles.input];
    
    if (leftIcon) baseStyle.push(styles.inputWithLeftIcon);
    if (rightIcon || secureTextEntry) baseStyle.push(styles.inputWithRightIcon);
    if (multiline) baseStyle.push(styles.multilineInput);
    if (disabled) baseStyle.push(styles.inputDisabled);
    
    return [...baseStyle, inputStyle];
  };

  const labelStyle = {
    position: 'absolute',
    left: leftIcon ? 44 : 16,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 4],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error ? '#ef4444' : isFocused ? '#2563eb' : '#9ca3af',
    backgroundColor: variant === 'outlined' ? '#1f2937' : 'transparent',
    paddingHorizontal: variant === 'outlined' ? 4 : 0,
    zIndex: 1,
  };

  return (
    <View style={styles.wrapper}>
      {/* Floating Label */}
      {label && (
        <Animated.Text style={labelStyle}>
          {label}{required && ' *'}
        </Animated.Text>
      )}
      
      <View style={getContainerStyle()}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={error ? '#ef4444' : isFocused ? '#2563eb' : '#6b7280'} 
            />
          </View>
        )}
        
        {/* Text Input */}
        <TextInput
          ref={ref}
          style={getInputStyle()}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={label ? '' : placeholder}
          placeholderTextColor="#6b7280"
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoComplete={autoComplete}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          accessible={true}
          accessibilityLabel={label || placeholder}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled,
            selected: isFocused,
          }}
        />
        
        {/* Right Icon or Password Toggle */}
        {(rightIcon || secureTextEntry) && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={secureTextEntry ? togglePasswordVisibility : onRightIconPress}
            disabled={disabled}
            accessible={true}
            accessibilityLabel={
              secureTextEntry 
                ? (showPassword ? 'Hide password' : 'Show password')
                : 'Action button'
            }
          >
            <Ionicons
              name={
                secureTextEntry
                  ? (showPassword ? 'eye-off-outline' : 'eye-outline')
                  : rightIcon
              }
              size={20}
              color={error ? '#ef4444' : isFocused ? '#2563eb' : '#6b7280'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Character Counter */}
      {maxLength && (
        <Text style={styles.characterCounter}>
          {value.length}/{maxLength}
        </Text>
      )}
      
      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 56,
    position: 'relative',
  },
  
  // Variants
  default: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  defaultFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#374151',
  },
  defaultError: {
    borderColor: '#ef4444',
  },
  
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4b5563',
  },
  outlinedFocused: {
    borderColor: '#2563eb',
  },
  outlinedError: {
    borderColor: '#ef4444',
  },
  
  filled: {
    backgroundColor: '#374151',
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#4b5563',
    borderRadius: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  filledFocused: {
    borderBottomColor: '#2563eb',
  },
  filledError: {
    borderBottomColor: '#ef4444',
  },
  
  disabled: {
    opacity: 0.6,
  },
  
  // Input styles
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    textAlignVertical: 'top',
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  multilineInput: {
    minHeight: 80,
    paddingTop: 24,
    paddingBottom: 12,
  },
  inputDisabled: {
    color: '#9ca3af',
  },
  
  // Icon containers
  leftIconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rightIconContainer: {
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
  },
  
  // Helper elements
  characterCounter: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginLeft: 6,
    flex: 1,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
  },
});

FormInput.displayName = 'FormInput';

export default FormInput;