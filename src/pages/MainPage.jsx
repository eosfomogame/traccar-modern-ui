import { useState, useCallback } from 'react';
import MapView from '../components/map/MapView';
import Sidebar from '../components/sidebar/Sidebar';
import StatusCard from '../components/StatusCard';
import TopBar from '../components/TopBar';

export default function MainPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  const handleDeviceSelect = useCallback((id) => {
    setSelectedDeviceId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div className="relative w-full h-full bg-surface-950 overflow-hidden">
      {/* Full-screen map */}
      <MapView selectedDeviceId={selectedDeviceId} onDeviceSelect={handleDeviceSelect} />

      {/* Top bar */}
      <TopBar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      {/* Left sidebar */}
      <div
        className={`
          absolute left-0 top-0 h-full z-20 transition-transform duration-300 ease-out
          ${ sidebarOpen ? 'translate-x-0' : '-translate-x-full' }
        `}
        style={{ width: '340px', paddingTop: '60px' }}
      >
        <Sidebar onDeviceSelect={handleDeviceSelect} selectedDeviceId={selectedDeviceId} />
      </div>

      {/* Status card popup */}
      {selectedDeviceId && (
        <StatusCard
          deviceId={selectedDeviceId}
          onClose={() => setSelectedDeviceId(null)}
          sidebarOpen={sidebarOpen}
        />
      )}
    </div>
  );
}
