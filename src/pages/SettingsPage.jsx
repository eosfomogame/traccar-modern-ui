import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, Bell, Users, Shield, Palette } from 'lucide-react';

const sections = [
  { icon: Map,     label: 'Map Settings',      desc: 'Style, layers, clusters' },
  { icon: Bell,    label: 'Notifications',      desc: 'Alerts, events, triggers' },
  { icon: Users,   label: 'Devices & Groups',   desc: 'Manage fleet assets' },
  { icon: Shield,  label: 'Geofences',          desc: 'Zones and boundaries' },
  { icon: Palette, label: 'Appearance',         desc: 'Theme, colors, display' },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-surface-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-surface-400 hover:text-white transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to map
        </button>
        <h1 className="text-2xl font-semibold mb-8">Settings</h1>
        <div className="space-y-2">
          {sections.map(({ icon: Icon, label, desc }) => (
            <button
              key={label}
              className="w-full glass rounded-xl px-5 py-4 flex items-center gap-4 hover:bg-surface-800/60 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center group-hover:bg-brand-600/30 transition-colors">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <div className="font-medium text-sm">{label}</div>
                <div className="text-xs text-surface-400 mt-0.5">{desc}</div>
              </div>
              <div className="ml-auto text-surface-600 group-hover:text-surface-400 transition-colors">›</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
