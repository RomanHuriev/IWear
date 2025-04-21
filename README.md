# IWear - Mobile Fashion Assistant

**IWear** is a mobile application built with [Expo](https://expo.dev/) that allows users to take photos of clothing, analyze them using AI, and generate stylish outfits based on their wardrobe and weather conditions.

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

---

## 📸 Features

- Take photos of clothes directly from your phone
- Analyze clothing type, color, and style using AI
- Create outfit combinations from analyzed items
- Receive outfit suggestions based on the weather
- User authentication and personal wardrobe storage

---

## 🚀 Tech Stack

- **React Native + Expo** — frontend for iOS/Android
- **Firebase** — authentication, Firestore, Cloud Functions, and Storage
- **OpenRouter AI API** — for clothing image analysis
- **OpenWeatherMap API** — for weather-based outfit recommendations

---

## 🤝 Collaboration

This project is part of a full-stack mobile application developed in collaboration with [@mzslav](https://github.com/mzslav).

- 🔗 **Backend repository**: [IWear Back](https://github.com/mzslav/IWear_Back)

The backend is built with Firebase Cloud Functions and handles AI analysis, weather integration, and user data storage.


