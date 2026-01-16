import React, { useState } from 'react';
import LocationIcon from './LocationIcon';

interface SearchBarProps {
  onSearch: (city: string) => void;
  onLocationClick: () => void;
  loading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onLocationClick, loading = false }) => {
  const [city, setCity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city);
      setCity('');
    }
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="search-input"
          disabled={loading}
        />
        <button type="submit" className="search-button" disabled={loading}>
          Search
        </button>
      </form>
      <button
        onClick={onLocationClick}
        className="location-button"
        disabled={loading}
        title="Get weather for your current location"
      >
        <LocationIcon className="location-icon" />
        <span>My Location</span>
      </button>
    </div>
  );
};

export default SearchBar;