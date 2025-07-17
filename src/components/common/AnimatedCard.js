import React, { useEffect, useRef } from 'react';
import {
  Animated,
  View,
  StyleSheet,
  PanGestureHandler,
  State,
} from 'react-native';
import { Haptics } from 'expo-haptics';

/**
 * Animated card component with entrance animations and gesture support
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.animation - Animation type (slideUp, fadeIn, scaleIn, slideInLeft, slideInRight)
 * @param {number} props.delay - Animation delay in milliseconds
 * @param {number} props.duration - Animation duration in milliseconds
 * @param {boolean} props.swipeable - Enable swipe gestures
 * @param {Function} props.onSwipeLeft - Swipe left handler
 * @param {Function} props.onSwipeRight - Swipe right handler
 * @param {Object} props.style - Additional styles
 * @param {boolean} props.pressable - Enable press animation
 * @param {Function} props.onPress - Press handler
 */
const AnimatedCard = ({
  children,
  animation = 'slideUp',
  delay = 0,
  duration = 600,
  swipeable = false,
  onSwipeLeft,
  onSwipeRight,
  style,
  pressable = false,
  onPress,
  ...props
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const gestureState = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationConfig = {
      toValue: 1,
      duration,
      useNativeDriver: true,
    };

    const animationSequence = delay > 0 
      ? Animated.sequence([
          Animated.delay(delay),
          Animated.spring(animatedValue, animationConfig)
        ])
      : Animated.spring(animatedValue, animationConfig);

    animationSequence.start();
  }, [delay, duration]);

  const getAnimationStyle = () => {
    switch (animation) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
        };
      
      case 'scaleIn':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      
      case 'slideInLeft':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      
      case 'slideInRight':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      
      case 'slideUp':
      default:
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        };
    }
  };

  const handlePressIn = () => {
    if (!pressable) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.spring(scaleValue, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!pressable) return;
    
    Animated.spring(scaleValue, {
      toValue: 1,
      duration: 150,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (!pressable || !onPress) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;
      
      if (translationX > 100 && onSwipeRight) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSwipeRight();
      } else if (translationX < -100 && onSwipeLeft) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onSwipeLeft();
      }
      
      // Reset position
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        getAnimationStyle(),
        {
          transform: [
            { scale: scaleValue },
            ...(getAnimationStyle().transform || []),
            ...(swipeable ? [{ translateX }] : []),
          ],
        },
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
      {...props}
    >
      {children}
    </Animated.View>
  );

  if (swipeable) {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        {cardContent}
      </PanGestureHandler>
    );
  }

  if (pressable) {
    return (
      <Animated.View
        style={[
          styles.card,
          getAnimationStyle(),
          {
            transform: [
              { scale: scaleValue },
              ...(getAnimationStyle().transform || []),
            ],
          },
          style,
        ]}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
        {...props}
      >
        {children}
      </Animated.View>
    );
  }

  return cardContent;
};

/**
 * Staggered list animation component
 * @param {Object} props - Component props
 * @param {React.ReactNode[]} props.children - Array of child components
 * @param {number} props.staggerDelay - Delay between each item animation
 * @param {string} props.animation - Animation type for each item
 */
const StaggeredList = ({ 
  children, 
  staggerDelay = 100, 
  animation = 'slideUp',
  ...props 
}) => {
  return (
    <View {...props}>
      {React.Children.map(children, (child, index) => (
        <AnimatedCard
          key={index}
          animation={animation}
          delay={index * staggerDelay}
        >
          {child}
        </AnimatedCard>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});

export { AnimatedCard, StaggeredList };
export default AnimatedCard;