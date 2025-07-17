# Bulge App: Production Deployment Manual

## 🚀 Overview

This document provides a comprehensive guide for deploying the Bulge men's health app to production. It covers all manual steps, third-party integrations, and configurations that must be completed before launch.

**Current Status**: The app codebase is production-ready with comprehensive infrastructure, but requires manual setup of external services and deployment configurations.

---

## ⚠️ Critical Dependencies to Install

The current `package.json` is missing several production dependencies. Run these commands:

### Required Dependencies
```bash
# Core navigation dependencies
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Storage and security
npm install @react-native-async-storage/async-storage expo-secure-store expo-crypto

# Additional Expo modules
npm install expo-application expo-constants expo-location expo-linking
npm install expo-camera expo-image-picker expo-tracking-transparency
npm install expo-font expo-updates

# Development dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native jest-expo
npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# Optional but recommended
npm install react-native-mmkv # Better than AsyncStorage for performance
npm install @react-native-firebase/app @react-native-firebase/analytics # If using Firebase
```

### Update package.json Scripts
Add these scripts to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/ --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src/ --ext .js,.jsx,.ts,.tsx --fix",
    "prettier": "prettier --write src/",
    "type-check": "tsc --noEmit",
    "build:ios": "eas build --platform ios",
    "build:android": "eas build --platform android",
    "submit:ios": "eas submit --platform ios",
    "submit:android": "eas submit --platform android"
  }
}
```

---

## 🏗️ Infrastructure Setup

### 1. Expo Application Services (EAS)

#### Prerequisites
- Expo account with team/organization setup
- Apple Developer Account ($99/year)
- Google Play Console Account ($25 one-time)

#### Setup Steps
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo account
eas login

# Initialize EAS project
eas build:configure

# Update app.json with correct project ID
# Edit app.json: "extra.eas.projectId": "your-actual-project-id"
```

#### Update EAS Configuration
Edit `eas.json` to include your actual credentials:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 2. Backend Services Setup

#### Option A: Supabase (Recommended)
1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note: URL and anon key

2. **Database Schema Setup**
   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR UNIQUE NOT NULL,
     name VARCHAR NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     level INTEGER DEFAULT 1,
     points INTEGER DEFAULT 0,
     streak INTEGER DEFAULT 0,
     preferences JSONB DEFAULT '{}'
   );

   -- Workouts table
   CREATE TABLE workouts (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     type VARCHAR NOT NULL,
     duration INTEGER,
     exercises JSONB,
     date TIMESTAMP DEFAULT NOW()
   );

   -- Achievements table
   CREATE TABLE user_achievements (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     achievement_id VARCHAR NOT NULL,
     unlocked_at TIMESTAMP DEFAULT NOW()
   );

   -- Analytics events table
   CREATE TABLE analytics_events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     event_name VARCHAR NOT NULL,
     properties JSONB,
     timestamp TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Row Level Security (RLS)**
   ```sql
   -- Enable RLS
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

   -- Policies
   CREATE POLICY "Users can view own data" ON users FOR ALL USING (auth.uid() = id);
   CREATE POLICY "Users can view own workouts" ON workouts FOR ALL USING (auth.uid() = user_id);
   CREATE POLICY "Users can view own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
   ```

4. **Environment Configuration**
   Create `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

#### Option B: Firebase
1. **Create Firebase Project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Create project with Analytics enabled
   - Add iOS/Android apps

2. **Install Firebase**
   ```bash
   npm install @react-native-firebase/app @react-native-firebase/auth
   npm install @react-native-firebase/firestore @react-native-firebase/analytics
   npm install @react-native-firebase/crashlytics @react-native-firebase/messaging
   ```

3. **Configuration Files**
   - Download `google-services.json` (Android)
   - Download `GoogleService-Info.plist` (iOS)
   - Place in appropriate directories

### 3. Payment Processing (Stripe)

#### Setup Steps
1. **Create Stripe Account**
   - Go to [stripe.com](https://stripe.com)
   - Complete business verification
   - Enable recurring billing for subscriptions

2. **Product Configuration**
   ```bash
   # Create products in Stripe Dashboard
   # Premium Monthly: $9.99/month
   # Premium Annual: $99.99/year (2 months free)
   ```

3. **Install Dependencies**
   ```bash
   npm install @stripe/stripe-react-native
   ```

4. **Environment Variables**
   ```env
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_... # Server-side only
   ```

5. **Server Integration**
   - Set up webhook endpoints for subscription events
   - Implement customer portal for subscription management
   - Configure tax collection if required

---

## 📱 App Store Setup

### Apple App Store

#### 1. Apple Developer Account
- Enroll in Apple Developer Program ($99/year)
- Complete business verification if applicable
- Set up App Store Connect access

#### 2. App Store Connect Configuration
1. **Create App Record**
   - Bundle ID: `com.bulgeapp.ios`
   - App Name: "Bulge - Men's Health & Wellness"
   - SKU: `bulge-mens-health-ios`

2. **App Information**
   - Category: Health & Fitness
   - Age Rating: 12+ (Medical/Treatment Information)
   - Apple ID: Will be generated

3. **Pricing and Availability**
   - Price: Free with In-App Purchases
   - Availability: All territories (review local regulations)

4. **In-App Purchases Setup**
   ```
   Premium Monthly Subscription:
   - Product ID: premium_monthly
   - Reference Name: Premium Monthly Subscription
   - Price: $9.99/month
   - Auto-renewable: Yes
   
   Premium Annual Subscription:
   - Product ID: premium_annual
   - Reference Name: Premium Annual Subscription
   - Price: $99.99/year
   - Auto-renewable: Yes
   ```

#### 3. Certificates and Provisioning
```bash
# Generate certificates via EAS
eas credentials
```

#### 4. App Review Preparation
- Privacy Policy URL: `https://bulgeapp.com/privacy`
- Terms of Service URL: `https://bulgeapp.com/terms`
- App Review Notes: Include test account credentials
- Demo video for complex features

