/**
 * Returns a DOM element for MapLibre Marker.
 *
 * IMPORTANT: MapLibre sets its own translate3d on the root element.
 * We NEVER touch el.style.transform — rotation is applied on an
 * inner wrapper div so MapLibre positioning stays intact.
 */
const VehicleMarker = ({ position, isSelected, onClick }) => {
  // Root element — MapLibre owns the transform on this node
  const el = document.createElement('div');
  el.style.cssText = 'width:36px;height:36px;cursor:pointer;';

  // Inner wrapper — we rotate THIS, not el
  const inner = document.createElement('div');
  inner.dataset.markerInner = '1';
  inner.style.cssText = [
    'width:36px;height:36px;',
    'position:relative;',
    `transform:rotate(${position.course || 0}deg);`,
    'transition:transform 0.6s ease-out;',
    'will-change:transform;',
  ].join('');

  const speed    = position.speed || 0;
  const isMoving = speed > 0.5;
  const hasAlarm = Boolean(position.attributes?.alarm);

  const color = hasAlarm ? '#ef4444' : isMoving ? '#3b82f6' : '#f59e0b';
  const glow  = hasAlarm ? '#ef444440' : isMoving ? '#3b82f640' : '#f59e0b40';

  // Pulse ring (selected or alarm)
  if (isSelected || hasAlarm) {
    const ring = document.createElement('div');
    ring.style.cssText = [
      'position:absolute;inset:-6px;border-radius:50%;',
      `border:2px solid ${color};`,
      'opacity:0.6;pointer-events:none;',
      'animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;',
    ].join('');
    inner.appendChild(ring);
  }

  // SVG arrow body
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '36');
  svg.setAttribute('height', '36');
  svg.setAttribute('viewBox', '0 0 36 36');
  svg.style.cssText = [
    'position:absolute;inset:0;',
    `filter:${isSelected ? `drop-shadow(0 0 6px ${color})` : 'none'};`,
  ].join('');

  svg.innerHTML = `
    <circle cx="18" cy="18" r="16" fill="${glow}"/>
    <circle cx="18" cy="18" r="12" fill="${color}"/>
    <path d="M18 9 L23 23 L18 20 L13 23 Z" fill="white" opacity="0.9"/>
  `;
  inner.appendChild(svg);

  // Speed badge — counter-rotated so it stays horizontal
  if (isMoving) {
    const badge = document.createElement('div');
    badge.dataset.markerBadge = '1';
    badge.style.cssText = [
      'position:absolute;top:100%;left:50%;',
      `transform:translateX(-50%) rotate(${-(position.course || 0)}deg);`,
      'margin-top:3px;',
      'background:rgba(0,0,0,0.75);color:#fff;',
      'font-size:9px;font-weight:600;font-family:monospace;',
      'padding:1px 5px;border-radius:4px;',
      'white-space:nowrap;pointer-events:none;',
    ].join('');
    badge.textContent = `${(speed * 1.852).toFixed(0)} km/h`;
    inner.appendChild(badge);
  }

  el.appendChild(inner);
  el.addEventListener('click', (e) => { e.stopPropagation(); onClick?.(); });
  return el;
};

/**
 * Update an existing marker element in-place (no re-create).
 * Rotates only the inner wrapper, never the root el.
 */
export const updateMarkerElement = (el, position, isSelected) => {
  const inner = el.querySelector('[data-marker-inner]');
  if (!inner) return;
  inner.style.transform = `rotate(${position.course || 0}deg)`;

  const badge = el.querySelector('[data-marker-badge]');
  if (badge) {
    badge.style.transform = `translateX(-50%) rotate(${-(position.course || 0)}deg)`;
  }

  const svg = inner.querySelector('svg');
  const hasAlarm = Boolean(position.attributes?.alarm);
  const color = hasAlarm ? '#ef4444' : (position.speed || 0) > 0.5 ? '#3b82f6' : '#f59e0b';
  if (svg) svg.style.filter = isSelected ? `drop-shadow(0 0 6px ${color})` : 'none';
};

export default VehicleMarker;
