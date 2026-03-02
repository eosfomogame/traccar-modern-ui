import { configureStore, createSlice } from '@reduxjs/toolkit';

// ─── Devices slice ───────────────────────────────────────────────────────────
const MOCK_DEVICES = [
  { id: 1, name: 'Tesla Model S',   category: 'car',   status: 'online',  lastUpdate: new Date().toISOString(), disabled: false },
  { id: 2, name: 'BMW M3',          category: 'car',   status: 'moving',  lastUpdate: new Date().toISOString(), disabled: false },
  { id: 3, name: 'Delivery Van 01', category: 'van',   status: 'stopped', lastUpdate: new Date(Date.now()-300000).toISOString(), disabled: false },
  { id: 4, name: 'Moto Courier',    category: 'motorcycle', status: 'offline', lastUpdate: new Date(Date.now()-3600000).toISOString(), disabled: false },
  { id: 5, name: 'Truck Alpha',     category: 'truck', status: 'online',  lastUpdate: new Date().toISOString(), disabled: false },
];

const MOCK_POSITIONS = {
  1: { deviceId: 1, lat: 48.8584,  lng: 2.2945,  speed: 0,   course: 90,  attributes: { ignition: true,  batteryLevel: 92, motion: false } },
  2: { deviceId: 2, lat: 48.8630,  lng: 2.3100,  speed: 62,  course: 215, attributes: { ignition: true,  motion: true  } },
  3: { deviceId: 3, lat: 48.8510,  lng: 2.3300,  speed: 0,   course: 0,   attributes: { ignition: false, motion: false } },
  4: { deviceId: 4, lat: 48.8700,  lng: 2.3050,  speed: 0,   course: 45,  attributes: { batteryLevel: 18 } },
  5: { deviceId: 5, lat: 48.8460,  lng: 2.2800,  speed: 45,  course: 10,  attributes: { ignition: true,  motion: true  } },
};

const devicesSlice = createSlice({
  name: 'devices',
  initialState: {
    items: MOCK_DEVICES,
    positions: MOCK_POSITIONS,
    selectedId: null,
  },
  reducers: {
    selectDevice: (state, action) => { state.selectedId = action.payload; },
    updatePosition: (state, action) => {
      const pos = action.payload;
      state.positions[pos.deviceId] = pos;
    },
    setFilter: (state, action) => { state.filter = action.payload; },
  },
});

export const { selectDevice, updatePosition } = devicesSlice.actions;

export default configureStore({
  reducer: { devices: devicesSlice.reducer },
});
