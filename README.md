# Traccar Modern UI

A complete visual redesign of Traccar Web — built from scratch with a modern, dark-first design language.

## ✨ What's new vs original

| Feature | Original Traccar | This project |
|---|---|---|  
| Design system | MUI (Material) stock | Tailwind CSS custom |
| Dark mode | Optional | Default (dark-first) |
| Map background | Raster tile | CartoDB Dark Matter vector |
| Vehicle markers | Static SVG icons | Animated, rotation-aware |
| Moving indicator | None | Pulsing ring + speed label |
| Sidebar | Hard-coded Paper | Glassmorphism panel |
| Font | Roboto | Inter |
| Animations | None | Slide-in, fade, pulse |
| Status colors | MUI palette | Custom semantic colors |
| Status card | MUI list | Glassmorphism metric grid |

## 🚀 Quick start

```bash
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:8082` (default Traccar port).

## 🗂 Project structure

```
src/
  pages/
    LoginPage.jsx      # Full-screen login with grid bg + glow
    MainPage.jsx       # Map + sidebar + status card layout  
    SettingsPage.jsx   # Settings menu
  components/
    TopBar.jsx         # Glassmorphic top navigation
    StatusCard.jsx     # Floating vehicle info popup
    sidebar/
      Sidebar.jsx      # Device list with search + filters
      DeviceCard.jsx   # Individual device row with status dot
    map/
      MapView.jsx      # MapLibre GL map + marker management
      VehicleMarker.jsx # Animated, rotation-aware vehicle marker
  store/
    index.js           # Redux store with mock data
```

## 🎨 Design tokens

- **Primary**: `brand-600` (#2563eb) — blue
- **Online**: `#10b981` — emerald  
- **Moving**: `#3b82f6` — blue
- **Stopped**: `#f59e0b` — amber
- **Offline**: `#6b7280` — gray
- **Alarm**: `#ef4444` — red
- **Background**: `#0f172a` (slate-950)
- **Glass surface**: `rgba(15,23,42,0.75)` + `backdrop-filter: blur(20px)`

## 🔌 Connecting to real Traccar

Replace mock data in `src/store/index.js` with real API calls:

```js
// Replace MOCK_DEVICES with:
const res = await fetch('/api/devices');
const devices = await res.json();

// For live positions, connect WebSocket:
const ws = new WebSocket('ws://localhost:8082/api/socket');
ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  if (data.positions) dispatch(updatePosition(data.positions[0]));
};
```

## Stack

- **React 18** + Vite
- **Tailwind CSS 3** (utility-first)
- **MapLibre GL** (open-source map renderer)
- **CartoDB Dark Matter** (free vector tile style)
- **Redux Toolkit** (state management)
- **Lucide React** (icons)
- **Day.js** (date formatting)
