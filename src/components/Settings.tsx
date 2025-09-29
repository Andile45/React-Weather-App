import React from 'react';
import DarkMode from './assets/dark-mode.png'
import LightMode from './assets/light-mode.png'

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
            <img
              src={theme === "light" ? DarkMode : LightMode}
              alt={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
              style={{ width: "24px", height: "24px", verticalAlign: "middle" }}
            />
          </button>
    </div>
  );
};

export default Settings;