import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import VehicleMarker from './VehicleMarker';

// Route path for replay
const drawReplayPath = (map, positions) => {
  const id = 'replay-path';
  if (map.getSource(id)) {
    map.getSource(id).setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: positions.map((p) => [p.longitude, p.latitude]) },
    });
    return;
  }
  map.addSource(id, {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: positions.map((p) => [p.longitude, p.latitude]) },
    },
  });
  map.addLayer({
    id,
    type: 'line',
    source: id,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': '#3b82f6', 'line-width': 3, 'line-opacity': 0.7 },
  });
};

const MapView = ({
  filteredPositions = [],
  selectedPosition,
  selectedDeviceId,
  onDeviceSelect,
  replayPath,
  replayIndex,
}) => {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({});
  const initialFitRef = useRef(false);

  // ── init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [12.4964, 41.9028],
      zoom: 5,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');
    mapRef.current = map;
    return () => {
      Object.values(markersRef.current).forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── replay path
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !replayPath?.length) return;
    const ready = () => drawReplayPath(map, replayPath);
    if (map.isStyleLoaded()) ready();
    else map.once('load', ready);
  }, [replayPath]);

  // ── markers
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const incoming = {};
    filteredPositions.forEach((pos) => {
      incoming[pos.deviceId] = pos;
    });

    // remove stale
    Object.keys(markersRef.current).forEach((id) => {
      if (!incoming[id]) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // add / update
    Object.entries(incoming).forEach(([id, pos]) => {
      const isSelected = String(id) === String(selectedDeviceId);
      if (markersRef.current[id]) {
        markersRef.current[id].setLngLat([pos.longitude, pos.latitude]);
        // update element
        const el = markersRef.current[id].getElement();
        el.style.transform = `rotate(${pos.course || 0}deg)`;
        el.style.outline = isSelected ? '2px solid #3b82f6' : 'none';
      } else {
        const el = VehicleMarker({ position: pos, isSelected, onClick: () => onDeviceSelect?.(Number(id)) });
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pos.longitude, pos.latitude])
          .addTo(map);
        markersRef.current[id] = marker;
      }
    });
  }, [filteredPositions, selectedDeviceId, onDeviceSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) updateMarkers();
    else map.once('load', updateMarkers);
  }, [updateMarkers]);

  // ── auto-fit on first load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || initialFitRef.current || filteredPositions.length === 0) return;
    initialFitRef.current = true;
    if (filteredPositions.length === 1) {
      const p = filteredPositions[0];
      map.flyTo({ center: [p.longitude, p.latitude], zoom: 14, duration: 1200 });
    } else {
      const bounds = filteredPositions.reduce((b, p) => b.extend([p.longitude, p.latitude]), new maplibregl.LngLatBounds([filteredPositions[0].longitude, filteredPositions[0].latitude], [filteredPositions[0].longitude, filteredPositions[0].latitude]));
      map.fitBounds(bounds, { padding: 80, duration: 1200 });
    }
  }, [filteredPositions]);

  // ── fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPosition) return;
    map.flyTo({ center: [selectedPosition.longitude, selectedPosition.latitude], zoom: Math.max(map.getZoom(), 14), duration: 800 });
  }, [selectedPosition]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full" />
  );
};

export default MapView;
