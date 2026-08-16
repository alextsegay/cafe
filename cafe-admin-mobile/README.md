# Café Admin Mobile

React Native (Expo SDK 54) admin app for managing the café menu from a phone.

## Features

- 🔐 Login with JWT (stored securely in `expo-secure-store`)
- 🍽️ Menu item list with search
- ➕ Create / edit / delete menu items
- 🗂️ Assign items to categories
- 📷 Upload item photos from the device gallery
- 🔄 Session expiry handling — returns to login when the token expires

## Requirements

- Node.js 18+
- An [Expo Go](https://expo.dev/go) app on your device matching **SDK 54**
- The backend deployed (or running locally)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure the API URL:

```bash
cp .env.example .env
```

Edit `.env` and set `EXPO_PUBLIC_API_URL` to your backend, e.g.:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

> `EXPO_PUBLIC_` variables are inlined at build time — restart `expo start` after
> changing them. When unset, the app falls back to the production URL.

3. Start the app:

```bash
npm start
```

Scan the QR code with Expo Go (make sure the phone and computer are on the same
network for local development).

## Scope

This is a lightweight companion to the web admin dashboard. It currently covers
menu items and categories. Gallery, settings, QR codes, notifications, and
password change remain available on the web admin
(`/admin` on the backend).
