import React from 'react';
import DarkMode from '../assets/dark-mode.png'
import LightMode from '../assets/light-mode.png'

interface SettingsProps {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark';
  onToggleUnits: () => void;
  onToggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ units, theme, onToggleUnits, onToggleTheme }) => {
  return (
    <div className="settings">
      <button 
        onClick={onToggleUnits} 
        className="settings-button"
        title={`Switch to ${units === 'metric' ? 'Fahrenheit' : 'Celsius'}`}
      >
        {units === 'metric' ? '°C' : '°F'}
      </button>
      <button 
        onClick={onToggleTheme} 
        className="settings-button"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <img
          src={theme === "light" ? DarkMode : LightMode}
          alt={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          className="theme-icon"
        />
      </button>
    </div>
  );
};

export default Settings;