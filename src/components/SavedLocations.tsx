import React from 'react';

interface SavedLocationsProps {
  locations: string[];
  onSelectLocation: (location: string) => void;
}

const SavedLocations: React.FC<SavedLocationsProps> = ({ locations, onSelectLocation }) => {
  if (locations.length === 0) {
    return (
      <div className="saved-locations">
        <h3>Saved Locations</h3>
        <p className="no-locations">No saved locations yet</p>
      </div>
    );
  }

  return (
    <div className="saved-locations">
      <h3>Saved Locations</h3>
      <div className="location-list">
        {locations.map((location, index) => (
          <button
            key={index}
            onClick={() => onSelectLocation(location)}
            className="location-button"
          >
            {location}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SavedLocations;