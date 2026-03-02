import { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { devicesActions } from '../store';
import MapView from '../components/map/MapView';
import Sidebar from '../components/sidebar/Sidebar';
import StatusCard from '../components/StatusCard';
import TopBar from '../components/TopBar';
import EventsDrawer from '../components/EventsDrawer';

const MainPage = () => {
  const dispatch  = useDispatch();
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [eventsOpen,   setEventsOpen]   = useState(false);
  const [keyword,      setKeyword]      = useState('');
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [filterSort,   setFilterSort]   = useState('');

  const devices   = useSelector((s) => s.devices.items);
  const positions = useSelector((s) => s.session.positions);
  const selectedId = useSelector((s) => s.devices.selectedId);

  const deviceList = useMemo(() => Object.values(devices), [devices]);

  const filteredDevices = useMemo(() => {
    let list = deviceList.filter((d) => {
      const matchName   = d.name.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = !filterStatus.length || filterStatus.includes(d.status);
      const matchGroup  = !filterGroups.length || filterGroups.includes(d.groupId);
      return matchName && matchStatus && matchGroup;
    });
    if (filterSort === 'name')       list = [...list].sort((a,b) => a.name.localeCompare(b.name));
    if (filterSort === 'lastUpdate') list = [...list].sort((a,b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
    return list;
  }, [deviceList, keyword, filterStatus, filterGroups, filterSort]);

  const filteredPositions = useMemo(
    () => filteredDevices.map((d) => positions[d.id]).filter(Boolean),
    [filteredDevices, positions],
  );

  const selectedPosition = selectedId ? positions[selectedId] : null;

  const handleSelect = useCallback((id) => {
    dispatch(devicesActions.selectId(id === selectedId ? null : id));
  }, [dispatch, selectedId]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapView
        filteredPositions={filteredPositions}
        selectedPosition={selectedPosition}
        selectedDeviceId={selectedId}
        onDeviceSelect={handleSelect}
      />

      <TopBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onEventsClick={() => setEventsOpen(true)}
      />

      {/* Sidebar */}
      <div
        className={`absolute left-0 top-0 h-full z-20 transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 340, paddingTop: 60 }}
      >
        <Sidebar
          devices={filteredDevices}
          selectedDeviceId={selectedId}
          onDeviceSelect={handleSelect}
          keyword={keyword}
          setKeyword={setKeyword}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterGroups={filterGroups}
          setFilterGroups={setFilterGroups}
          filterSort={filterSort}
          setFilterSort={setFilterSort}
        />
      </div>

      {selectedId && (
        <StatusCard
          deviceId={selectedId}
          position={selectedPosition}
          sidebarOpen={sidebarOpen}
          onClose={() => dispatch(devicesActions.selectId(null))}
        />
      )}

      <EventsDrawer open={eventsOpen} onClose={() => setEventsOpen(false)} />
    </div>
  );
};

export default MainPage;
