import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * Comprehensive API service layer with error handling, caching, and offline support
 */

// API Configuration
const API_CONFIG = {
  baseURL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://api.bulgeapp.com/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Cache configuration
const CACHE_CONFIG = {
  defaultTTL: 300000, // 5 minutes
  maxSize: 100, // Maximum cached items
  prefix: 'bulge_cache_',
};

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  OFFLINE_QUEUE: 'offline_queue',
  CACHE_PREFIX: 'api_cache_',
};

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(message, statusCode, data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Request interceptor for authentication and common headers
 */
const getHeaders = async (customHeaders = {}) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...customHeaders,
  };
};

/**
 * Network connectivity checker
 */
const isOnline = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

/**
 * Cache management utilities
 */
const CacheManager = {
  async get(key) {
    try {
      const cacheKey = `${CACHE_CONFIG.prefix}${key}`;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;
      
      const { data, timestamp, ttl } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > ttl;
      
      if (isExpired) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  },

  async set(key, data, ttl = CACHE_CONFIG.defaultTTL) {
    try {
      const cacheKey = `${CACHE_CONFIG.prefix}${key}`;
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  },

  async clear(pattern = null) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(CACHE_CONFIG.prefix) &&
        (pattern ? key.includes(pattern) : true)
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  },
};

/**
 * Offline queue management
 */
const OfflineQueue = {
  async add(request) {
    try {
      const queue = await this.getQueue();
      queue.push({
        ...request,
        id: Date.now().toString(),
        timestamp: Date.now(),
      });
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(queue)
      );
    } catch (error) {
      console.warn('Offline queue add error:', error);
    }
  },

  async getQueue() {
    try {
      const queue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.warn('Offline queue get error:', error);
      return [];
    }
  },

  async processQueue() {
    try {
      const queue = await this.getQueue();
      const processed = [];
      
      for (const request of queue) {
        try {
          await ApiService.request(request);
          processed.push(request.id);
        } catch (error) {
          console.warn('Failed to process offline request:', error);
        }
      }
      
      // Remove processed requests
      const remainingQueue = queue.filter(
        req => !processed.includes(req.id)
      );
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_QUEUE,
        JSON.stringify(remainingQueue)
      );
      
      return processed.length;
    } catch (error) {
      console.warn('Offline queue process error:', error);
      return 0;
    }
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    } catch (error) {
      console.warn('Offline queue clear error:', error);
    }
  },
};

/**
 * Core API service with retry logic and error handling
 */