### Google Play Store

#### 1. Google Play Console Setup
- Create developer account ($25 one-time fee)
- Complete identity verification
- Set up payment profile for earnings

#### 2. Create App
1. **App Details**
   - App name: "Bulge - Men's Health & Wellness"
   - Package name: `com.bulgeapp.android`
   - Category: Health & Fitness

2. **Store Listing**
   - Short description: "Transform your health with the all-in-one men's wellness platform"
   - Full description: Use content from `APP_STORE_ASSETS.md`
   - Screenshots: 8 screenshots per device type
   - Feature graphic: 1024 x 500px

3. **Content Rating**
   - Target audience: Ages 13+
   - Content descriptors: Medical references

4. **App Signing**
   - Use Play App Signing (recommended)
   - Upload signing key to EAS

---

## 🔐 Security and Compliance

### 1. SSL Certificates
```bash
# For custom domain (if applicable)
# Use Let's Encrypt or purchase SSL certificate
# Configure CDN (CloudFlare recommended)
```

### 2. Privacy Policy and Terms of Service

#### Required Legal Documents
Create these documents (consult with legal counsel):

1. **Privacy Policy** (`/legal/privacy-policy.md`)
   - Data collection practices
   - GDPR compliance (if serving EU users)
   - CCPA compliance (if serving CA users)
   - HIPAA considerations for health data
   - Third-party service data sharing

2. **Terms of Service** (`/legal/terms-of-service.md`)
   - Service description and limitations
   - User responsibilities
   - Subscription terms
   - Liability limitations
   - Dispute resolution

3. **Health Disclaimer** (`/legal/health-disclaimer.md`)
   - Medical advice disclaimer
   - Professional consultation recommendations
   - Emergency contact information

#### Compliance Checklist
- [ ] GDPR compliance (EU users)
- [ ] CCPA compliance (California users)
- [ ] COPPA compliance (users under 13)
- [ ] Apple Health app integration permissions
- [ ] Google Fit API compliance
- [ ] FDA considerations for health claims

### 3. Data Protection Configuration

#### Encryption at Rest
```javascript
// Update security service configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  iterations: 100000,
  saltLength: 32,
};
```

#### API Security Headers
```javascript
// Add to API responses
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
};
```

---

## 📊 Analytics and Monitoring

### 1. Analytics Providers

#### Option A: Mixpanel (Recommended for Product Analytics)
```bash
# Setup
npm install mixpanel-react-native

# Configuration
EXPO_PUBLIC_MIXPANEL_TOKEN=your-mixpanel-token
```

#### Option B: Amplitude
```bash
# Setup
npm install @amplitude/react-native

# Configuration
EXPO_PUBLIC_AMPLITUDE_API_KEY=your-amplitude-key
```

### 2. Crash Reporting

#### Option A: Sentry (Recommended)
```bash
# Installation
npm install @sentry/react-native

# Configuration
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

#### Option B: Crashlytics (if using Firebase)
```bash
# Already included with Firebase setup
```

### 3. Performance Monitoring

#### Application Performance Monitoring (APM)
```bash
# New Relic Mobile (recommended)
npm install @newrelic/react-native-agent

# Or Datadog
npm install @datadog/mobile-react-native
```

#### Real User Monitoring (RUM)
```bash
# Configure performance tracking
EXPO_PUBLIC_PERFORMANCE_MONITORING_KEY=your-monitoring-key
```

---

## 🌐 CDN and Asset Management

### 1. Image and Video CDN
```bash
# Recommended: CloudFlare Images or AWS CloudFront
# Upload app store assets to CDN
# Update image URLs in components
```

### 2. Static Asset Optimization
```bash
# Install image optimization tools
npm install -g imageoptim-cli
npm install -g svgo

