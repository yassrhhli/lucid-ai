# LUCID.AI — Guide de déploiement

## 1. Setup initial

```bash
# Créer le projet Expo
npx create-expo-app@latest lucid-ai --template blank-typescript
cd lucid-ai

# Copier tous les fichiers du projet
# Installer les dépendances
npm install

# Copier et remplir le fichier d'environnement
cp .env.example .env
```

## 2. Supabase

```bash
# Installer Supabase CLI
npm install -g supabase

# Login
supabase login

# Init (si nouveau projet)
supabase init

# Lier au projet Supabase
supabase link --project-ref YOUR_PROJECT_ID

# Exécuter la migration SQL
# → Aller dans Supabase Dashboard > SQL Editor
# → Copier/coller le contenu de supabase/migrations/001_initial_schema.sql
# → Exécuter

# Déployer les Edge Functions
supabase functions deploy interpret-dream
supabase functions deploy revenuecat-webhook

# Configurer les secrets des Edge Functions
supabase secrets set OPENAI_API_KEY=sk-YOUR_KEY
supabase secrets set REVENUECAT_WEBHOOK_SECRET=YOUR_SECRET
```

## 3. Supabase Auth — Activer les providers

Dans Supabase Dashboard > Authentication > Providers :
- ✅ Email (activé par défaut)
- ✅ Google (créer un projet Google Cloud, obtenir OAuth credentials)
- ✅ Apple (dans Apple Developer, créer un Service ID)

## 4. RevenueCat

1. Créer un compte sur revenuecat.com
2. Créer un projet "Lucid AI"
3. Ajouter les apps iOS et Android
4. Créer les produits dans App Store Connect / Google Play Console :
   - `lucid_pro_monthly` → $4.99/mois
   - `lucid_pro_annual` → $34.99/an  
   - `lucid_pro_lifetime` → $79 (one-time)
5. Créer un Offering "default" avec les 3 packages
6. Configurer l'Entitlement "pro"
7. Configurer le Webhook → URL: `https://YOUR_PROJECT.supabase.co/functions/v1/revenuecat-webhook`

## 5. AdMob

1. Créer un compte AdMob
2. Créer une app iOS et Android
3. Créer 3 Ad Units par plateforme :
   - Banner
   - Interstitial  
   - Rewarded
4. Remplir les IDs dans `.env`
5. Ajouter les App IDs dans `app.json`

## 6. Build & Deploy

```bash
# Installer EAS CLI
npm install -g eas-cli
eas login

# Configurer EAS
eas build:configure

# Build iOS (TestFlight)
eas build --platform ios --profile preview

# Build Android (Play Store internal testing)
eas build --platform android --profile preview

# Build production
eas build --platform all --profile production

# Submit aux stores
eas submit --platform ios
eas submit --platform android
```

## 7. Lancer en local pour tester

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Sur device physique (meilleur pour tester les pubs)
npx expo start
# Scanner le QR code avec Expo Go
```

## 8. Variables d'environnement requises

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=
EXPO_PUBLIC_ADMOB_BANNER_ID_IOS=
EXPO_PUBLIC_ADMOB_BANNER_ID_ANDROID=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_IOS=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID_ANDROID=
EXPO_PUBLIC_ADMOB_REWARDED_ID_IOS=
EXPO_PUBLIC_ADMOB_REWARDED_ID_ANDROID=
```

Secrets Supabase Edge Functions (via `supabase secrets set`) :
```
OPENAI_API_KEY=
REVENUECAT_WEBHOOK_SECRET=
```

## 9. Checklist avant launch

- [ ] SQL migration exécutée
- [ ] Edge Functions déployées et testées
- [ ] Secrets configurés dans Supabase
- [ ] RevenueCat produits créés et Offering configuré
- [ ] AdMob App IDs dans app.json
- [ ] Google/Apple Sign-In configurés dans Supabase Auth
- [ ] Test achat in-app (mode sandbox)
- [ ] Test interstitiel et rewarded (mode test)
- [ ] Screenshots App Store préparés (6,5" et 5,5" pour iOS)
- [ ] Description App Store rédigée avec keywords ASO
- [ ] Privacy Policy + Terms of Service hébergés
- [ ] Rating prompt configuré (expo-store-review)
```
