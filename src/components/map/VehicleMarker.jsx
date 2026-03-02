// Returns a DOM element for use with MapLibre Marker
const VehicleMarker = ({ position, isSelected, onClick }) => {
  const el = document.createElement('div');
  el.className = 'vehicle-marker';
  el.style.cssText = `
    width: 36px;
    height: 36px;
    cursor: pointer;
    position: relative;
    transform: rotate(${position.course || 0}deg);
    transition: transform 0.8s ease-out;
  `;

  const speed   = position.speed || 0;
  const isMoving = speed > 0.5;
  const status   = position.attributes?.ignition === false ? 'stopped'
    : isMoving ? 'moving' : 'stopped';

  const colorMap = {
    moving:  { fill: '#3b82f6', ring: '#3b82f621', glow: '#3b82f640' },
    stopped: { fill: '#f59e0b', ring: '#f59e0b21', glow: '#f59e0b40' },
    alarm:   { fill: '#ef4444', ring: '#ef444421', glow: '#ef444440' },
  };
  const c = colorMap[status] || colorMap.stopped;

  // Pulse ring (only when moving)
  if (isMoving || isSelected) {
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid ${isSelected ? '#3b82f6' : c.fill};
      opacity: 0.6;
      animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      pointer-events: none;
    `;
    el.appendChild(ring);
  }

  // Main body — arrow shape
  el.innerHTML += `
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"
      style="position:absolute;inset:0;filter:${isSelected ? `drop-shadow(0 0 6px ${c.fill})` : 'none'};transition:filter 0.3s;">
      <!-- Shadow circle -->
      <circle cx="18" cy="18" r="16" fill="${c.glow}" />
      <!-- Body circle -->
      <circle cx="18" cy="18" r="12" fill="${c.fill}" />
      <!-- Arrow pointing up (direction of travel) -->
      <path d="M18 9 L23 23 L18 20 L13 23 Z" fill="white" opacity="0.9" />
    </svg>
  `;

  // Speed label (below marker, not rotated)
  if (isMoving) {
    const label = document.createElement('div');
    label.style.cssText = `
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%) rotate(${-(position.course || 0)}deg);
      margin-top: 2px;
      background: rgba(0,0,0,0.7);
      color: white;
      font-size: 9px;
      font-weight: 600;
      padding: 1px 5px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      font-family: monospace;
    `;
    label.textContent = `${(speed * 1.852).toFixed(0)} km/h`;
    el.appendChild(label);
  }

  el.addEventListener('click', (e) => { e.stopPropagation(); onClick?.(); });

  return el;
};

export default VehicleMarker;
