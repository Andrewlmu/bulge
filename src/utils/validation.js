import * as yup from 'yup';

// Common validation patterns
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

// Authentication validation schemas
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export const signUpSchema = yup.object().shape({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

export const resetPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Please enter a valid email address'),
});

// Profile validation schemas
export const profileSchema = yup.object().shape({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .matches(emailRegex, 'Please enter a valid email address'),
  age: yup
    .number()
    .required('Age is required')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age')
    .integer('Age must be a whole number'),
  height: yup
    .string()
    .required('Height is required')
    .matches(/^\d+'\d+"?$/, 'Height must be in format like 5\'10"'),
  currentWeight: yup
    .number()
    .required('Current weight is required')
    .min(50, 'Weight must be at least 50 lbs')
    .max(1000, 'Please enter a valid weight')
    .positive('Weight must be positive'),
  goalWeight: yup
    .number()
    .required('Goal weight is required')
    .min(50, 'Weight must be at least 50 lbs')
    .max(1000, 'Please enter a valid weight')
    .positive('Weight must be positive'),
  phone: yup
    .string()
    .matches(phoneRegex, 'Please enter a valid phone number')
    .nullable(),
});

// Onboarding validation schemas
export const onboardingStep1Schema = yup.object().shape({
  goals: yup
    .array()
    .of(yup.string())
    .min(1, 'Please select at least one goal')
    .required('Please select your goals'),
});

export const onboardingStep2Schema = yup.object().shape({
  activityLevel: yup
    .string()
    .required('Please select your activity level')
    .oneOf(['sedentary', 'light', 'moderate', 'very', 'extremely']),
});

export const onboardingStep3Schema = yup.object().shape({
  healthFocus: yup
    .array()
    .of(yup.string())
    .min(1, 'Please select at least one area of interest')
    .required('Please select your areas of interest'),
});

export const onboardingStep4Schema = yup.object().shape({
  age: yup
    .number()
    .required('Age is required')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age')
    .integer('Age must be a whole number'),
  height: yup
    .string()
    .required('Height is required')
    .matches(/^\d+'\d+"?$/, 'Height must be in format like 5\'10"'),
  currentWeight: yup
    .number()
    .required('Current weight is required')
    .min(50, 'Weight must be at least 50 lbs')
    .max(1000, 'Please enter a valid weight')
    .positive('Weight must be positive'),
  goalWeight: yup
    .number()
    .required('Goal weight is required')
    .min(50, 'Weight must be at least 50 lbs')
    .max(1000, 'Please enter a valid weight')
    .positive('Weight must be positive'),
});

