// Type definitions for the Bulge app
// Using JSDoc for type checking since we're in JavaScript

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} name - User's full name
 * @property {string} email - User's email address
 * @property {number} age - User's age
 * @property {string} height - User's height (e.g., "6'1\"")
 * @property {number} currentWeight - Current weight in pounds
 * @property {number} goalWeight - Target weight in pounds
 * @property {string} activityLevel - Activity level (sedentary, light, moderate, very, extremely)
 * @property {string[]} goals - Array of user goals
 * @property {string[]} healthFocus - Areas of health interest
 * @property {string} [profileImage] - URL to profile image
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last profile update
 */

/**
 * @typedef {Object} TodayStats
 * @property {number} steps - Steps taken today
 * @property {number} stepsTarget - Daily steps target
 * @property {number} calories - Calories consumed today
 * @property {number} caloriesTarget - Daily calorie target
 * @property {number} water - Water glasses consumed
 * @property {number} waterTarget - Daily water target
 * @property {number} sleep - Hours of sleep
 * @property {number} sleepTarget - Target sleep hours
 * @property {number} mood - Mood rating (1-5)
 * @property {number} stress - Stress level (1-5)
 * @property {number} energy - Energy level (1-5)
 */

/**
 * @typedef {Object} Nutrition
 * @property {MacroNutrient} calories - Calorie information
 * @property {MacroNutrient} protein - Protein information
 * @property {MacroNutrient} carbs - Carbohydrate information
 * @property {MacroNutrient} fat - Fat information
 */

/**
 * @typedef {Object} MacroNutrient
 * @property {number} consumed - Amount consumed today
 * @property {number} target - Daily target amount
 */

/**
 * @typedef {Object} Workout
 * @property {string} id - Unique workout identifier
 * @property {string} name - Workout name
 * @property {string} date - ISO date string
 * @property {number} duration - Duration in minutes
 * @property {number} exercises - Number of exercises completed
 * @property {number} calories - Calories burned
 * @property {boolean} completed - Whether workout was completed
 * @property {string} [type] - Workout type (strength, cardio, hiit, etc.)
 * @property {string} [difficulty] - Difficulty level
 * @property {Exercise[]} [exerciseList] - List of exercises in workout
 */

/**
 * @typedef {Object} Exercise
 * @property {string} id - Unique exercise identifier
 * @property {string} name - Exercise name
 * @property {number} sets - Number of sets
 * @property {string} reps - Rep range (e.g., "8-12")
 * @property {string} rest - Rest time between sets
 * @property {string} instructions - Exercise instructions
 * @property {string[]} targetMuscles - Target muscle groups
 * @property {string} [equipment] - Required equipment
 * @property {string} [videoUrl] - Exercise demonstration video
 * @property {number} [difficulty] - Exercise difficulty (1-5)
 */

/**
 * @typedef {Object} Meal
 * @property {string} id - Unique meal identifier
 * @property {string} name - Meal name
 * @property {string} time - Time consumed (e.g., "12:30 PM")
 * @property {string} type - Meal type (breakfast, lunch, dinner, snack)
 * @property {number} calories - Calorie content
 * @property {number} protein - Protein content in grams
 * @property {number} [carbs] - Carbohydrate content in grams
 * @property {number} [fat] - Fat content in grams
 * @property {string} date - ISO date string
 * @property {FoodItem[]} [foods] - Individual food items
 */

/**
 * @typedef {Object} FoodItem
 * @property {string} id - Unique food identifier
 * @property {string} name - Food name
 * @property {number} quantity - Quantity consumed
 * @property {string} unit - Unit of measurement
 * @property {number} calories - Calories per unit
 * @property {number} protein - Protein per unit
 * @property {number} carbs - Carbs per unit
 * @property {number} fat - Fat per unit
 */

/**
 * @typedef {Object} Goal
 * @property {string} id - Unique goal identifier
 * @property {string} title - Goal title
 * @property {number} target - Target value
 * @property {number} current - Current progress
 * @property {string} unit - Unit of measurement
 * @property {string} type - Goal type (weight, fitness, nutrition, etc.)
 * @property {string} deadline - Target completion date
 * @property {boolean} [isCompleted] - Whether goal is completed
 * @property {Date} createdAt - Goal creation date
 */

/**
 * @typedef {Object} HealthMetric
 * @property {string} id - Unique metric identifier
 * @property {string} type - Metric type (blood_pressure, heart_rate, etc.)
 * @property {number|string} value - Metric value
 * @property {string} unit - Unit of measurement
 * @property {string} date - ISO date string
 * @property {string} [notes] - Additional notes
 */

/**
 * @typedef {Object} WellnessEntry
 * @property {string} id - Unique entry identifier
 * @property {string} date - ISO date string
 * @property {number} mood - Mood rating (1-5)
 * @property {number} stress - Stress level (1-5)
 * @property {number} energy - Energy level (1-5)
 * @property {number} sleep - Sleep hours
 * @property {string} [notes] - Additional notes
 * @property {string[]} [activities] - Wellness activities performed
 */

/**
 * @typedef {Object} AppState
 * @property {User} user - User information
 * @property {TodayStats} todayStats - Today's statistics
 * @property {Nutrition} nutrition - Nutrition tracking
 * @property {Workout[]} workouts - Workout history
 * @property {Meal[]} meals - Meal history
 * @property {Goal[]} goals - User goals
 * @property {HealthMetric[]} healthMetrics - Health measurements
 * @property {WellnessEntry[]} wellnessEntries - Wellness tracking
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message
 */

/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether request was successful
 * @property {any} [data] - Response data
 * @property {string} [message] - Success/error message
 * @property {number} [statusCode] - HTTP status code
 */

/**
 * @typedef {Object} ChartData
 * @property {string[]} labels - Chart labels
 * @property {number[]} datasets - Chart data points
 * @property {string} [color] - Chart color
 * @property {string} [label] - Dataset label
 */

/**
 * @typedef {Object} NavigationProps
 * @property {function} navigate - Navigate to screen
 * @property {function} goBack - Go back to previous screen
 * @property {function} replace - Replace current screen
 * @property {Object} route - Current route information
 */

/**
 * @typedef {Object} FormValidation
 * @property {boolean} isValid - Whether form is valid
 * @property {Object} errors - Validation errors
 * @property {function} validate - Validation function
 * @property {function} reset - Reset form function
 */

export default {};

// Export commonly used enums and constants
export const ACTIVITY_LEVELS = {
  SEDENTARY: 'sedentary',
  LIGHT: 'light',
  MODERATE: 'moderate',
  VERY: 'very',
  EXTREMELY: 'extremely',
};

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
};

export const WORKOUT_TYPES = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  HIIT: 'hiit',
  FLEXIBILITY: 'flexibility',
  SPORTS: 'sports',
};

export const GOAL_TYPES = {
  WEIGHT: 'weight',
  FITNESS: 'fitness',
  NUTRITION: 'nutrition',
  WELLNESS: 'wellness',
  HEALTH: 'health',
};

export const HEALTH_FOCUS_AREAS = {
  FITNESS: 'fitness',
  NUTRITION: 'nutrition',
  MENTAL: 'mental',
  SEXUAL: 'sexual',
  SLEEP: 'sleep',
  STRESS: 'stress',
};