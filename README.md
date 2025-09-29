# 🌦️ Weather Application (React + TypeScript + CSS)

## 📌 Overview
This is a **React TypeScript Weather Application** built as part of Lesson 4  
The app allows users to check real-time weather conditions for their **current location** as well as **searched locations**. Locations are persisted so users don’t have to re-search them.  

The application consumes data from a **third-party Weather API** and provides features like daily/hourly forecasts, multiple location support, dark mode, unit customization (Celsius/Fahrenheit), and offline caching.  

---

## 🚀 Features
- **Real-time Weather Info**
  - Current temperature, humidity, wind speed
  - Hourly and daily forecasts
- **Location-Based Forecasting**
  - Auto-detect current location (with permission)
  - Search weather for any city
  - Save multiple locations
- **Customization**
  - Light/Dark theme toggle
  - Switch between °C and °F
- **Performance**
  - Optimized for fast loading and smooth UI
- **Responsiveness**
  - Fully responsive design (320px → 1200px+)

---

## 🖼️ Screenshots
> _Add screenshots or demo GIFs here once available_

---

## 🛠️ Tech Stack
- **Frontend:** React 18, TypeScript,  CSS
- **State Management:** React Hooks (`useState`, `useEffect`)
- **Storage:** LocalStorage (persist saved locations & settings)
- **API:** OpenWeatherMap 
- **Build Tool:** Vite / Create React App (depending on setup)

---
⚙️ Installation & Setup

Clone the repo

git clone https://github.com/your-username/weather-app.git
cd weather-app


Install dependencies

npm install


Set up environment variables

Create a .env file in the root directory:

VITE_WEATHER_API_KEY=your_api_key_here


Get a free API key from OpenWeatherMap

Run the app

npm run dev


Build for production

npm run build

✅ Evaluation Criteria 

User-friendly, intuitive interface

Displays weather conditions (Temp, Humidity, Wind)

Location auto-detection + search

Supports theme toggle + unit conversion

Hourly and daily forecasts

Push notifications for severe weather

Responsive at common breakpoints (320px → 1200px)

Clean ReactTS code with reusable components, props, and state management

Code quality: camelCase, self-explanatory variables, modular functions, comments

🔒 Privacy & Security

User location data is only used for fetching weather information.

No personal data is stored or shared with third parties.

Weather data is cached locally for offline access.
