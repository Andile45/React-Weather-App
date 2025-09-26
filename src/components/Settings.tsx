import React from 'react';

interface SettingsProps {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark';
  onToggleUnits: () => void;
  onToggleTheme: () => void;
}

const Settings: React.FC<SettingsProps> = ({ units, theme, onToggleUnits, onToggleTheme }) => {
  return (
    <div className="settings">
      <button onClick={onToggleUnits} className="settings-button">
        {units === 'metric' ? '°C' : '°F'}
      </button>
      <button onClick={onToggleTheme} className="settings-button">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
    </div>
  );
};

export default Settings;