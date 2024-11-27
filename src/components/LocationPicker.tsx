import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';
import { MapPin, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function DraggableMarker({ position, onPositionChange }: {
  position: LatLng;
  onPositionChange: (pos: { lat: number; lng: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return (
    <Marker
      position={position}
      icon={defaultIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onPositionChange({ lat: position.lat, lng: position.lng });
        },
      }}
    />
  );
}

function MapEvents({ onLocationSelect }: { 
  onLocationSelect: (location: { lat: number; lng: number }) => void 
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({ lat: 14.6937, lng: -17.4441 });
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePositionChange = (newPos: { lat: number; lng: number }) => {
    setPosition(newPos);
    onLocationSelect(newPos);
    setError(null);
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    setError(null);

    // Use IP-based geolocation as fallback if not HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
          const newPos = {
            lat: parseFloat(data.latitude),
            lng: parseFloat(data.longitude)
          };
          handlePositionChange(newPos);
        })
        .catch(() => {
          setError('Unable to get location. Please select manually on the map.');
        })
        .finally(() => {
          setIsLocating(false);
        });
      return;
    }

    if ('geolocation' in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          handlePositionChange(newPos);
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Unable to get your location. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please enable location access in your device settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Please select location manually.';
          }
          
          setError(errorMessage);
          setIsLocating(false);
        },
        options
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={getCurrentLocation}
        disabled={isLocating}
        className="w-full bg-[#841726] hover:bg-[#440d15] text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLocating ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            Getting location...
          </>
        ) : (
          <>
            <MapPin size={18} />
            Get My Current Location
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
          {error}
        </p>
      )}

      <div className="w-full h-[300px] rounded-lg shadow-md overflow-hidden">
        <MapContainer
          center={new LatLng(position.lat, position.lng)}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DraggableMarker 
            position={new LatLng(position.lat, position.lng)}
            onPositionChange={handlePositionChange}
          />
          <MapEvents onLocationSelect={handlePositionChange} />
        </MapContainer>
      </div>
      <p className="text-sm text-gray-600">
        Click on the map or drag the marker to set your delivery location
      </p>
    </div>
  );
}