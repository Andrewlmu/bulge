import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const initialState = {
  user: {
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    age: 32,
    height: "6'1\"",
    currentWeight: 185,
    goalWeight: 175,
    activityLevel: 'moderate',
  },
  todayStats: {
    steps: 8432,
    stepsTarget: 10000,
    calories: 2150,
    caloriesTarget: 2500,
    water: 6,
    waterTarget: 8,
    sleep: 7.5,
    sleepTarget: 8,
    mood: 4,
    stress: 3,
    energy: 4,
  },
  nutrition: {
    calories: { consumed: 1850, target: 2500 },
    protein: { consumed: 125, target: 180 },
    carbs: { consumed: 180, target: 250 },
    fat: { consumed: 75, target: 85 },
  },
  workouts: [
    {
      id: 1,
      name: 'Upper Body Strength',
      date: new Date().toISOString(),
      duration: 52,
      exercises: 8,
      calories: 324,
      completed: true,
    },
  ],
  meals: [
    {
      id: 1,
      name: 'Grilled Chicken Salad',
      time: '12:30 PM',
      type: 'Lunch',
      calories: 425,
      protein: 35,
      date: new Date().toISOString(),
    },
  ],
  goals: [
    {
      id: 1,
      title: 'Lose 10 pounds',
      target: 175,
      current: 185,
      unit: 'lbs',
      type: 'weight',
      deadline: '2024-12-31',
    },
    {
      id: 2,
      title: 'Exercise 5 times per week',
      target: 5,
      current: 4,
      unit: 'workouts',
      type: 'fitness',
      deadline: '2024-12-31',
    },
  ],
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    case 'UPDATE_TODAY_STATS':
      return {
        ...state,
        todayStats: { ...state.todayStats, ...action.payload },
      };
    
    case 'ADD_WORKOUT':
      return {
        ...state,
        workouts: [action.payload, ...state.workouts],
      };
    
    case 'ADD_MEAL':
      return {
        ...state,
        meals: [action.payload, ...state.meals],
        nutrition: {
          ...state.nutrition,
          calories: {
            ...state.nutrition.calories,
            consumed: state.nutrition.calories.consumed + action.payload.calories,
          },
          protein: {
            ...state.nutrition.protein,
            consumed: state.nutrition.protein.consumed + (action.payload.protein || 0),
          },
        },
      };
    
    case 'UPDATE_NUTRITION':
      return {
        ...state,
        nutrition: { ...state.nutrition, ...action.payload },
      };
    
    case 'SET_MOOD':
      return {
        ...state,
        todayStats: {
          ...state.todayStats,
          mood: action.payload,
        },
      };
    
    case 'UPDATE_GOALS':
      return {
        ...state,
        goals: action.payload,
      };
    
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
      };
    
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from AsyncStorage on app start
  useEffect(() => {
    loadStoredData();
  }, []);

  // Save data to AsyncStorage whenever state changes
  useEffect(() => {
    saveDataToStorage();
  }, [state]);

  const loadStoredData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('appData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        dispatch({ type: 'LOAD_STATE', payload: parsedData });
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
  };

  const saveDataToStorage = async () => {
    try {
      await AsyncStorage.setItem('appData', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const updateUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData });
  };

  const updateTodayStats = (stats) => {
    dispatch({ type: 'UPDATE_TODAY_STATS', payload: stats });
  };

  const addWorkout = (workout) => {
    const newWorkout = {
      id: Date.now(),
      ...workout,
      date: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_WORKOUT', payload: newWorkout });
  };

  const addMeal = (meal) => {
    const newMeal = {
      id: Date.now(),
      ...meal,
      date: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MEAL', payload: newMeal });
  };

  const setMood = (mood) => {
    dispatch({ type: 'SET_MOOD', payload: mood });
  };

  const updateNutrition = (nutrition) => {
    dispatch({ type: 'UPDATE_NUTRITION', payload: nutrition });
  };

  const contextValue = {
    ...state,
    updateUser,
    updateTodayStats,
    addWorkout,
    addMeal,
    setMood,
    updateNutrition,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;