import React from 'react';

interface SavedLocationsProps {
  locations: string[];
  onSelectLocation: (location: string) => void;
  onRemoveLocation?: (location: string) => void;
}

const SavedLocations: React.FC<SavedLocationsProps> = ({ 
  locations, 
  onSelectLocation,
  onRemoveLocation 
}) => {
  if (locations.length === 0) {
    return null;
  }

  const handleRemove = (e: React.MouseEvent, location: string) => {
    e.stopPropagation();
    if (onRemoveLocation) {
      onRemoveLocation(location);
    }
  };

  return (
    <div className="saved-locations">
      <div className="location-list">
        {locations.map((location, index) => (
          <div key={index} className="location-item">
            <button
              onClick={() => onSelectLocation(location)}
              className="location-button"
            >
              {location}
            </button>
            {onRemoveLocation && (
              <button
                onClick={(e) => handleRemove(e, location)}
                className="location-remove"
                title="Remove location"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedLocations;