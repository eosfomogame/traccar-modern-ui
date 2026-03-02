import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import VehicleMarker, { updateMarkerElement } from './VehicleMarker';

// ── Replay path (GeoJSON line) ─────────────────────────────────────────────
const SOURCE_ID = 'replay-path';

const upsertReplayPath = (map, positions) => {
  const geojson = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: positions.map((p) => [p.longitude, p.latitude]),
    },
  };
  if (map.getSource(SOURCE_ID)) {
    map.getSource(SOURCE_ID).setData(geojson);
  } else {
    map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });
    map.addLayer({
      id: SOURCE_ID,
      type: 'line',
      source: SOURCE_ID,
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#3b82f6', 'line-width': 3, 'line-opacity': 0.7 },
    });
  }
};

// ── Component ──────────────────────────────────────────────────────────────
const MapView = ({
  filteredPositions = [],
  selectedPosition,
  selectedDeviceId,
  onDeviceSelect,
  replayPath,
}) => {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const markersRef    = useRef({});   // id → { marker, el }
  const initialFitRef = useRef(false);

  // Init map once
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
      Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Replay path
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !replayPath?.length) return;
    const run = () => upsertReplayPath(map, replayPath);
    if (map.isStyleLoaded()) run(); else map.once('load', run);
  }, [replayPath]);

  // Markers — update in-place, never re-create unless new device
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const incoming = Object.fromEntries(
      filteredPositions.map((p) => [String(p.deviceId), p])
    );

    // Remove stale
    Object.keys(markersRef.current).forEach((id) => {
      if (!incoming[id]) {
        markersRef.current[id].marker.remove();
        delete markersRef.current[id];
      }
    });

    // Add or update
    Object.entries(incoming).forEach(([id, pos]) => {
      const isSelected = String(id) === String(selectedDeviceId);

      if (markersRef.current[id]) {
        // ✅ Only move the MapLibre marker — rotation handled on inner div
        markersRef.current[id].marker.setLngLat([pos.longitude, pos.latitude]);
        updateMarkerElement(markersRef.current[id].el, pos, isSelected);
      } else {
        const el = VehicleMarker({
          position: pos,
          isSelected,
          onClick: () => onDeviceSelect?.(Number(id)),
        });
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([pos.longitude, pos.latitude])
          .addTo(map);
        markersRef.current[id] = { marker, el };
      }
    });
  }, [filteredPositions, selectedDeviceId, onDeviceSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (map.isStyleLoaded()) updateMarkers(); else map.once('load', updateMarkers);
  }, [updateMarkers]);

  // Auto-fit first load
  useEffect(() => {
    const map = mapRef.current;
    if (!map || initialFitRef.current || !filteredPositions.length) return;
    initialFitRef.current = true;
    if (filteredPositions.length === 1) {
      const p = filteredPositions[0];
      map.flyTo({ center: [p.longitude, p.latitude], zoom: 14, duration: 1200 });
    } else {
      const first = filteredPositions[0];
      const bounds = filteredPositions.reduce(
        (b, p) => b.extend([p.longitude, p.latitude]),
        new maplibregl.LngLatBounds([first.longitude, first.latitude], [first.longitude, first.latitude])
      );
      map.fitBounds(bounds, { padding: 80, duration: 1200 });
    }
  }, [filteredPositions]);

  // Fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPosition) return;
    map.flyTo({
      center: [selectedPosition.longitude, selectedPosition.latitude],
      zoom: Math.max(map.getZoom(), 14),
      duration: 800,
    });
  }, [selectedPosition]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" />;
};

export default MapView;
