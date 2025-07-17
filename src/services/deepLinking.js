import * as Linking from 'expo-linking';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from './analytics';

/**
 * Production-ready deep linking service
 * Handles universal links, marketing campaigns, and user onboarding flows
 */

class DeepLinkingService {
  constructor() {
    this.navigation = null;
    this.isInitialized = false;
    this.pendingLink = null;
    this.linkHandlers = new Map();
    this.config = {
      scheme: 'bulge',
      baseUrl: 'https://bulgeapp.com',
    };
  }

  /**
   * Initialize deep linking service
   */
  async initialize(navigationRef) {
    try {
      this.navigation = navigationRef;
      
      // Set up URL handling
      this.setupUrlHandling();
      
      // Register link handlers
      this.registerLinkHandlers();
      
      // Process initial URL if app was opened via link
      await this.processInitialUrl();
      
      this.isInitialized = true;
      console.log('Deep linking service initialized');
    } catch (error) {
      console.error('Failed to initialize deep linking:', error);
    }
  }

  /**
   * Set up URL event handling
   */
  setupUrlHandling() {
    // Handle incoming URLs while app is running
    Linking.addEventListener('url', this.handleIncomingUrl.bind(this));
    
    console.log('Deep linking URL handling configured');
  }

  /**
   * Process initial URL when app opens via link
   */
  async processInitialUrl() {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('App opened with URL:', initialUrl);
        await this.handleUrl(initialUrl);
      }
    } catch (error) {
      console.error('Failed to process initial URL:', error);
    }
  }

  /**
   * Handle incoming URL events
   */
  async handleIncomingUrl(event) {
    try {
      console.log('Incoming URL:', event.url);
      await this.handleUrl(event.url);
    } catch (error) {
      console.error('Failed to handle incoming URL:', error);
    }
  }

  /**
   * Parse and handle any URL
   */
  async handleUrl(url) {
    try {
      if (!url) return;

      // Parse the URL
      const parsed = this.parseUrl(url);
      if (!parsed) return;

      // Track deep link analytics
      analytics.track('deep_link_opened', {
        url,
        path: parsed.path,
        params: parsed.params,
        source: parsed.params?.source || 'unknown',
      });

      // Store referral information
      await this.storeReferralData(parsed.params);

      // Wait for navigation to be ready
      if (!this.navigation?.isReady()) {
        this.pendingLink = parsed;
        return;
      }

      // Handle the parsed link
      await this.processLink(parsed);
    } catch (error) {
      console.error('Failed to handle URL:', error);
    }
  }

  /**
   * Parse URL into components
   */
  parseUrl(url) {
    try {
      const { hostname, pathname, queryParams } = Linking.parse(url);
      
      // Handle both app scheme and universal links
      let path = pathname;
      if (hostname && !path) {
        path = `/${hostname}`;
      }

      return {
        originalUrl: url,
        hostname,
        path: path || '/',
        params: queryParams || {},
      };
    } catch (error) {
      console.error('Failed to parse URL:', error);
      return null;
    }
  }

  /**
   * Process pending link when navigation becomes ready
   */
  async processPendingLink() {
    if (this.pendingLink && this.navigation?.isReady()) {
      await this.processLink(this.pendingLink);
      this.pendingLink = null;
    }
  }

  /**
   * Process parsed link and navigate accordingly
   */
  async processLink(parsed) {
    try {
      const { path, params } = parsed;
      
      // Find matching handler
      const handler = this.findLinkHandler(path);
      if (handler) {
        await handler(params, path);
      } else {
        // Default fallback navigation
        console.log('No handler found for path:', path);
        this.navigateToDefault(params);
      }
    } catch (error) {
      console.error('Failed to process link:', error);
      this.navigateToDefault();
    }
  }

  /**
   * Find appropriate link handler for path
   */
  findLinkHandler(path) {
    // Try exact match first
    if (this.linkHandlers.has(path)) {
      return this.linkHandlers.get(path);
    }

    // Try pattern matching
    for (const [pattern, handler] of this.linkHandlers.entries()) {
      if (pattern.includes('*') || pattern.includes(':')) {
        const regex = this.patternToRegex(pattern);
        if (regex.test(path)) {
          return handler;
        }
      }
    }

    return null;
  }

  /**
   * Convert pattern to regex for matching
   */
  patternToRegex(pattern) {
    const escaped = pattern
      .replace(/\*/g, '.*')
      .replace(/:([^/]+)/g, '([^/]+)');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Register all link handlers
   */
  registerLinkHandlers() {
    // Authentication links
    this.registerHandler('/login', this.handleLoginLink.bind(this));
    this.registerHandler('/signup', this.handleSignupLink.bind(this));
    this.registerHandler('/reset-password', this.handlePasswordResetLink.bind(this));
    
    // Content links
    this.registerHandler('/workout/:id', this.handleWorkoutLink.bind(this));
    this.registerHandler('/achievement/:id', this.handleAchievementLink.bind(this));
    this.registerHandler('/challenge/:id', this.handleChallengeLink.bind(this));
    
    // Social features
    this.registerHandler('/share/workout/:id', this.handleSharedWorkoutLink.bind(this));
    this.registerHandler('/invite/:code', this.handleInviteLink.bind(this));
    this.registerHandler('/friend/:id', this.handleFriendProfileLink.bind(this));
    
    // Marketing campaigns
    this.registerHandler('/campaign/:name', this.handleCampaignLink.bind(this));
    this.registerHandler('/promo/:code', this.handlePromoLink.bind(this));
    
    // Premium features
    this.registerHandler('/premium', this.handlePremiumLink.bind(this));
    this.registerHandler('/subscription', this.handleSubscriptionLink.bind(this));
    
    // Support and help
    this.registerHandler('/help/*', this.handleHelpLink.bind(this));
    this.registerHandler('/support', this.handleSupportLink.bind(this));
    
    console.log('Deep link handlers registered');
  }

  /**
   * Register a link handler
   */
  registerHandler(pattern, handler) {
    this.linkHandlers.set(pattern, handler);
  }

  /**
   * Handle login deep link
   */
  async handleLoginLink(params) {
    analytics.track('deep_link_login', { source: params.source });
    
    this.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
            state: {
              routes: [{ name: 'Login', params }],
            },
          },
        ],
      })
    );
  }

  /**
   * Handle signup deep link
   */
  async handleSignupLink(params) {
    analytics.track('deep_link_signup', { 
      source: params.source,
      campaign: params.campaign,
    });
    
    this.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Auth',
            state: {
              routes: [{ name: 'Signup', params }],
            },
          },
        ],
      })
    );
  }

  /**
   * Handle password reset deep link
   */
  async handlePasswordResetLink(params) {
    const { token, email } = params;
    
    analytics.track('deep_link_password_reset', { has_token: !!token });
    
    this.navigation.navigate('Auth', {
      screen: 'ResetPassword',
      params: { token, email },
    });
  }

  /**
   * Handle workout deep link
   */
  async handleWorkoutLink(params, path) {
    const workoutId = this.extractPathParam(path, '/workout/:id');
    
    analytics.track('deep_link_workout', { 
      workout_id: workoutId,
      source: params.source,
    });
    
    // Check if user is authenticated
    const isAuthenticated = await this.checkAuthentication();
    if (!isAuthenticated) {
      // Store deep link for after authentication
      await this.storePendingNavigation('Workout', { workoutId, ...params });
      this.navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    
    this.navigation.navigate('Main', {
      screen: 'WorkoutDetail',
      params: { workoutId, ...params },
    });
  }

  /**
   * Handle achievement deep link
   */
  async handleAchievementLink(params, path) {
    const achievementId = this.extractPathParam(path, '/achievement/:id');
    
    analytics.track('deep_link_achievement', { 
      achievement_id: achievementId,
      source: params.source,
    });
    
    const isAuthenticated = await this.checkAuthentication();
    if (!isAuthenticated) {
      await this.storePendingNavigation('Achievement', { achievementId, ...params });
      this.navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    
    this.navigation.navigate('Main', {
      screen: 'Achievements',
      params: { selectedAchievement: achievementId, ...params },
    });
  }

  /**
   * Handle shared workout link
   */
  async handleSharedWorkoutLink(params, path) {
    const workoutId = this.extractPathParam(path, '/share/workout/:id');
    
    analytics.track('deep_link_shared_workout', { 
      workout_id: workoutId,
      shared_by: params.sharedBy,
      source: params.source,
    });
    
    // Show shared workout preview even for non-authenticated users
    this.navigation.navigate('SharedWorkout', { 
      workoutId, 
      sharedBy: params.sharedBy,
      ...params 
    });
  }

  /**
   * Handle invite link
   */
  async handleInviteLink(params, path) {
    const inviteCode = this.extractPathParam(path, '/invite/:code');
    
    analytics.track('deep_link_invite', { 
      invite_code: inviteCode,
      invited_by: params.invitedBy,
    });
    
    // Store invite data for signup process
    await AsyncStorage.setItem('pending_invite', JSON.stringify({
      code: inviteCode,
      invitedBy: params.invitedBy,
      timestamp: Date.now(),
    }));
    
    const isAuthenticated = await this.checkAuthentication();
    if (isAuthenticated) {
      // Process invite for existing user
      this.navigation.navigate('Main', {
        screen: 'ProcessInvite',
        params: { inviteCode, ...params },
      });
    } else {
      // Encourage signup with invite benefits
      this.navigation.navigate('Auth', {
        screen: 'Signup',
        params: { inviteCode, invitedBy: params.invitedBy },
      });
    }
  }

  /**
   * Handle campaign link
   */
  async handleCampaignLink(params, path) {
    const campaignName = this.extractPathParam(path, '/campaign/:name');
    
    analytics.track('deep_link_campaign', { 
      campaign_name: campaignName,
      source: params.source,
      medium: params.medium,
    });
    
    // Store campaign attribution
    await this.storeCampaignAttribution({
      campaign: campaignName,
      source: params.source,
      medium: params.medium,
      content: params.content,
      timestamp: Date.now(),
    });
    
    // Navigate based on campaign type
    this.handleCampaignNavigation(campaignName, params);
  }

  /**
   * Handle premium link
   */
  async handlePremiumLink(params) {
    analytics.track('deep_link_premium', { 
      source: params.source,
      promo: params.promo,
    });
    
    const isAuthenticated = await this.checkAuthentication();
    if (!isAuthenticated) {
      await this.storePendingNavigation('Premium', params);
      this.navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    
    this.navigation.navigate('Main', {
      screen: 'Premium',
      params,
    });
  }

  /**
   * Handle help link
   */
  async handleHelpLink(params, path) {
    const helpPath = path.replace('/help/', '');
    
    analytics.track('deep_link_help', { 
      help_path: helpPath,
      source: params.source,
    });
    
    this.navigation.navigate('Help', {
      screen: 'HelpDetail',
      params: { path: helpPath, ...params },
    });
  }

  /**
   * Extract parameter from path pattern
   */
  extractPathParam(path, pattern) {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        return pathParts[i];
      }
    }
    
    return null;
  }

  /**
   * Check if user is authenticated
   */
  async checkAuthentication() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      console.error('Failed to check authentication:', error);
      return false;
    }
  }

  /**
   * Store pending navigation for after authentication
   */
  async storePendingNavigation(screen, params) {
    try {
      await AsyncStorage.setItem('pending_navigation', JSON.stringify({
        screen,
        params,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to store pending navigation:', error);
    }
  }

  /**
   * Process pending navigation after authentication
   */
  async processPendingNavigation() {
    try {
      const pending = await AsyncStorage.getItem('pending_navigation');
      if (!pending) return;
      
      const { screen, params, timestamp } = JSON.parse(pending);
      
      // Check if pending navigation is still valid (within 1 hour)
      if (Date.now() - timestamp > 3600000) {
        await AsyncStorage.removeItem('pending_navigation');
        return;
      }
      
      // Navigate to pending screen
      this.navigation.navigate('Main', { screen, params });
      
      // Clear pending navigation
      await AsyncStorage.removeItem('pending_navigation');
      
      analytics.track('pending_navigation_processed', { screen });
    } catch (error) {
      console.error('Failed to process pending navigation:', error);
    }
  }

  /**
   * Store referral data for attribution
   */
  async storeReferralData(params) {
    try {
      if (params.ref || params.referrer) {
        await AsyncStorage.setItem('referral_data', JSON.stringify({
          referrer: params.ref || params.referrer,
          source: params.source,
          medium: params.medium,
          campaign: params.campaign,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      console.error('Failed to store referral data:', error);
    }
  }

  /**
   * Store campaign attribution data
   */
  async storeCampaignAttribution(attribution) {
    try {
      await AsyncStorage.setItem('campaign_attribution', JSON.stringify(attribution));
    } catch (error) {
      console.error('Failed to store campaign attribution:', error);
    }
  }

  /**
   * Handle campaign-specific navigation
   */
  handleCampaignNavigation(campaignName, params) {
    switch (campaignName) {
      case 'new-year-fitness':
        this.navigation.navigate('Campaign', {
          screen: 'NewYearFitness',
          params,
        });
        break;
      case 'summer-shred':
        this.navigation.navigate('Campaign', {
          screen: 'SummerShred',
          params,
        });
        break;
      case 'premium-trial':
        this.navigation.navigate('Main', {
          screen: 'Premium',
          params: { ...params, trial: true },
        });
        break;
      default:
        this.navigateToDefault(params);
    }
  }

  /**
   * Default navigation fallback
   */
  navigateToDefault(params = {}) {
    analytics.track('deep_link_fallback', { params });
    
    this.navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main', params }],
      })
    );
  }

  /**
   * Generate shareable links
   */
  generateShareLink(type, id, params = {}) {
    const baseUrl = this.config.baseUrl;
    const queryString = new URLSearchParams({
      source: 'app_share',
      ...params,
    }).toString();
    
    switch (type) {
      case 'workout':
        return `${baseUrl}/share/workout/${id}?${queryString}`;
      case 'achievement':
        return `${baseUrl}/achievement/${id}?${queryString}`;
      case 'invite':
        return `${baseUrl}/invite/${id}?${queryString}`;
      case 'premium':
        return `${baseUrl}/premium?${queryString}`;
      default:
        return `${baseUrl}?${queryString}`;
    }
  }

  /**
   * Get deep linking configuration
   */
  getLinkingConfig() {
    return {
      prefixes: [
        this.config.baseUrl,
        `${this.config.scheme}://`,
      ],
      config: {
        screens: {
          Auth: {
            screens: {
              Login: 'login',
              Signup: 'signup',
              ResetPassword: 'reset-password',
            },
          },
          Main: {
            screens: {
              Dashboard: 'dashboard',
              Workout: 'workout',
              WorkoutDetail: 'workout/:id',
              Achievements: 'achievements',
              Premium: 'premium',
            },
          },
          SharedWorkout: 'share/workout/:id',
          Help: 'help',
          Campaign: 'campaign/:name',
        },
      },
    };
  }
}

// Export singleton instance
const deepLinkingService = new DeepLinkingService();

// Convenience functions
export const initializeDeepLinking = (navigationRef) => deepLinkingService.initialize(navigationRef);
export const processPendingLink = () => deepLinkingService.processPendingLink();
export const processPendingNavigation = () => deepLinkingService.processPendingNavigation();
export const generateShareLink = (type, id, params) => deepLinkingService.generateShareLink(type, id, params);
export const getLinkingConfig = () => deepLinkingService.getLinkingConfig();

export default deepLinkingService;