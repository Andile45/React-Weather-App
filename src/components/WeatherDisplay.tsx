import React from 'react';

// Weather condition images
import clearIcon from '../assets/clear.png';
import cloudIcon from '../assets/cloud.png';
import rainIcon from '../assets/rain.png';
import snowIcon from '../assets/snow.png';
import mistIcon from '../assets/mist.png';

interface WeatherDisplayProps {
  weatherData: any;
  units: 'metric' | 'imperial';
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weatherData, units }) => {
  // Get weather icon based on weather condition
  const getWeatherIcon = (weatherCode: string) => {
    if (weatherCode.includes('clear')) return clearIcon;
    if (weatherCode.includes('cloud')) return cloudIcon;
    if (weatherCode.includes('rain') || weatherCode.includes('drizzle')) return rainIcon;
    if (weatherCode.includes('snow')) return snowIcon;
    if (weatherCode.includes('mist') || weatherCode.includes('fog') || weatherCode.includes('haze')) return mistIcon;
    return clearIcon; // Default
  };

  if (!weatherData) return null;

  return (
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
          <span className="label">Feels Like</span>
          <span className="value">
            {Math.round(weatherData.main.feels_like)}°{units === 'metric' ? 'C' : 'F'}
          </span>
        </div>
        <div className="detail">
          <span className="label">Humidity</span>
          <span className="value">{weatherData.main.humidity}%</span>
        </div>
        <div className="detail">
          <span className="label">Wind</span>
          <span className="value">
            {Math.round(weatherData.wind.speed)} {units === 'metric' ? 'm/s' : 'mph'}
          </span>
        </div>
        <div className="detail">
          <span className="label">Pressure</span>
          <span className="value">{weatherData.main.pressure} hPa</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;