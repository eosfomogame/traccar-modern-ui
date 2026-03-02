import { Satellite } from 'lucide-react';

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-surface-950 flex flex-col items-center justify-center gap-4 z-50">
      <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center animate-pulse">
        <Satellite className="w-7 h-7 text-white" />
      </div>
      <div className="flex gap-1.5">
        {[0,1,2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
