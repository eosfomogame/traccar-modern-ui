const CATEGORY_SVG = {
  car: `<path d="M17.5 10.5l-1.5-4.5H4l-1.5 4.5M2 10.5v3a1 1 0 001 1h1a1.5 1.5 0 003 0h6a1.5 1.5 0 003 0h1a1 1 0 001-1v-3H2z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  van: `<rect x="2" y="7" width="16" height="10" rx="1.5" stroke-width="1.5"/><path d="M2 11h16M6 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM14 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke-width="1.5"/>`,
  truck: `<rect x="1" y="6" width="13" height="11" rx="1" stroke-width="1.5"/><path d="M14 9h4l2 4v4h-6V9zM5 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" stroke-width="1.5"/>`,
  motorcycle: `<circle cx="5" cy="14" r="3" stroke-width="1.5"/><circle cx="17" cy="14" r="3" stroke-width="1.5"/><path d="M5 14h5l2-6h3l2 6" stroke-width="1.5" stroke-linecap="round"/>`,
  default: `<circle cx="10" cy="10" r="6" stroke-width="1.5"/><circle cx="10" cy="10" r="2" fill="currentColor"/>`,
};

export default function VehicleMarker({ device, position, selected, color, onClick }) {
  const course = position?.course || 0;
  const isMoving = device.status === 'moving';
  const svgPath = CATEGORY_SVG[device.category] || CATEGORY_SVG.default;

  return (
    <div
      onClick={onClick}
      style={{ transform: `rotate(${course}deg)`, transition: 'transform 1s ease-out, filter 0.2s' }}
      className={`relative flex items-center justify-center cursor-pointer ${
        selected ? 'drop-shadow-[0_0_12px_rgba(59,130,246,0.9)]' : ''
      }`}
    >
      {/* Pulse ring for moving vehicles */}
      {isMoving && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ backgroundColor: color, transform: 'scale(1.8)' }}
        />
      )}

      {/* Selected outer ring */}
      {selected && (
        <div
          className="absolute rounded-full border-2 border-brand-400 animate-pulse"
          style={{ width: '52px', height: '52px' }}
        />
      )}

      {/* Main marker circle */}
      <div
        className="relative flex items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110"
        style={{
          width: selected ? '44px' : '36px',
          height: selected ? '44px' : '36px',
          backgroundColor: color + '22',
          borderColor: color,
          boxShadow: `0 2px 12px ${color}66`,
        }}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke={color}
          style={{ width: selected ? '22px' : '18px', height: selected ? '22px' : '18px' }}
          dangerouslySetInnerHTML={{ __html: svgPath }}
        />
      </div>

      {/* Speed label */}
      {isMoving && position?.speed > 0 && (
        <div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-1 rounded whitespace-nowrap"
          style={{ color, backgroundColor: color + '22', border: `1px solid ${color}44`, transform: `translateX(-50%) rotate(-${position.course || 0}deg)` }}
        >
          {Math.round(position.speed)}
        </div>
      )}
    </div>
  );
}
