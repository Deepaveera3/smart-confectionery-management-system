import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Check, AlertCircle } from 'lucide-react';

export default function DeliveryLocationPicker({ onLocationSelect, defaultAddress = '' }) {
  const mapRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState({ lat: 13.0827, lng: 80.2707 });
  const [locationName, setLocationName] = useState(defaultAddress || 'Selected Delivery Location');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then((google) => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: selectedCoords,
        zoom: 15,
        mapTypeId: 'roadmap'
      });

      const marker = new google.maps.Marker({
        position: selectedCoords,
        map: map,
        draggable: true,
        title: 'Drag to pinpoint delivery address'
      });

      // Handle Map Clicks & Marker Drag
      const updateLocation = (lat, lng) => {
        const coords = { lat, lng };
        setSelectedCoords(coords);
        
        // Geocode coordinates to address string if geocoder is available
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: coords }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const formatted = results[0].formatted_address;
            setLocationName(formatted);
            if (onLocationSelect) onLocationSelect({ coords, address: formatted });
          } else {
            if (onLocationSelect) onLocationSelect({ coords, address: `Pinpoint Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
          }
        });
      };

      map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        marker.setPosition({ lat, lng });
        updateLocation(lat, lng);
      });

      marker.addListener('dragend', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateLocation(lat, lng);
      });

      setMapLoaded(true);
    }).catch(err => {
      console.warn('Delivery Map Loader error:', err);
    });
  }, [apiKey]);

  // Geolocation Handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSelectedCoords(coords);
        setLocationName(`Current GPS Pinpoint (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
        setIsLocating(false);
        if (onLocationSelect) onLocationSelect({ coords, address: `GPS Location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` });
      },
      () => {
        setIsLocating(false);
      }
    );
  };

  return (
    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--chocolate-dark)', margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} style={{ color: 'var(--gold-primary)' }} />
          Select Precision Delivery Location on Map
        </h4>
        <button
          type="button"
          onClick={handleDetectLocation}
          className="btn btn-outline"
          disabled={isLocating}
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Navigation size={14} /> {isLocating ? 'Detecting...' : 'Use My Current Location'}
        </button>
      </div>

      <div style={{ position: 'relative', height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: 'var(--cream-light)' }}>
        {apiKey && mapLoaded ? (
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center', background: 'linear-gradient(135deg, #f7f3e9 0%, #e9e2d0 100%)' }}>
            <MapPin size={32} style={{ color: 'var(--maroon-primary)', marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: '600', color: 'var(--chocolate-dark)', fontSize: '0.9rem' }}>Delivery Location Pinpoint</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.3rem 0 0.8rem 0' }}>
              Lat: {selectedCoords.lat.toFixed(4)}, Lng: {selectedCoords.lng.toFixed(4)}
            </div>
            <button
              type="button"
              onClick={handleDetectLocation}
              className="btn btn-gold"
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}
            >
              <Navigation size={14} /> Detect Current GPS Coordinates
            </button>
          </div>
        )}
      </div>

      {locationName && (
        <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.8rem', backgroundColor: 'rgba(88, 17, 26, 0.05)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--chocolate-dark)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Check size={16} style={{ color: 'var(--gold-primary)', flexShrink: 0 }} />
          <span><strong>Pinpoint Location:</strong> {locationName}</span>
        </div>
      )}
    </div>
  );
}
