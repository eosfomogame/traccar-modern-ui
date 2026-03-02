import { useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import maplibregl from 'maplibre-gl';
import VehicleMarker from './VehicleMarker';
import { createRoot } from 'react-dom/client';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const STATUS_COLORS = {
  online:  '#10b981',
  moving:  '#3b82f6',
  stopped: '#f59e0b',
  offline: '#6b7280',
};

export default function MapView({ selectedDeviceId, onDeviceSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markersRef      = useRef({});
  const rootsRef        = useRef({});

  const devices   = useSelector((s) => s.devices.items);
  const positions = useSelector((s) => s.devices.positions);

  // Init map
  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style:     MAP_STYLE,
      center:    [2.30, 48.86],
      zoom:      12,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    mapRef.current = map;
    return () => {
      Object.values(rootsRef.current).forEach((r) => r.unmount());
      map.remove();
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const ready = () => {
      devices.forEach((device) => {
        const pos = positions[device.id];
        if (!pos) return;

        const isSelected = selectedDeviceId === device.id;
        const color = STATUS_COLORS[device.status] || STATUS_COLORS.offline;

        if (markersRef.current[device.id]) {
          // Update position + rotation
          markersRef.current[device.id].setLngLat([pos.lng, pos.lat]);
          const el = markersRef.current[device.id].getElement();
          if (rootsRef.current[device.id]) {
            rootsRef.current[device.id].render(
              <VehicleMarker
                device={device}
                position={pos}
                selected={isSelected}
                color={color}
                onClick={() => onDeviceSelect(device.id)}
              />
            );
          }
        } else {
          const el = document.createElement('div');
          el.style.cursor = 'pointer';
          const root = createRoot(el);
          rootsRef.current[device.id] = root;
          root.render(
            <VehicleMarker
              device={device}
              position={pos}
              selected={isSelected}
              color={color}
              onClick={() => onDeviceSelect(device.id)}
            />
          );
          const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([pos.lng, pos.lat])
            .addTo(map);
          markersRef.current[device.id] = marker;
        }
      });
    };

    if (map.isStyleLoaded()) ready();
    else map.once('load', ready);
  }, [devices, positions, selectedDeviceId, onDeviceSelect]);

  // Fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedDeviceId) return;
    const pos = positions[selectedDeviceId];
    if (!pos) return;
    map.flyTo({ center: [pos.lng, pos.lat], zoom: 15, duration: 1200, essential: true });
  }, [selectedDeviceId, positions]);

  return (
    <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
  );
}
