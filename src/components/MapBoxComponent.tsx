import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Using the token from environment variables
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

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
    if (!mapContainer.current) return;
    if (map.current) return; // initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Style from user example
      center: center,
      zoom: zoom,
      antialias: true
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
        // Add routes as layers
        routes.forEach(route => {
            if (!map.current) return;
            
            // Check if source already exists
            if (!map.current.getSource(route.id)) {
                map.current.addSource(route.id, {
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

                map.current.addLayer({
                    'id': route.id,
                    'type': 'line',
                    'source': route.id,
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': route.color,
                        'line-width': 5,
                        'line-opacity': 0.8
                    }
                });
            }
        });
    });

    // Cleanup on unmount
    return () => {
        if (map.current) {
            map.current.remove();
            map.current = null;
        }
    };
  }, [center, zoom, showUserLocation, routes]);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

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

      el.innerHTML = `
        <div class="flex flex-col items-center">
            <span class="material-symbols-outlined" style="color: ${color}; background: white; border-radius: 50%; padding: 10px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); font-size: 28px; border: 2px solid white;">${icon}</span>
            <div class="w-1 h-3 bg-white/50 -mt-1 hidden group-hover:block"></div>
        </div>
      `;

      // Hover Popup
      const hoverPopup = new mapboxgl.Popup({
        offset: 40,
        closeButton: false,
        closeOnClick: false,
        className: 'hover-popup'
      }).setHTML(`<div class="p-2 font-headline font-black text-primary text-xs">${markerData.title}</div>`);

      el.addEventListener('mouseenter', () => {
        hoverPopup.setLngLat(markerData.lngLat).addTo(map.current!);
      });
      el.addEventListener('mouseleave', () => {
        hoverPopup.remove();
      });

      // Click Information Box
      const fullPopup = new mapboxgl.Popup({
        offset: 40,
        className: 'detail-popup',
        maxWidth: '300px'
      }).setHTML(`
        <div class="p-4 font-body">
          <div class="flex items-center gap-2 mb-3 border-b pb-2">
            <span class="material-symbols-outlined text-primary">${icon}</span>
            <h3 class="text-base font-black font-headline text-primary uppercase tracking-tighter">${markerData.title}</h3>
          </div>
          <p class="text-xs font-bold text-slate-700 mb-2">${markerData.description || ''}</p>
          <div class="bg-indigo-50 p-3 rounded-xl text-[10px] leading-relaxed font-medium text-indigo-900 border border-indigo-100">
            ${markerData.fullInfo || 'Información de terminal activa.'}
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2">
             <button class="bg-primary text-white text-[9px] font-black py-2 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">Ver Rutas</button>
             <button class="bg-slate-100 text-slate-500 text-[9px] font-black py-2 rounded-full uppercase tracking-widest hover:bg-slate-200 transition-colors">Cerrar</button>
          </div>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat(markerData.lngLat)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        fullPopup.setLngLat(markerData.lngLat).addTo(map.current!);
      });
    });

  }, [markers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default MapBoxComponent;
