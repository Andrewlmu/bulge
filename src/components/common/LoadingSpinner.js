import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Animated loading spinner component with multiple variants
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (small, medium, large)
 * @param {string} props.color - Spinner color
 * @param {string} props.text - Optional loading text
 * @param {string} props.variant - Spinner variant (dots, pulse, ring, bars)
 * @param {boolean} props.overlay - Show as full screen overlay
 * @param {Object} props.style - Additional styles
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#2563eb', 
  text = '', 
  variant = 'ring',
  overlay = false,
  style 
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const dotValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const sizes = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const spinSize = sizes[size];

  useEffect(() => {
    if (variant === 'ring') {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => spinAnimation.stop();
    } else if (variant === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      return () => pulseAnimation.stop();
    } else if (variant === 'dots') {
      const dotAnimations = dotValues.map((dotValue, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 200),
            Animated.timing(dotValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(dotValue, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        )
      );

      Animated.stagger(200, dotAnimations).start();

      return () => dotAnimations.forEach(anim => anim.stop());
    }
  }, [variant]);

  const renderSpinner = () => {
    switch (variant) {
      case 'ring':
        return (
          <Animated.View
            style={[
              styles.ring,
              {
                width: spinSize,
                height: spinSize,
                borderColor: `${color}20`,
                borderTopColor: color,
                transform: [
                  {
                    rotate: spinValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        );

      case 'pulse':
        return (
          <Animated.View
            style={[
              styles.pulse,
              {
                width: spinSize,
                height: spinSize,
                backgroundColor: color,
                transform: [{ scale: pulseValue }],
              },
            ]}
          />
        );

      case 'dots':
        return (
          <View style={styles.dotsContainer}>
            {dotValues.map((dotValue, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: color,
                    opacity: dotValue,
                    transform: [
                      {
                        scale: dotValue.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        );

      case 'bars':
        return (
          <View style={styles.barsContainer}>
            {[0, 1, 2, 3].map((index) => (
              <Animated.View
                key={index}
                style={[
                  styles.bar,
                  {
                    backgroundColor: color,
                    height: spinSize * 0.8,
                    animationDelay: `${index * 0.1}s`,
                  },
                ]}
              />
            ))}
          </View>
        );

      default:
        return (
          <Ionicons 
            name="refresh" 
            size={spinSize} 
            color={color}
            style={{
              transform: [
                {
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          />
        );
    }
  };

  const containerStyle = overlay 
    ? [styles.overlay, style]
    : [styles.container, style];

  return (
    <View style={containerStyle}>
      <View style={styles.spinnerWrapper}>
        {renderSpinner()}
        {text && (
          <Text style={[styles.text, { color }]}>
            {text}
          </Text>
        )}
      </View>
    </View>
  );
};

const SkeletonLoader = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4,
  style 
}) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity: shimmerValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.7],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  spinnerWrapper: {
    alignItems: 'center',
  },
  ring: {
    borderWidth: 3,
    borderRadius: 100,
  },
  pulse: {
    borderRadius: 100,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    width: 4,
    marginHorizontal: 1,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  skeleton: {
    backgroundColor: '#374151',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#6b7280',
  },
});

export { LoadingSpinner, SkeletonLoader };
export default LoadingSpinner;