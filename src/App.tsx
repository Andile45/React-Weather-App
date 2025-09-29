import { useState, useEffect } from 'react'
import './App.css'
import backgroundImage from './assets/background.jpg'
import Forecast from './components/Forecast'


// Weather condition images
import clearIcon from './assets/clear.png'
import cloudIcon from './assets/cloud.png'
import rainIcon from './assets/rain.png'
import snowIcon from './assets/snow.png'
import mistIcon from './assets/mist.png'
import notFoundIcon from './assets/404.png'

// Declare the geolocationTimeout property on window
declare global {
  interface Window {
    geolocationTimeout?: number;
  }
}

function App() {
  // State variables
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [savedLocations, setSavedLocations] = useState<string[]>([]);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'daily' | 'hourly'>('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API key for OpenWeatherMap
  const API_KEY = '8ccc15a995fa432052d27ee0d8e470a5';

  // Load saved locations from localStorage on component mount
  useEffect(() => {
    const savedLocationsFromStorage = localStorage.getItem('savedLocations');
    if (savedLocationsFromStorage) {
      setSavedLocations(JSON.parse(savedLocationsFromStorage));
    }

    // Load user preferences
    const savedUnits = localStorage.getItem('units');
    if (savedUnits) {
      setUnits(savedUnits as 'metric' | 'imperial');
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    }

    // Check if user has previously allowed location access
    const hasLocationPermission = localStorage.getItem('locationPermissionGranted');
    if (hasLocationPermission === 'true') {
      // Only auto-request location if user previously granted permission
      requestLocation();
    } else {
      
      const lastLocation = localStorage.getItem('lastLocation');
      if (lastLocation) {
        console.log("Using saved location:", lastLocation);
        fetchWeatherByCity(lastLocation);
      }
    }
  }, []); 

  // Separate useEffect for fallback to last location
  useEffect(() => {
    const lastLocation = localStorage.getItem('lastLocation');
    if (lastLocation && !weatherData && !loading) {
      // Only use last location if we don't have weather data and we're not currently loading
      const timer = setTimeout(() => {
        if (!weatherData && !loading) {
          console.log("Using fallback location:", lastLocation);
          fetchWeatherByCity(lastLocation);
        }
      }, 5000); // Wait 5 seconds before falling back to last location

      return () => clearTimeout(timer);
    }
  }, [weatherData, loading]);

  // Fetch weather alerts for the given coordinates
  const fetchWeatherAlerts = async (lat: number, lon: number) => {
    try {

      console.log(`Checking weather alerts for coordinates: ${lat}, ${lon}`);
      

    } catch (error) {
      console.log('Weather alerts not available:', error);
    }
  };

  // Improved function to handle geolocation with better error handling
  const requestLocation = () => {
    console.log("🔍 Starting geolocation request...");
    console.log("🌐 Current URL:", window.location.href);
    console.log("🔒 Is HTTPS:", window.location.protocol === 'https:');
    console.log("📱 User Agent:", navigator.userAgent);
    
    if (!navigator.geolocation) {
      console.error(" Geolocation not supported by browser");
      setError("Geolocation is not supported by your browser. Please search for a city manually.");
      return;
    }
    
    console.log("Geolocation API is available");
    
    // Check permissions API if available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        console.log(" Geolocation permission state:", result.state);
        if (result.state === 'denied') {
          console.warn("Geolocation permission is denied");
          setError("Location access is denied. Please enable location services in your browser settings and refresh the page, or search for a city manually.");
          return;
        }
      }).catch((err) => {
        console.log("ℹPermissions API not fully supported:", err);
      });
    }
    
    setLoading(true);
    setError(null);
    
    // Clear any previous timeout
    if (window.geolocationTimeout) {
      clearTimeout(window.geolocationTimeout);
    }
    
    console.log("⏰ Setting 10-second timeout for geolocation request");
    
    // Set a timeout in case geolocation takes too long
    window.geolocationTimeout = setTimeout(() => {
      console.error("⏱️ Location request timed out after 10 seconds");
      setError("Location request timed out. This might be due to:\n• Slow GPS signal\n• Browser security restrictions\n• Network issues\n\nPlease try searching for a city manually or click 'Get My Location' to try again.");
      setLoading(false);
    }, 10000); // Reduced timeout to 10 seconds for better UX
    
    console.log("📍 Calling navigator.geolocation.getCurrentPosition...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Geolocation success!");
        if (window.geolocationTimeout) {
          clearTimeout(window.geolocationTimeout);
        }
        const { latitude, longitude } = position.coords;
        console.log("📍 Got coordinates:", { latitude, longitude, accuracy: position.coords.accuracy });
        
        // Save permission granted status
        localStorage.setItem('locationPermissionGranted', 'true');
        
        fetchWeatherByCoords(latitude, longitude);
      },
      (error) => {
        console.error(" Geolocation error occurred:");
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        if (window.geolocationTimeout) {
          clearTimeout(window.geolocationTimeout);
        }
        
        // Save permission denied status
        if (error.code === error.PERMISSION_DENIED) {
          localStorage.setItem('locationPermissionGranted', 'false');
        }
        
        let errorMessage = "Unable to get your location. ";
        let debugInfo = "";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access was denied. Please:\n• Enable location services in your browser\n• Allow location access for this site\n• Refresh the page and try again\n\nOr search for a city manually.";
            debugInfo = "Permission denied - user or browser blocked location access";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. This could be due to:\n• No GPS signal\n• Network connectivity issues\n• Location services disabled\n\nPlease check your connection or search for a city manually.";
            debugInfo = "Position unavailable - GPS/network issues";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. This might be due to:\n• Weak GPS signal\n• Slow network connection\n• Browser restrictions\n\nPlease try again or search for a city manually.";
            debugInfo = "Timeout - request took too long";
            break;
          default:
            errorMessage += "An unknown error occurred. Please try again or search for a city manually.";
            debugInfo = `Unknown error (code: ${error.code})`;
            break;
        }
        
        console.error(" Debug info:", debugInfo);
        console.error(" Possible causes:");
        console.error("• HTTP instead of HTTPS (current:", window.location.protocol, ")");
        console.error("• Browser security settings");
        console.error("• Location services disabled");
        console.error("• Network connectivity issues");
        
        setError(errorMessage);
        setLoading(false);
        
        // Try to use last saved location as fallback
        const lastLocation = localStorage.getItem('lastLocation');
        if (lastLocation && error.code !== error.PERMISSION_DENIED) {
          console.log(" Attempting fallback to last location:", lastLocation);
          setTimeout(() => {
            console.log("Using fallback location:", lastLocation);
            fetchWeatherByCity(lastLocation);
          }, 2000); // Wait 2 seconds before using fallback
        }
      },
      { 
        enableHighAccuracy: false, // Changed to false for better compatibility
        timeout: 10000, // Reduced timeout
        maximumAge: 300000 // Allow cached position up to 5 minutes old
      }
    );
  };

  // Save locations to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  // Save user preferences to localStorage
  useEffect(() => {
    localStorage.setItem('units', units);
    localStorage.setItem('theme', theme);
  }, [units, theme]);

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Fetch weather data by coordinates
  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching weather for coordinates:", lat, lon);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Location not found');
        }
        throw new Error('Weather data not available');
      }
      
      const data = await response.json();
      console.log("Weather data received:", data);
      
      setWeatherData(data);
      setCity(data.name);
      
      // Save as last location
      localStorage.setItem('lastLocation', data.name);
      
      // Add to saved locations if not already saved and has a name
      if (data.name && !savedLocations.includes(data.name)) {
        setSavedLocations([...savedLocations, data.name]);
      }

      // Check for weather alerts
      fetchWeatherAlerts(lat, lon);
    } catch (err) {
      console.error("Error fetching weather by coords:", err);
      setError('Failed to fetch weather data. Please try again or search for a city.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch weather data by city name
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
      
      const data = await response.json();
      setWeatherData(data);
      setCity(cityName);
      
      // Save as last location
      localStorage.setItem('lastLocation', cityName);
      
      // Add to saved locations if not already saved
      if (!savedLocations.includes(cityName)) {
        setSavedLocations([...savedLocations, cityName]);
      }

      // Check for weather alerts
      fetchWeatherAlerts(data.coord.lat, data.coord.lon);
    } catch (err) {
      setError('City not found. Please check the spelling and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherByCity(city);
    }
  };

  // Toggle temperature units
  const toggleUnits = () => {
    setUnits(units === 'metric' ? 'imperial' : 'metric');
    // Refetch weather data with new units if we have a city
    if (weatherData) {
      fetchWeatherByCity(city);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Get weather icon based on weather condition
  const getWeatherIcon = (weatherCode: string) => {
    if (weatherCode.includes('clear')) return clearIcon;
    if (weatherCode.includes('cloud')) return cloudIcon;
    if (weatherCode.includes('rain') || weatherCode.includes('drizzle')) return rainIcon;
    if (weatherCode.includes('snow')) return snowIcon;
    if (weatherCode.includes('mist') || weatherCode.includes('fog') || weatherCode.includes('haze')) return mistIcon;
    return clearIcon; // Default
  };

  return (
    <div className={`app ${theme}`} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="container">
        <h1 className="app-title">Weather App</h1>
        
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {(error.includes('City not found') || error.includes('Location not found')) && (
              <img 
                src={notFoundIcon} 
                alt="Location not found" 
                className="error-icon" 
                style={{ width: '64px', height: '64px', marginBottom: '10px', display: 'block', margin: '0 auto 10px auto' }}
              />
            )}
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        {/* Search Form */}
        <div className="search-container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter city name"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>Search</button>
          </form>
          
          {/* Manual location request button */}
          <div className="location-controls">
            <button 
              onClick={requestLocation} 
              className="location-button"
              disabled={loading}
              title="Get weather for your current location"
            >
              📍 Get My Location
            </button>
          </div>
        </div>
        
        {/* Location detection happens automatically */}
        
        {/* Settings */}
        <div className="settings">
          <button onClick={toggleUnits} className="settings-button">
            {units === 'metric' ? '°C' : '°F'}
          </button>
          <button onClick={toggleTheme} className="settings-button">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
        
        {/* Saved Locations */}
        <div className="saved-locations">
          <h3>Saved Locations</h3>
          <div className="location-list">
            {savedLocations.map((location, index) => (
              <button
                key={index}
                onClick={() => fetchWeatherByCity(location)}
                className="location-button"
              >
                {location}
              </button>
            ))}
          </div>
        </div>
        
        {/* View Mode Toggle */}
        <div className="view-mode">
          <button
            className={`view-button ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            Daily
          </button>
          <button
            className={`view-button ${viewMode === 'hourly' ? 'active' : ''}`}
            onClick={() => setViewMode('hourly')}
          >
            Hourly
          </button>
        </div>
        
        {/* Loading State */}
        {loading && <div className="loading">Loading weather data...</div>}
        
        {/* Error Message */}
        {error && <div className="error">{error}</div>}
        
        {/* Weather Display */}
        {weatherData && !loading && !error && (
          <div className="weather-display">
            <h2>{weatherData.name}, {weatherData.sys.country}</h2>
            
            <div className="weather-main">
              <img
                src={getWeatherIcon(weatherData.weather[0].main.toLowerCase())}
                alt={weatherData.weather[0].description}
                className="weather-icon"
              />
              <div className="temperature">
                {Math.round(weatherData.main.temp)}°{units === 'metric' ? 'C' : 'F'}
              </div>
              <div className="weather-description">
                {weatherData.weather[0].description}
              </div>
            </div>
            
            <div className="weather-details">
              <div className="detail">
                <span className="label">Feels Like:</span>
                <span className="value">
                  {Math.round(weatherData.main.feels_like)}°{units === 'metric' ? 'C' : 'F'}
                </span>
              </div>
              <div className="detail">
                <span className="label">Humidity:</span>
                <span className="value">{weatherData.main.humidity}%</span>
              </div>
              <div className="detail">
                <span className="label">Wind:</span>
                <span className="value">
                  {Math.round(weatherData.wind.speed)} {units === 'metric' ? 'm/s' : 'mph'}
                </span>
              </div>
              <div className="detail">
                <span className="label">Pressure:</span>
                <span className="value">{weatherData.main.pressure} hPa</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Forecast Section */}
        <Forecast 
          lat={weatherData?.coord?.lat || 0}
          lon={weatherData?.coord?.lon || 0}
          units={units}
          viewMode={viewMode}
          apiKey={API_KEY}
          theme={theme}
        />
        
        {/* Weather Alerts */}
        <div className="weather-alerts">
          {/* This will be populated with actual weather alerts */}
        </div>
      </div>
    </div>
  )
}

export default App
