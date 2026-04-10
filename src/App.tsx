import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DriverRegister from './pages/DriverRegister';
import Dashboard from './pages/Dashboard';
import DriverDashboard from './pages/DriverDashboard';
import History from './pages/History';
import TerminalSchedule from './pages/TerminalSchedule';
import TerminalMap from './pages/TerminalMap';
import CooperativaLoja from './pages/CooperativaLoja';
import Profile from './pages/Profile';
import VirtualTerminalView from './pages/VirtualTerminalView';
import CooperativaDetail from './pages/CooperativaDetail';
import BookingFlow from './pages/BookingFlow';
import MyTickets from './pages/MyTickets';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver-register" element={<DriverRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/terminal-schedule" element={<TerminalSchedule />} />
        <Route path="/terminal-map" element={<TerminalMap />} />
        <Route path="/cooperativa-loja" element={<CooperativaLoja />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/virtual-terminal" element={<VirtualTerminalView />} />
        <Route path="/cooperativa/:id" element={<CooperativaDetail />} />
        <Route path="/booking/:id" element={<BookingFlow />} />
        <Route path="/my-tickets" element={<MyTickets />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



