import React from 'react';

// Weather condition images
import clearIcon from '../assets/clear.png';
import cloudIcon from '../assets/cloud.png';
import rainIcon from '../assets/rain.png';
import snowIcon from '../assets/snow.png';
import mistIcon from '../assets/mist.png';

interface ForecastProps {
  lat: number;
  lon: number;
  units: 'metric' | 'imperial';
  viewMode: 'daily' | 'hourly';
  apiKey: string;
  theme: 'light' | 'dark';
}

interface ForecastItem {
  dt: number;
  main?: {
    temp: number;
  };
  temp?: {
    day: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
}

const Forecast: React.FC<ForecastProps> = ({ lat, lon, units, viewMode, apiKey, theme }) => {
  const [forecastData, setForecastData] = React.useState<ForecastItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchForecast = async () => {
      if (!lat || !lon) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use the 5-day forecast API for both hourly and daily forecasts
        // This API provides forecast data in 3-hour intervals for 5 days
        const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Forecast data not available');
        }
        
        const data = await response.json();
        
        // Process data based on viewMode
        if (viewMode === 'hourly') {
          // Get the next 24 hours (8 items for 3-hour steps)
          setForecastData(data.list.slice(0, 8));
        } else {
          // For daily forecast, get one forecast per day (every 8th item represents ~24 hours)
          // This gives us roughly one forecast per day for the next 5 days
          const dailyData = data.list.filter((item: any, index: number) => index % 8 === 0).slice(0, 5);
          setForecastData(dailyData);
        }
      } catch (err) {
        setError('Failed to fetch forecast data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [lat, lon, units, viewMode, apiKey]);

  // Get weather icon based on weather condition
  const getWeatherIcon = (weatherCode: string) => {
    if (weatherCode.includes('clear')) return clearIcon;
    if (weatherCode.includes('cloud')) return cloudIcon;
    if (weatherCode.includes('rain') || weatherCode.includes('drizzle')) return rainIcon;
    if (weatherCode.includes('snow')) return snowIcon;
    if (weatherCode.includes('mist') || weatherCode.includes('fog') || weatherCode.includes('haze')) return mistIcon;
    return clearIcon; // Default
  };

  // Format date/time based on viewMode
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    
    if (viewMode === 'hourly') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
  };

  // Get temperature based on viewMode and data structure
  const getTemperature = (item: ForecastItem) => {
    if (viewMode === 'hourly') {
      return Math.round(item.main?.temp || 0);
    } else {
      // For daily forecast using 5-day API, temperature is in item.main.temp
      return Math.round(item.main?.temp || 0);
    }
  };

  if (loading) {
    return <div className="loading">Loading forecast data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className={`forecast ${viewMode}`}>
      <h3>{viewMode === 'daily' ? 'Daily Forecast' : 'Hourly Forecast'}</h3>
      
      {forecastData.length === 0 ? (
        <div className="no-data">No forecast data available</div>
      ) : (
        <div className="forecast-items">
          {forecastData.map((item, index) => (
            <div key={index} className="forecast-item">
              <div className="forecast-time">{formatTime(item.dt)}</div>
              <img 
                src={getWeatherIcon(item.weather[0].main.toLowerCase())} 
                alt={item.weather[0].description} 
                className="forecast-icon" 
              />
              <div className="forecast-temp">
                {getTemperature(item)}°{units === 'metric' ? 'C' : 'F'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Forecast;