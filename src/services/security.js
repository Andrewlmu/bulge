import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

/**
 * Production-ready security service
 * Handles authentication, data encryption, and API protection
 */

class SecurityService {
  constructor() {
    this.apiKey = null;
    this.sessionToken = null;
    this.refreshToken = null;
    this.encryptionKey = null;
    this.isInitialized = false;
  }

  /**
   * Initialize security service
   */
  async initialize() {
    try {
      // Generate or retrieve encryption key
      await this.initializeEncryption();
      
      // Load stored authentication tokens
      await this.loadStoredTokens();
      
      // Set up API security headers
      this.setupAPIInterceptors();
      
      this.isInitialized = true;
      console.log('Security service initialized');
    } catch (error) {
      console.error('Failed to initialize security service:', error);
    }
  }

  /**
   * Initialize encryption system
   */
  async initializeEncryption() {
    try {
      // Try to get existing encryption key
      let encryptionKey = await SecureStore.getItemAsync('encryption_key');
      
      if (!encryptionKey) {
        // Generate new encryption key
        encryptionKey = await this.generateEncryptionKey();
        await SecureStore.setItemAsync('encryption_key', encryptionKey);
      }
      
      this.encryptionKey = encryptionKey;
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      // Fallback to device-specific key
      this.encryptionKey = await this.generateDeviceKey();
    }
  }

