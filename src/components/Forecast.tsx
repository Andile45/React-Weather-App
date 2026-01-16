import React from 'react';
import type { ForecastItem } from '../types/weather';
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
}

const Forecast: React.FC<ForecastProps> = ({ lat, lon, units, viewMode, apiKey }) => {
  const [forecastData, setForecastData] = React.useState<ForecastItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchForecast = async () => {
      if (!lat || !lon) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error('Forecast data not available');
        }
        
        const data = await response.json();
        
        if (viewMode === 'hourly') {
          setForecastData(data.list.slice(0, 8));
        } else {
          const dailyData: ForecastItem[] = [];
          const seenDays = new Set<string>();
          
          data.list.forEach((item: ForecastItem) => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!seenDays.has(dayKey) && dailyData.length < 5) {
              seenDays.add(dayKey);
              dailyData.push(item);
            }
          });
          
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

  const getWeatherIcon = (weatherCode: string) => {
    if (weatherCode.includes('clear')) return clearIcon;
    if (weatherCode.includes('cloud')) return cloudIcon;
    if (weatherCode.includes('rain') || weatherCode.includes('drizzle')) return rainIcon;
    if (weatherCode.includes('snow')) return snowIcon;
    if (weatherCode.includes('mist') || weatherCode.includes('fog') || weatherCode.includes('haze')) return mistIcon;
    return clearIcon;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    
    if (viewMode === 'hourly') {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
    }
  };

  if (!lat || !lon) return null;

  if (loading) {
    return (
      <div className="forecast">
        <div className="forecast-loading">Loading forecast...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forecast">
        <div className="forecast-error">{error}</div>
      </div>
    );
  }

  if (forecastData.length === 0) {
    return null;
  }

  return (
    <div className={`forecast forecast-${viewMode}`}>
      <div className="forecast-header">
        <h3 className="forecast-title">
          {viewMode === 'hourly' ? '24-Hour Forecast' : '5-Day Forecast'}
        </h3>
      </div>
      <div className="forecast-items">
        {forecastData.map((item, index) => (
          <div key={`${item.dt}-${index}`} className="forecast-item">
            <div className="forecast-time">{formatTime(item.dt)}</div>
            <img 
              src={getWeatherIcon(item.weather[0].main.toLowerCase())} 
              alt={item.weather[0].description} 
              className="forecast-icon" 
            />
            <div className="forecast-temp">
              {Math.round(item.main.temp)}°{units === 'metric' ? 'C' : 'F'}
            </div>
            {viewMode === 'hourly' && (
              <div className="forecast-details">
                <span className="forecast-humidity">{item.main.humidity}%</span>
                <span className="forecast-wind">{Math.round(item.wind.speed)} {units === 'metric' ? 'm/s' : 'mph'}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Forecast;