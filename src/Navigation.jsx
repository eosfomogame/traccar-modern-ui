import { Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SettingsPage from './pages/SettingsPage';
import ReplayPage from './pages/ReplayPage';
import EventsPage from './pages/EventsPage';

const Navigation = () => (
  <Routes>
    <Route path="/login"          element={<LoginPage />} />
    <Route path="/register"       element={<RegisterPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/" element={<App />}>
      <Route index                element={<MainPage />} />
      <Route path="settings/*"    element={<SettingsPage />} />
      <Route path="replay"        element={<ReplayPage />} />
      <Route path="events"        element={<EventsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default Navigation;