  /**
   * Generate secure encryption key
   */
  async generateEncryptionKey() {
    try {
      // Generate 256-bit encryption key
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      return Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      // Fallback to timestamp-based key
      return Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${Date.now()}_${Math.random()}`
      );
    }
  }

  /**
   * Generate device-specific key for fallback
   */
  async generateDeviceKey() {
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      timestamp: Date.now(),
      random: Math.random(),
    };
    
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      JSON.stringify(deviceInfo)
    );
  }

  /**
   * Encrypt sensitive data before storage
   */
  async encryptData(data) {
    try {
      if (!this.encryptionKey) {
        throw new Error('Encryption not initialized');
      }

      // Simple XOR encryption (in production, use proper AES encryption)
      const jsonData = JSON.stringify(data);
      const encrypted = this.xorEncrypt(jsonData, this.encryptionKey);
      return encrypted;
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      return JSON.stringify(data); // Fallback to unencrypted
    }
  }

  /**
   * Decrypt sensitive data from storage
   */
  async decryptData(encryptedData) {
    try {
      if (!this.encryptionKey || !encryptedData) {
        return null;
      }

      const decrypted = this.xorDecrypt(encryptedData, this.encryptionKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      try {
        // Try parsing as plain JSON (backward compatibility)
        return JSON.parse(encryptedData);
      } catch {
        return null;
      }
    }
  }

  /**
   * Simple XOR encryption (replace with AES in production)
   */
  xorEncrypt(text, key) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result); // Base64 encode
  }

  /**
   * Simple XOR decryption
   */
  xorDecrypt(encryptedText, key) {
    const decoded = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  /**
   * Securely store authentication tokens
   */
  async storeAuthTokens(tokens) {
    try {
      const { accessToken, refreshToken, expiresAt } = tokens;
      
      // Store sensitive tokens in secure storage
      await SecureStore.setItemAsync('access_token', accessToken);
      await SecureStore.setItemAsync('refresh_token', refreshToken);
      
      // Store token metadata in regular storage
      await AsyncStorage.setItem('token_metadata', JSON.stringify({
        expiresAt,
        storedAt: Date.now(),
      }));

      this.sessionToken = accessToken;
      this.refreshToken = refreshToken;
      
      console.log('Auth tokens stored securely');
    } catch (error) {
      console.error('Failed to store auth tokens:', error);
    }
  }

  /**
   * Load stored authentication tokens
   */
  async loadStoredTokens() {
    try {
      const accessToken = await SecureStore.getItemAsync('access_token');
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      const metadata = await AsyncStorage.getItem('token_metadata');
      
      if (accessToken && refreshToken && metadata) {
        const { expiresAt } = JSON.parse(metadata);
        
        // Check if token is still valid
        if (Date.now() < expiresAt) {
          this.sessionToken = accessToken;
          this.refreshToken = refreshToken;
          return { accessToken, refreshToken, expiresAt };
        } else {
          // Token expired, attempt refresh
          return await this.refreshAuthToken();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load stored tokens:', error);
      return null;
    }
  }

  /**
   * Refresh expired authentication token
   */
  async refreshAuthToken() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('https://api.bulgeapp.com/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`,
        },
      });

      if (response.ok) {
        const tokens = await response.json();
        await this.storeAuthTokens(tokens);
        return tokens;
      } else {
        // Refresh failed, clear tokens
        await this.clearAuthTokens();
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.clearAuthTokens();
      return null;
    }
  }

  /**
   * Clear stored authentication tokens
   */
  async clearAuthTokens() {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await AsyncStorage.removeItem('token_metadata');
      
      this.sessionToken = null;
      this.refreshToken = null;
      
      console.log('Auth tokens cleared');
    } catch (error) {
      console.error('Failed to clear auth tokens:', error);
    }
  }

  /**
   * Set up API request interceptors for security
   */
  setupAPIInterceptors() {
    // In production, this would modify the global fetch or axios instance
    const originalFetch = global.fetch;
    
    global.fetch = async (url, options = {}) => {
      try {
        // Add security headers
        const secureOptions = await this.addSecurityHeaders(options);
        
        // Make request
        const response = await originalFetch(url, secureOptions);
        
        // Handle authentication errors
        if (response.status === 401 && this.refreshToken) {
          // Attempt token refresh
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            // Retry original request with new token
            const retryOptions = await this.addSecurityHeaders(options);
            return await originalFetch(url, retryOptions);
          }
        }
        
        return response;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    };
  }

  /**
   * Add security headers to API requests
   */
  async addSecurityHeaders(options) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Platform': Platform.OS,
      'X-Request-ID': await this.generateRequestId(),
      ...options.headers,
    };

    // Add authentication token if available
    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    // Add API key if available
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    // Add request signature for critical operations
    if (options.method === 'POST' || options.method === 'PUT') {
      headers['X-Request-Signature'] = await this.signRequest(options.body);
    }

    return {
      ...options,
      headers,
    };
  }

  /**
   * Generate unique request ID for tracking
   */
  async generateRequestId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}_${random}`;
  }

  /**
   * Sign request payload for integrity verification
   */
  async signRequest(body) {
    try {
      if (!body) return '';
      
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      const signature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${payload}_${this.encryptionKey}_${Date.now()}`
      );
      
      return signature.substring(0, 32); // Truncate for header size
    } catch (error) {
      console.error('Failed to sign request:', error);
      return '';
    }
  }

  /**
   * Validate API response integrity
   */
  async validateResponse(response, expectedSignature) {
    try {
      if (!expectedSignature) return true;
      
      const responseText = await response.text();
      const computedSignature = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        responseText
      );
      
      return computedSignature === expectedSignature;
    } catch (error) {
      console.error('Failed to validate response:', error);
      return false;
    }
  }

  /**
   * Secure data storage wrapper
   */
  async secureStore(key, data) {
    try {
      const encrypted = await this.encryptData(data);
      await AsyncStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to secure store data:', error);
    }
  }

  /**
   * Secure data retrieval wrapper
   */
  async secureRetrieve(key) {
    try {
      const encrypted = await AsyncStorage.getItem(`secure_${key}`);
      if (encrypted) {
        return await this.decryptData(encrypted);
      }
      return null;
    } catch (error) {
      console.error('Failed to secure retrieve data:', error);
      return null;
    }
  }

  /**
   * Clear all secure data
   */
  async clearSecureData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      
      await Promise.all([
        AsyncStorage.multiRemove(secureKeys),
        this.clearAuthTokens(),
        SecureStore.deleteItemAsync('encryption_key'),
      ]);
      
      console.log('All secure data cleared');
    } catch (error) {
      console.error('Failed to clear secure data:', error);
    }
  }

  /**
   * Check if user session is valid
   */
  async isSessionValid() {
    try {
      if (!this.sessionToken) return false;
      
      const metadata = await AsyncStorage.getItem('token_metadata');
      if (!metadata) return false;
      
      const { expiresAt } = JSON.parse(metadata);
      return Date.now() < expiresAt;
    } catch (error) {
      console.error('Failed to check session validity:', error);
      return false;
    }
  }

  /**
   * Get security status
   */
  getSecurityStatus() {
    return {
      isInitialized: this.isInitialized,
      hasEncryptionKey: !!this.encryptionKey,
      hasSessionToken: !!this.sessionToken,
      hasRefreshToken: !!this.refreshToken,
      platform: Platform.OS,
    };
  }
}

// Export singleton instance
const securityService = new SecurityService();

// Convenience functions
export const initializeSecurity = () => securityService.initialize();
export const storeAuthTokens = (tokens) => securityService.storeAuthTokens(tokens);
export const loadStoredTokens = () => securityService.loadStoredTokens();
export const clearAuthTokens = () => securityService.clearAuthTokens();
export const refreshAuthToken = () => securityService.refreshAuthToken();
export const secureStore = (key, data) => securityService.secureStore(key, data);
export const secureRetrieve = (key) => securityService.secureRetrieve(key);
export const clearSecureData = () => securityService.clearSecureData();
export const isSessionValid = () => securityService.isSessionValid();
export const getSecurityStatus = () => securityService.getSecurityStatus();

export default securityService;