const ApiService = {
  /**
   * Main request method with comprehensive error handling
   */
  async request(options) {
    const {
      endpoint,
      method = 'GET',
      data = null,
      headers = {},
      timeout = API_CONFIG.timeout,
      cache = false,
      cacheTTL = CACHE_CONFIG.defaultTTL,
      retries = API_CONFIG.retryAttempts,
      requiresAuth = true,
      offlineQueue = true,
    } = options;

    const url = `${API_CONFIG.baseURL}${endpoint}`;
    const cacheKey = `${method}_${endpoint}_${JSON.stringify(data)}`;

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cached = await CacheManager.get(cacheKey);
      if (cached) {
        return { success: true, data: cached, fromCache: true };
      }
    }

    // Check network connectivity
    const online = await isOnline();
    if (!online) {
      if (offlineQueue && method !== 'GET') {
        await OfflineQueue.add(options);
        return { 
          success: false, 
          message: 'Request queued for when online',
          queued: true 
        };
      }
      
      throw new ApiError('No internet connection', 0);
    }

    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const requestHeaders = await getHeaders(headers);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: data ? JSON.stringify(data) : null,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();

        if (!response.ok) {
          // Handle authentication errors
          if (response.status === 401 && requiresAuth) {
            await this.handleUnauthorized();
            throw new ApiError('Authentication required', 401, responseData);
          }

          throw new ApiError(
            responseData.message || 'Request failed',
            response.status,
            responseData
          );
        }

        // Cache successful GET requests
        if (method === 'GET' && cache) {
          await CacheManager.set(cacheKey, responseData, cacheTTL);
        }

        return {
          success: true,
          data: responseData,
          statusCode: response.status,
        };

      } catch (error) {
        lastError = error;
        
        // Don't retry for certain errors
        if (
          error.name === 'AbortError' ||
          error.statusCode === 400 ||
          error.statusCode === 401 ||
          error.statusCode === 403 ||
          error.statusCode === 404
        ) {
          break;
        }

        // Wait before retrying
        if (attempt < retries) {
          await new Promise(resolve => 
            setTimeout(resolve, API_CONFIG.retryDelay * (attempt + 1))
          );
        }
      }
    }

    throw lastError;
  },

  /**
   * Handle unauthorized responses
   */
  async handleUnauthorized() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      
      if (refreshToken) {
        // Try to refresh the token
        const response = await this.request({
          endpoint: '/auth/refresh',
          method: 'POST',
          data: { refreshToken },
          requiresAuth: false,
          cache: false,
          retries: 0,
        });

        if (response.success) {
          await AsyncStorage.setItem(
            STORAGE_KEYS.AUTH_TOKEN,
            response.data.accessToken
          );
          return true;
        }
      }
    } catch (error) {
      console.warn('Token refresh failed:', error);
    }

    // Clear stored auth data
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);

    return false;
  },

  /**
   * Authentication endpoints
   */
  auth: {
    async login(email, password) {
      return ApiService.request({
        endpoint: '/auth/login',
        method: 'POST',
        data: { email, password },
        requiresAuth: false,
        cache: false,
      });
    },

    async register(userData) {
      return ApiService.request({
        endpoint: '/auth/register',
        method: 'POST',
        data: userData,
        requiresAuth: false,
        cache: false,
      });
    },

    async logout() {
      try {
        await ApiService.request({
          endpoint: '/auth/logout',
          method: 'POST',
          cache: false,
        });
      } catch (error) {
        console.warn('Logout request failed:', error);
      } finally {
        // Clear local data regardless of API response
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        await CacheManager.clear();
        await OfflineQueue.clear();
      }
    },

    async resetPassword(email) {
      return ApiService.request({
        endpoint: '/auth/reset-password',
        method: 'POST',
        data: { email },
        requiresAuth: false,
        cache: false,
      });
    },
  },

  /**
   * User profile endpoints
   */
  user: {
    async getProfile() {
      return ApiService.request({
        endpoint: '/user/profile',
        method: 'GET',
        cache: true,
        cacheTTL: 600000, // 10 minutes
      });
    },

    async updateProfile(userData) {
      const result = await ApiService.request({
        endpoint: '/user/profile',
        method: 'PUT',
        data: userData,
        cache: false,
      });

      // Clear profile cache after update
      await CacheManager.clear('user');
      return result;
    },

    async uploadAvatar(imageData) {
      return ApiService.request({
        endpoint: '/user/avatar',
        method: 'POST',
        data: imageData,
        headers: { 'Content-Type': 'multipart/form-data' },
        cache: false,
      });
    },

    async deleteAccount() {
      return ApiService.request({
        endpoint: '/user/account',
        method: 'DELETE',
        cache: false,
      });
    },
  },

  /**
   * Fitness tracking endpoints
   */
  fitness: {
    async getWorkouts(page = 1, limit = 20) {
      return ApiService.request({
        endpoint: `/fitness/workouts?page=${page}&limit=${limit}`,
        method: 'GET',
        cache: true,
        cacheTTL: 300000, // 5 minutes
      });
    },

    async createWorkout(workoutData) {
      return ApiService.request({
        endpoint: '/fitness/workouts',
        method: 'POST',
        data: workoutData,
        cache: false,
      });
    },

    async updateWorkout(workoutId, workoutData) {
      return ApiService.request({
        endpoint: `/fitness/workouts/${workoutId}`,
        method: 'PUT',
        data: workoutData,
        cache: false,
      });
    },

    async deleteWorkout(workoutId) {
      return ApiService.request({
        endpoint: `/fitness/workouts/${workoutId}`,
        method: 'DELETE',
        cache: false,
      });
    },

    async getExercises(category = null) {
      const endpoint = category 
        ? `/fitness/exercises?category=${category}`
        : '/fitness/exercises';
      
      return ApiService.request({
        endpoint,
        method: 'GET',
        cache: true,
        cacheTTL: 3600000, // 1 hour
      });
    },

    async getWorkoutTemplates() {
      return ApiService.request({
        endpoint: '/fitness/templates',
        method: 'GET',
        cache: true,
        cacheTTL: 3600000, // 1 hour
      });
    },
  },

  /**
   * Nutrition tracking endpoints
   */
  nutrition: {
    async getMeals(date = null) {
      const endpoint = date 
        ? `/nutrition/meals?date=${date}`
        : '/nutrition/meals';
      
      return ApiService.request({
        endpoint,
        method: 'GET',
        cache: true,
        cacheTTL: 300000, // 5 minutes
      });
    },

    async createMeal(mealData) {
      return ApiService.request({
        endpoint: '/nutrition/meals',
        method: 'POST',
        data: mealData,
        cache: false,
      });
    },

    async updateMeal(mealId, mealData) {
      return ApiService.request({
        endpoint: `/nutrition/meals/${mealId}`,
        method: 'PUT',
        data: mealData,
        cache: false,
      });
    },

    async deleteMeal(mealId) {
      return ApiService.request({
        endpoint: `/nutrition/meals/${mealId}`,
        method: 'DELETE',
        cache: false,
      });
    },

    async searchFood(query) {
      return ApiService.request({
        endpoint: `/nutrition/foods/search?q=${encodeURIComponent(query)}`,
        method: 'GET',
        cache: true,
        cacheTTL: 1800000, // 30 minutes
      });
    },

    async getFoodDetails(foodId) {
      return ApiService.request({
        endpoint: `/nutrition/foods/${foodId}`,
        method: 'GET',
        cache: true,
        cacheTTL: 3600000, // 1 hour
      });
    },

    async getNutritionGoals() {
      return ApiService.request({
        endpoint: '/nutrition/goals',
        method: 'GET',
        cache: true,
        cacheTTL: 600000, // 10 minutes
      });
    },

    async updateNutritionGoals(goals) {
      return ApiService.request({
        endpoint: '/nutrition/goals',
        method: 'PUT',
        data: goals,
        cache: false,
      });
    },
  },

  /**
   * Health tracking endpoints
   */
  health: {
    async getMetrics(type = null, startDate = null, endDate = null) {
      let endpoint = '/health/metrics';
      const params = new URLSearchParams();
      
      if (type) params.append('type', type);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      return ApiService.request({
        endpoint,
        method: 'GET',
        cache: true,
        cacheTTL: 300000, // 5 minutes
      });
    },

    async addMetric(metricData) {
      return ApiService.request({
        endpoint: '/health/metrics',
        method: 'POST',
        data: metricData,
        cache: false,
      });
    },

    async updateMetric(metricId, metricData) {
      return ApiService.request({
        endpoint: `/health/metrics/${metricId}`,
        method: 'PUT',
        data: metricData,
        cache: false,
      });
    },

    async deleteMetric(metricId) {
      return ApiService.request({
        endpoint: `/health/metrics/${metricId}`,
        method: 'DELETE',
        cache: false,
      });
    },

    async getHealthInsights() {
      return ApiService.request({
        endpoint: '/health/insights',
        method: 'GET',
        cache: true,
        cacheTTL: 1800000, // 30 minutes
      });
    },
  },

  /**
   * Wellness tracking endpoints
   */
  wellness: {
    async getEntries(startDate = null, endDate = null) {
      let endpoint = '/wellness/entries';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      return ApiService.request({
        endpoint,
        method: 'GET',
        cache: true,
        cacheTTL: 300000, // 5 minutes
      });
    },

    async createEntry(entryData) {
      return ApiService.request({
        endpoint: '/wellness/entries',
        method: 'POST',
        data: entryData,
        cache: false,
      });
    },

    async updateEntry(entryId, entryData) {
      return ApiService.request({
        endpoint: `/wellness/entries/${entryId}`,
        method: 'PUT',
        data: entryData,
        cache: false,
      });
    },

    async deleteEntry(entryId) {
      return ApiService.request({
        endpoint: `/wellness/entries/${entryId}`,
        method: 'DELETE',
        cache: false,
      });
    },
  },

  /**
   * Goals endpoints
   */
  goals: {
    async getGoals() {
      return ApiService.request({
        endpoint: '/goals',
        method: 'GET',
        cache: true,
        cacheTTL: 600000, // 10 minutes
      });
    },

    async createGoal(goalData) {
      return ApiService.request({
        endpoint: '/goals',
        method: 'POST',
        data: goalData,
        cache: false,
      });
    },

    async updateGoal(goalId, goalData) {
      return ApiService.request({
        endpoint: `/goals/${goalId}`,
        method: 'PUT',
        data: goalData,
        cache: false,
      });
    },

    async deleteGoal(goalId) {
      return ApiService.request({
        endpoint: `/goals/${goalId}`,
        method: 'DELETE',
        cache: false,
      });
    },

    async updateProgress(goalId, progress) {
      return ApiService.request({
        endpoint: `/goals/${goalId}/progress`,
        method: 'PUT',
        data: { progress },
        cache: false,
      });
    },
  },

  /**
   * Analytics endpoints
   */
  analytics: {
    async getDashboardData(period = '7d') {
      return ApiService.request({
        endpoint: `/analytics/dashboard?period=${period}`,
        method: 'GET',
        cache: true,
        cacheTTL: 600000, // 10 minutes
      });
    },

    async getProgressData(type, period = '30d') {
      return ApiService.request({
        endpoint: `/analytics/progress?type=${type}&period=${period}`,
        method: 'GET',
        cache: true,
        cacheTTL: 600000, // 10 minutes
      });
    },

    async getReports(type, startDate, endDate) {
      return ApiService.request({
        endpoint: `/analytics/reports?type=${type}&startDate=${startDate}&endDate=${endDate}`,
        method: 'GET',
        cache: true,
        cacheTTL: 1800000, // 30 minutes
      });
    },
  },

  /**
   * Utility methods
   */
  async syncOfflineData() {
    const online = await isOnline();
    if (!online) return 0;

    return await OfflineQueue.processQueue();
  },

  async clearCache(pattern = null) {
    return await CacheManager.clear(pattern);
  },

  async getQueueSize() {
    const queue = await OfflineQueue.getQueue();
    return queue.length;
  },
};

export default ApiService;
export { ApiError, CacheManager, OfflineQueue };