// Workout validation schemas
export const workoutSchema = yup.object().shape({
  name: yup
    .string()
    .required('Workout name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  type: yup
    .string()
    .required('Workout type is required')
    .oneOf(['strength', 'cardio', 'hiit', 'flexibility', 'sports']),
  duration: yup
    .number()
    .required('Duration is required')
    .min(1, 'Duration must be at least 1 minute')
    .max(300, 'Duration must be less than 5 hours')
    .integer('Duration must be a whole number'),
  exercises: yup
    .number()
    .required('Number of exercises is required')
    .min(1, 'Must have at least 1 exercise')
    .max(50, 'Too many exercises')
    .integer('Must be a whole number'),
  calories: yup
    .number()
    .min(0, 'Calories cannot be negative')
    .max(5000, 'Please enter a realistic calorie value')
    .integer('Calories must be a whole number'),
});

export const exerciseSchema = yup.object().shape({
  name: yup
    .string()
    .required('Exercise name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  sets: yup
    .number()
    .required('Number of sets is required')
    .min(1, 'Must have at least 1 set')
    .max(20, 'Too many sets')
    .integer('Must be a whole number'),
  reps: yup
    .string()
    .required('Reps are required')
    .matches(/^\d+(-\d+)?$/, 'Reps must be a number or range (e.g., 8 or 8-12)'),
  weight: yup
    .number()
    .min(0, 'Weight cannot be negative')
    .max(1000, 'Please enter a realistic weight'),
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters'),
});

// Nutrition validation schemas
export const mealSchema = yup.object().shape({
  name: yup
    .string()
    .required('Meal name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  type: yup
    .string()
    .required('Meal type is required')
    .oneOf(['breakfast', 'lunch', 'dinner', 'snack']),
  calories: yup
    .number()
    .required('Calories are required')
    .min(1, 'Calories must be at least 1')
    .max(3000, 'Please enter a realistic calorie value')
    .integer('Calories must be a whole number'),
  protein: yup
    .number()
    .min(0, 'Protein cannot be negative')
    .max(500, 'Please enter a realistic protein value'),
  carbs: yup
    .number()
    .min(0, 'Carbs cannot be negative')
    .max(500, 'Please enter a realistic carb value'),
  fat: yup
    .number()
    .min(0, 'Fat cannot be negative')
    .max(200, 'Please enter a realistic fat value'),
});

export const foodItemSchema = yup.object().shape({
  name: yup
    .string()
    .required('Food name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .min(0.1, 'Quantity must be at least 0.1')
    .max(100, 'Please enter a realistic quantity'),
  unit: yup
    .string()
    .required('Unit is required')
    .oneOf(['g', 'oz', 'cup', 'tbsp', 'tsp', 'piece', 'slice']),
});

// Health validation schemas
export const healthMetricSchema = yup.object().shape({
  type: yup
    .string()
    .required('Metric type is required')
    .oneOf([
      'weight',
      'blood_pressure',
      'heart_rate',
      'body_fat',
      'muscle_mass',
      'blood_sugar',
      'cholesterol',
    ]),
  value: yup
    .string()
    .required('Value is required')
    .max(50, 'Value must be less than 50 characters'),
  unit: yup
    .string()
    .required('Unit is required')
    .max(20, 'Unit must be less than 20 characters'),
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters'),
});

// Wellness validation schemas
export const wellnessEntrySchema = yup.object().shape({
  mood: yup
    .number()
    .required('Mood rating is required')
    .min(1, 'Mood rating must be between 1 and 5')
    .max(5, 'Mood rating must be between 1 and 5')
    .integer('Mood rating must be a whole number'),
  stress: yup
    .number()
    .required('Stress level is required')
    .min(1, 'Stress level must be between 1 and 5')
    .max(5, 'Stress level must be between 1 and 5')
    .integer('Stress level must be a whole number'),
  energy: yup
    .number()
    .required('Energy level is required')
    .min(1, 'Energy level must be between 1 and 5')
    .max(5, 'Energy level must be between 1 and 5')
    .integer('Energy level must be a whole number'),
  sleep: yup
    .number()
    .required('Sleep hours are required')
    .min(0, 'Sleep hours cannot be negative')
    .max(24, 'Sleep hours cannot exceed 24')
    .test('decimal', 'Sleep hours can have at most one decimal place', (value) =>
      value ? Number.isInteger(value * 10) : true
    ),
  notes: yup
    .string()
    .max(500, 'Notes must be less than 500 characters'),
});

// Goal validation schemas
export const goalSchema = yup.object().shape({
  title: yup
    .string()
    .required('Goal title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  type: yup
    .string()
    .required('Goal type is required')
    .oneOf(['weight', 'fitness', 'nutrition', 'wellness', 'health']),
  target: yup
    .number()
    .required('Target value is required')
    .min(0.1, 'Target must be greater than 0'),
  unit: yup
    .string()
    .required('Unit is required')
    .max(20, 'Unit must be less than 20 characters'),
  deadline: yup
    .date()
    .required('Deadline is required')
    .min(new Date(), 'Deadline must be in the future'),
});

// Utility functions for validation
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An error occurred';
};

export const validateField = async (schema, fieldName, value) => {
  try {
    await schema.validateAt(fieldName, { [fieldName]: value });
    return null;
  } catch (error) {
    return getErrorMessage(error);
  }
};

export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      if (err.path) {
        errors[err.path] = getErrorMessage(err);
      }
    });
    return { isValid: false, errors };
  }
};

// Custom validation helpers
export const isValidEmail = (email) => emailRegex.test(email);
export const isValidPhone = (phone) => phoneRegex.test(phone);

export const passwordStrength = (password) => {
  if (!password) return { score: 0, feedback: 'Password is required' };
  
  let score = 0;
  const feedback = [];
  
  if (password.length >= 8) score += 1;
  else feedback.push('At least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('One lowercase letter');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('One uppercase letter');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('One number');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('One special character');
  
  const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][Math.min(score, 4)];
  
  return {
    score,
    strength,
    feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!',
  };
};