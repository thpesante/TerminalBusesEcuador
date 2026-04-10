import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// TODO: Replace with real Mapbox Access Token. Using a generic public token for demo purposes.
// Set Mapbox token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapProps {
  lat?: number;
  lng?: number;
  zoom?: number;
}

const MapboxViewer: React.FC<MapProps> = ({ lat = -1.8312, lng = -78.1834, zoom = 6 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    
    // Initialize Mapbox map centered in Ecuador
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Estética oscura premium
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const popup = new mapboxgl.Popup({ offset: 25 }).setText('Terminal de Cuenca');

    // Marcador de ejemplo en Cuenca
    new mapboxgl.Marker({ color: 'var(--primary)' })
        .setLngLat([-79.0045, -2.9001])
        .setPopup(popup)
        .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [lat, lng, zoom]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}

export default MapboxViewer;
