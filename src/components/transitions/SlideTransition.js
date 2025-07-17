import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Slide transition component for smooth screen transitions
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {boolean} props.visible - Controls animation visibility
 * @param {string} props.direction - Slide direction (up, down, left, right)
 * @param {number} props.duration - Animation duration in milliseconds
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 * @param {Object} props.style - Additional styles
 */
const SlideTransition = ({
  children,
  visible = true,
  direction = 'up',
  duration = 300,
  onAnimationComplete,
  style,
  ...props
}) => {
  const translateValue = useRef(new Animated.Value(visible ? 0 : getInitialValue(direction))).current;
  const opacityValue = useRef(new Animated.Value(visible ? 1 : 0)).current;

  function getInitialValue(dir) {
    switch (dir) {
      case 'up':
        return screenHeight;
      case 'down':
        return -screenHeight;
      case 'left':
        return screenWidth;
      case 'right':
        return -screenWidth;
      default:
        return screenHeight;
    }
  }

  function getTransformProperty(dir) {
    switch (dir) {
      case 'up':
      case 'down':
        return 'translateY';
      case 'left':
      case 'right':
        return 'translateX';
      default:
        return 'translateY';
    }
  }

  useEffect(() => {
    const toValue = visible ? 0 : getInitialValue(direction);
    const opacityToValue = visible ? 1 : 0;

    Animated.parallel([
      Animated.timing(translateValue, {
        toValue,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: opacityToValue,
        duration: duration * 0.8,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [visible, direction, duration]);

  const transformProperty = getTransformProperty(direction);
  const transformStyle = {
    [transformProperty]: translateValue,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [transformStyle],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Fade transition component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {boolean} props.visible - Controls animation visibility
 * @param {number} props.duration - Animation duration in milliseconds
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 */
const FadeTransition = ({
  children,
  visible = true,
  duration = 300,
  onAnimationComplete,
  style,
  ...props
}) => {
  const opacityValue = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    const toValue = visible ? 1 : 0;

    Animated.timing(opacityValue, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [visible, duration]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityValue,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Scale transition component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Content to animate
 * @param {boolean} props.visible - Controls animation visibility
 * @param {number} props.duration - Animation duration in milliseconds
 * @param {Function} props.onAnimationComplete - Callback when animation completes
 */
const ScaleTransition = ({
  children,
  visible = true,
  duration = 300,
  onAnimationComplete,
  style,
  ...props
}) => {
  const scaleValue = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const opacityValue = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    const scaleToValue = visible ? 1 : 0;
    const opacityToValue = visible ? 1 : 0;

    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: scaleToValue,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: opacityToValue,
        duration: duration * 0.8,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished && onAnimationComplete) {
        onAnimationComplete();
      }
    });
  }, [visible, duration]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

/**
 * Modal transition component with backdrop
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Modal content
 * @param {boolean} props.visible - Controls modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {number} props.duration - Animation duration in milliseconds
 */
const ModalTransition = ({
  children,
  visible = false,
  onClose,
  duration = 300,
  ...props
}) => {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.8,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration]);

  if (!visible && modalOpacity._value === 0) {
    return null;
  }

  return (
    <View style={styles.modalContainer} {...props}>
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
        onTouchEnd={onClose}
      />
      <Animated.View
        style={[
          styles.modalContent,
          {
            opacity: modalOpacity,
            transform: [{ scale: modalScale }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: screenWidth - 40,
    maxHeight: screenHeight - 100,
  },
});

export {
  SlideTransition,
  FadeTransition,
  ScaleTransition,
  ModalTransition,
};

export default SlideTransition;