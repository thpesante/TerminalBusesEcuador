import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// User token provided
// Set Mapbox token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapBoxComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    lngLat: [number, number];
    title?: string;
    description?: string;
    type?: 'bus' | 'terminal' | 'stop' | 'user';
    fullInfo?: string;
  }>;
  routes?: Array<{
    id: string;
    coordinates: Array<[number, number]>;
    color: string;
    label: string;
  }>;
  showUserLocation?: boolean;
}

const MapBoxComponent: React.FC<MapBoxComponentProps> = ({ 
  center = [-78.4678, -0.1807], 
  zoom = 13,
  markers = [],
  routes = [],
  showUserLocation = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    if (showUserLocation) {
        map.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
                showUserHeading: true
            })
        );
    }

    map.current.on('load', () => {
        // Add routes
        routes.forEach(route => {
            map.current?.addSource(route.id, {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': { 'label': route.label },
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': route.coordinates
                    }
                }
            });

            map.current?.addLayer({
                'id': route.id,
                'type': 'line',
                'source': route.id,
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': route.color,
                    'line-width': 4,
                    'line-opacity': 0.7
                }
            });

            // Add labels to routes (optional)
        });
    });

  }, [center, zoom, showUserLocation, routes]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers if they were dynamically added before? 
    // Usually, mapbox-gl markers are added manually. 
    // To simplify, we rely on the parent to manage this if needed.

    markers.forEach(markerData => {
      const el = document.createElement('div');
      el.className = 'marker group cursor-pointer';
      
      let icon = 'location_on';
      let color = '#1a73e8';
      
      if (markerData.type === 'bus') {
        icon = 'directions_bus';
        color = '#1a73e8';
      } else if (markerData.type === 'terminal') {
        icon = 'apartment';
        color = '#ea4335';
      } else if (markerData.type === 'stop') {
        icon = 'hail';
        color = '#fabc05';
      }

      el.innerHTML = `<span class="material-symbols-outlined" style="color: ${color}; background: white; border-radius: 50%; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 24px;">${icon}</span>`;

      // Hover Popup (Quick Info)
      const hoverPopup = new mapboxgl.Popup({
        offset: 35,
        closeButton: false,
        closeOnClick: false
      }).setHTML(`<div class="p-2 font-headline"><p class="font-black text-primary">${markerData.title}</p></div>`);

      el.addEventListener('mouseenter', () => {
        hoverPopup.setLngLat(markerData.lngLat).addTo(map.current!);
      });
      el.addEventListener('mouseleave', () => {
        hoverPopup.remove();
      });

      // Click Popup (Full Info)
      const fullPopup = new mapboxgl.Popup({
        offset: 35
      }).setHTML(`
        <div class="p-4 font-body min-w-[200px]">
          <h3 class="text-lg font-black font-headline text-primary mb-2 border-b pb-2">${markerData.title}</h3>
          <p class="text-sm text-slate-600 mb-2">${markerData.description || ''}</p>
          <div class="bg-slate-50 p-2 rounded-lg text-xs leading-relaxed">
            ${markerData.fullInfo || 'Información detallada disponible en ventanilla.'}
          </div>
          <button class="mt-4 w-full bg-primary text-white text-[10px] font-bold py-2 rounded-lg uppercase tracking-widest">Ver Horarios</button>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(markerData.lngLat)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        fullPopup.setLngLat(markerData.lngLat).addTo(map.current!);
      });
    });

  }, [markers]);

  return (
    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapBoxComponent;
