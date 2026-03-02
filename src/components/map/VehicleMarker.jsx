const SVG = {
  car: `<path d="M17.5 10.5l-1.5-4.5H4l-1.5 4.5M2 10.5v3a1 1 0 001 1h1a1.5 1.5 0 003 0h6a1.5 1.5 0 003 0h1a1 1 0 001-1v-3H2z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  van: `<rect x="2" y="7" width="16" height="10" rx="1.5" stroke-width="1.5"/><path d="M2 11h16M6 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke-width="1.5"/>`,
  truck: `<rect x="1" y="6" width="13" height="11" rx="1" stroke-width="1.5"/><path d="M14 9h4l2 4v4h-6V9zM5 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke-width="1.5"/>`,
  motorcycle: `<circle cx="5" cy="14" r="3" stroke-width="1.5"/><circle cx="17" cy="14" r="3" stroke-width="1.5"/><path d="M5 14h5l2-6h3l2 6" stroke-width="1.5" stroke-linecap="round"/>`,
  boat: `<path d="M3 16s1-1 4-1 5 2 8 2 4-1 4-1V11L12 3 3 11v5z" stroke-width="1.5" stroke-linejoin="round"/>`,
  default: `<circle cx="10" cy="10" r="6" stroke-width="1.5"/><circle cx="10" cy="10" r="2" fill="currentColor"/>`,
};

export default function VehicleMarker({ device, position, selected, color, onClick }) {
  const course  = position?.course ?? 0;
  const isMoving = device.status === 'moving' || (position?.speed > 0);
  const path    = SVG[device.category] || SVG.default;
  const size    = selected ? 44 : 36;
  const iconSize = selected ? 22 : 18;

  return (
    <div
      onClick={onClick}
      style={{
        transform: `rotate(${course}deg)`,
        transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        width: size + 16,
        height: size + 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {/* Pulse ring for moving */}
      {isMoving && (
        <div style={{
          position: 'absolute',
          width: size + 16,
          height: size + 16,
          borderRadius: '50%',
          backgroundColor: color,
          opacity: 0.25,
          animation: 'ping 1.8s cubic-bezier(0,0,0.2,1) infinite',
        }} />
      )}

      {/* Selection ring */}
      {selected && (
        <div style={{
          position: 'absolute',
          width: size + 12,
          height: size + 12,
          borderRadius: '50%',
          border: '2px solid #60a5fa',
          animation: 'pulse 2s ease-in-out infinite',
        }} />
      )}

      {/* Main circle */}
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color + '22',
        border: `2px solid ${color}`,
        boxShadow: `0 2px 12px ${color}55, ${selected ? `0 0 20px ${color}44` : ''}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}>
        <svg viewBox="0 0 20 20" fill="none" stroke={color}
          style={{ width: iconSize, height: iconSize }}
          dangerouslySetInnerHTML={{ __html: path }}
        />
      </div>

      {/* Speed badge (counter-rotated so it stays readable) */}
      {isMoving && position?.speed > 0 && (
        <div style={{
          position: 'absolute',
          bottom: -2,
          left: '50%',
          transform: `translateX(-50%) rotate(-${course}deg)`,
          fontSize: 9,
          fontFamily: 'monospace',
          fontWeight: 700,
          color,
          background: color + '22',
          border: `1px solid ${color}44`,
          borderRadius: 4,
          padding: '1px 4px',
          whiteSpace: 'nowrap',
          lineHeight: 1.4,
        }}>
          {Math.round(position.speed)} km/h
        </div>
      )}
    </div>
  );
}
