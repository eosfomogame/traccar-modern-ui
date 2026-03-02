import { useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import maplibregl from 'maplibre-gl';
import { createRoot } from 'react-dom/client';
import VehicleMarker from './VehicleMarker';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const STATUS_COLORS = {
  online: '#10b981', moving: '#3b82f6', stopped: '#f59e0b', offline: '#6b7280', unknown: '#6b7280',
};

export default function MapView({ filteredPositions, selectedPosition, selectedDeviceId, onDeviceSelect }) {
  const mapContainerRef = useRef(null);
  const mapRef          = useRef(null);
  const markersRef      = useRef({});
  const rootsRef        = useRef({});
  const routeLayersRef  = useRef({});

  const devices   = useSelector((s) => s.devices.items);
  const history   = useSelector((s) => s.session.history);

  // Init map
  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [2.3, 48.86],
      zoom: 11,
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

  // Render/update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const render = () => {
      filteredPositions.forEach((pos) => {
        const device = devices[pos.deviceId];
        if (!device) return;
        const isSelected = selectedDeviceId === device.id;
        const color = STATUS_COLORS[device.status] || STATUS_COLORS.unknown;

        if (markersRef.current[device.id]) {
          markersRef.current[device.id].setLngLat([pos.longitude, pos.latitude]);
          rootsRef.current[device.id]?.render(
            <VehicleMarker device={device} position={pos} selected={isSelected} color={color} onClick={() => onDeviceSelect(device.id)} />
          );
        } else {
          const el   = document.createElement('div');
          const root = createRoot(el);
          rootsRef.current[device.id] = root;
          root.render(
            <VehicleMarker device={device} position={pos} selected={isSelected} color={color} onClick={() => onDeviceSelect(device.id)} />
          );
          markersRef.current[device.id] = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([pos.longitude, pos.latitude])
            .addTo(map);
        }
      });
      // Remove stale markers
      const activeIds = new Set(filteredPositions.map((p) => p.deviceId));
      Object.keys(markersRef.current).forEach((id) => {
        if (!activeIds.has(Number(id))) {
          markersRef.current[id].remove();
          rootsRef.current[id]?.unmount();
          delete markersRef.current[id];
          delete rootsRef.current[id];
        }
      });
    };
    if (map.isStyleLoaded()) render();
    else map.once('load', render);
  }, [filteredPositions, devices, selectedDeviceId, onDeviceSelect]);

  // Live routes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    Object.entries(history).forEach(([deviceId, coords]) => {
      const id = `route-${deviceId}`;
      const geojson = { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } };
      if (map.getSource(id)) {
        map.getSource(id).setData(geojson);
      } else {
        map.addSource(id, { type: 'geojson', data: geojson });
        map.addLayer({
          id,
          type: 'line',
          source: id,
          paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-opacity': 0.7, 'line-dasharray': [2, 2] },
        });
        routeLayersRef.current[id] = true;
      }
    });
  }, [history]);

  // Fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPosition) return;
    map.flyTo({ center: [selectedPosition.longitude, selectedPosition.latitude], zoom: 15, duration: 1000 });
  }, [selectedPosition]);

  return <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />;
}