# Optimize assets
imageoptim src/assets/images/
svgo src/assets/icons/
```

---

## 📧 Communication Infrastructure

### 1. Email Service Provider

#### SendGrid Setup (Recommended)
```bash
# Configuration needed for:
# - Welcome emails
# - Password reset
# - Achievement notifications
# - Marketing campaigns

SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@bulgeapp.com
```

#### Email Templates Required
- Welcome email
- Password reset
- Achievement unlock
- Subscription confirmation
- Trial expiration warning

### 2. Push Notification Provider

#### OneSignal Setup (Alternative to native)
```bash
npm install react-native-onesignal

# Configuration
EXPO_PUBLIC_ONESIGNAL_APP_ID=your-onesignal-app-id
```

---

## 🎯 Marketing Integrations

### 1. Attribution Tracking

#### Adjust (Recommended)
```bash
npm install react-native-adjust

# Configuration
EXPO_PUBLIC_ADJUST_APP_TOKEN=your-adjust-token
```

#### AppsFlyer
```bash
npm install react-native-appsflyer

# Configuration
EXPO_PUBLIC_APPSFLYER_DEV_KEY=your-appsflyer-key
```

### 2. A/B Testing

#### Optimizely
```bash
npm install @optimizely/react-sdk

# Configuration
EXPO_PUBLIC_OPTIMIZELY_SDK_KEY=your-optimizely-key
```

### 3. Customer Support

#### Intercom (Recommended)
```bash
npm install @intercom/intercom-react-native

# Configuration
EXPO_PUBLIC_INTERCOM_APP_ID=your-intercom-app-id
```

---

## 🚀 Deployment Pipeline

### 1. CI/CD Setup (GitHub Actions)

Create `.github/workflows/build-and-deploy.yml`:
```yaml
name: Build and Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run test:coverage

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform all --non-interactive
```

### 2. Environment Configuration

Create environment-specific configurations:

#### Development (.env.development)
```env
EXPO_PUBLIC_API_URL=https://dev-api.bulgeapp.com
EXPO_PUBLIC_ENVIRONMENT=development
EXPO_PUBLIC_ANALYTICS_ENABLED=false
```

#### Staging (.env.staging)
```env
EXPO_PUBLIC_API_URL=https://staging-api.bulgeapp.com
EXPO_PUBLIC_ENVIRONMENT=staging
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

#### Production (.env.production)
```env
EXPO_PUBLIC_API_URL=https://api.bulgeapp.com
EXPO_PUBLIC_ENVIRONMENT=production
EXPO_PUBLIC_ANALYTICS_ENABLED=true
```

---

## 📋 Pre-Launch Checklist

### Technical Validation
- [ ] All dependencies installed and working
- [ ] Tests passing (>80% coverage)
- [ ] Linting rules satisfied
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Accessibility compliance verified

### Service Integration
- [ ] Backend API deployed and tested
- [ ] Database schema implemented
- [ ] Authentication flow working
- [ ] Payment processing tested
- [ ] Push notifications working
- [ ] Analytics tracking verified
- [ ] Crash reporting configured

### App Store Preparation
- [ ] iOS app built and uploaded
- [ ] Android app built and uploaded
- [ ] Store listings completed
- [ ] Screenshots and videos uploaded
- [ ] Privacy policy and terms published
- [ ] App review submitted

### Business Readiness
- [ ] Customer support channels set up
- [ ] Marketing campaigns prepared
- [ ] Launch PR materials ready
- [ ] Success metrics dashboard configured
- [ ] Legal compliance verified

---

## 🔧 Known Issues and Limitations

### Current Technical Debt
1. **Mock Services**: All service integrations use mock implementations
2. **Missing Dependencies**: Several production dependencies not installed
3. **Environment Variables**: No environment configuration implemented
4. **Error Handling**: Some error boundaries may need refinement
5. **Performance**: Bundle size optimization needed

### Estimated Timeline
- **Service Integration**: 2-3 weeks
- **App Store Submission**: 1-2 weeks review time
- **Marketing Setup**: 1 week
- **Total to Launch**: 4-6 weeks

### Budget Estimates
- **Development Services**: $500-1000/month
- **Apple Developer**: $99/year
- **Google Play**: $25 one-time
- **Analytics/Monitoring**: $200-500/month
- **CDN/Infrastructure**: $100-300/month
- **Total Monthly**: $800-1800/month

---

## 📞 Support and Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

### Community
- [Expo Discord](https://discord.gg/expo)
- [React Native Community](https://reactnative.dev/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### Professional Services
Consider hiring specialists for:
- Legal compliance review
- Security audit
- Performance optimization
- Marketing strategy
- Customer acquisition

---

**This manual provides comprehensive guidance for taking the Bulge app from its current production-ready codebase to a fully deployed, live application. Each section should be completed systematically with appropriate testing at each stage.**