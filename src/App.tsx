import { useState, useEffect } from 'react'
import './App.css'
import type { WeatherData } from './types/weather'
import WeatherDisplay from './components/WeatherDisplay'
import SearchBar from './components/SearchBar'
import SavedLocations from './components/SavedLocations'
import Settings from './components/Settings'
import Forecast from './components/Forecast'
import notFoundIcon from './assets/404.png'

declare global {
  interface Window {
    geolocationTimeout?: number;
  }
}

function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'daily' | 'hourly'>('hourly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_KEY = '8ccc15a995fa432052d27ee0d8e470a5';

  useEffect(() => {
    const savedLocationsFromStorage = localStorage.getItem('savedLocations');
    if (savedLocationsFromStorage) {
      setSavedLocations(JSON.parse(savedLocationsFromStorage));
    }

    const savedUnits = localStorage.getItem('units');
    if (savedUnits) {
      setUnits(savedUnits as 'metric' | 'imperial');
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    }

    const hasLocationPermission = localStorage.getItem('locationPermissionGranted');
    if (hasLocationPermission === 'true') {
      requestLocation();
    } else {
      const lastLocation = localStorage.getItem('lastLocation');
      if (lastLocation) {
        fetchWeatherByCity(lastLocation);
      }
    }
  }, []); 

  useEffect(() => {
    const lastLocation = localStorage.getItem('lastLocation');
    if (lastLocation && !weatherData && !loading) {
      const timer = setTimeout(() => {
        if (!weatherData && !loading) {
          fetchWeatherByCity(lastLocation);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [weatherData, loading]);

  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  useEffect(() => {
    localStorage.setItem('units', units);
    localStorage.setItem('theme', theme);
  }, [units, theme]);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Please search for a city manually.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    if (window.geolocationTimeout) {
      clearTimeout(window.geolocationTimeout);
    }
    
    window.geolocationTimeout = setTimeout(() => {
      setError("Location request timed out. Please try searching for a city manually.");
      setLoading(false);
    }, 10000);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (window.geolocationTimeout) {
          clearTimeout(window.geolocationTimeout);
        }
        const { latitude, longitude } = position.coords;
        localStorage.setItem('locationPermissionGranted', 'true');
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        if (window.geolocationTimeout) {
          clearTimeout(window.geolocationTimeout);
        }
        
        if (error.code === error.PERMISSION_DENIED) {
          localStorage.setItem('locationPermissionGranted', 'false');
        }
        
        let errorMessage = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access was denied. Please enable location services or search for a city manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Please check your connection or search for a city manually.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again or search for a city manually.";
            break;
          default:
            errorMessage += "An unknown error occurred. Please try again or search for a city manually.";
            break;
        }
        
        setError(errorMessage);
        setLoading(false);
        
        const lastLocation = localStorage.getItem('lastLocation');
        if (lastLocation && error.code !== error.PERMISSION_DENIED) {
          setTimeout(() => {
            fetchWeatherByCity(lastLocation);
          }, 2000);
        }
      },
      { 
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Location not found');
        }
        throw new Error('Weather data not available');
      }
      
      const data: WeatherData = await response.json();
      setWeatherData(data);
      
      localStorage.setItem('lastLocation', data.name);
      
      if (data.name && !savedLocations.includes(data.name)) {
        setSavedLocations([...savedLocations, data.name]);
      }
    } catch (err) {
      console.error("Error fetching weather by coords:", err);
      setError('Failed to fetch weather data. Please try again or search for a city.');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${units}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found');
        }
        throw new Error('Weather data not available');
      }
      
      const data: WeatherData = await response.json();
      setWeatherData(data);
      
      localStorage.setItem('lastLocation', cityName);
      
      if (!savedLocations.includes(cityName)) {
        setSavedLocations([...savedLocations, cityName]);
      }
    } catch (err) {
      setError('City not found. Please check the spelling and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (cityName: string) => {
    fetchWeatherByCity(cityName);
  };

  const handleLocationSelect = (location: string) => {
    fetchWeatherByCity(location);
  };

  const handleRemoveLocation = (location: string) => {
    setSavedLocations(savedLocations.filter(loc => loc !== location));
  };

  const toggleUnits = () => {
    const newUnits = units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnits);
    if (weatherData) {
      fetchWeatherByCity(weatherData.name);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`app ${theme}`}>
      <div className="container">
        <div className="app-header">
          <h1 className="app-title">Weather</h1>
          <Settings
            units={units}
            theme={theme}
            onToggleUnits={toggleUnits}
            onToggleTheme={toggleTheme}
          />
        </div>

        <SearchBar
          onSearch={handleSearch}
          onLocationClick={requestLocation}
          loading={loading}
        />

        {savedLocations.length > 0 && (
          <SavedLocations
            locations={savedLocations}
            onSelectLocation={handleLocationSelect}
            onRemoveLocation={handleRemoveLocation}
          />
        )}

        {error && (
          <div className="error-message">
            {(error.includes("City not found") || error.includes("Location not found")) && (
              <img
                src={notFoundIcon}
                alt="Location not found"
                className="error-icon"
              />
            )}
            <p>{error}</p>
            <button onClick={() => setError(null)} className="error-dismiss">Dismiss</button>
          </div>
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}

        {weatherData && !loading && !error && (
          <div className="weather-content">
            <WeatherDisplay weatherData={weatherData} units={units} />
            
            <div className="forecast-section">
              <div className="view-mode">
                <button
                  className={`view-button ${viewMode === "hourly" ? "active" : ""}`}
                  onClick={() => setViewMode("hourly")}
                >
                  Hourly
                </button>
                <button
                  className={`view-button ${viewMode === "daily" ? "active" : ""}`}
                  onClick={() => setViewMode("daily")}
                >
                  Daily
                </button>
              </div>

              <Forecast
                lat={weatherData.coord.lat}
                lon={weatherData.coord.lon}
                units={units}
                viewMode={viewMode}
                apiKey={API_KEY}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App
