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
import Schedules from './pages/Schedules';
import Destinations from './pages/Destinations';

import Profile from './pages/Profile';
import VirtualTerminalView from './pages/VirtualTerminalView';
import CooperativaDetail from './pages/CooperativaDetail';
import BookingFlow from './pages/BookingFlow';
import MyTickets from './pages/MyTickets';
import CompanyRegister from './pages/CompanyRegister';
import UnitRegistration from './pages/UnitRegistration';
import DriverSchedule from './pages/DriverSchedule';
import DriverReports from './pages/DriverReports';
import TripSummary from './pages/TripSummary';
import SeatDesigner from './pages/SeatDesigner';
import UnitConfirmation from './pages/UnitConfirmation';
import Chatbot from './components/Chatbot';

import Ticketing from './pages/erp/Ticketing';
import BusVisualizer from './pages/erp/BusVisualizer';
import ElectronicInvoicing from './pages/erp/ElectronicInvoicing';
import RoutePlanning from './pages/erp/RoutePlanning';
import CashRegisterClose from './pages/erp/CashRegisterClose';
import Configuration from './pages/erp/Configuration';
import Reports from './pages/erp/Reports';
import Terminal from './pages/erp/Terminal';
import OfflineMaster from './components/OfflineMaster';

// Municipio de Cuenca Pages
import CuencaDashboard from './pages/municipio/CuencaDashboard';
import TurismoGestion from './pages/municipio/TurismoGestion';
import DataIntel from './pages/municipio/DataIntel';
import AgendaCiudad from './pages/municipio/AgendaCiudad';
import PerfilMunicipio from './pages/municipio/PerfilMunicipio';
import Notificaciones from './pages/municipio/Notificaciones';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OfflineMaster />
        <Chatbot />
        <Routes>
          {/* Rutas Públicas - Protegidas para usuarios ya logueados */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/company-register" element={<PublicRoute><CompanyRegister /></PublicRoute>} />
          <Route path="/unit-registration" element={
            <ProtectedRoute allowedRoles={['BUS', 'OFICINA']}>
              <UnitRegistration />
            </ProtectedRoute>
          } />
          <Route path="/driver-register" element={<PublicRoute><DriverRegister /></PublicRoute>} />
          
          {/* Rutas Protegidas ROL: CLIENTE */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['CLIENTE']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/history" element={<ProtectedRoute allowedRoles={['CLIENTE']}><History /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/my-tickets" element={<ProtectedRoute allowedRoles={['CLIENTE']}><MyTickets /></ProtectedRoute>} />
          <Route path="/booking/:id" element={<ProtectedRoute allowedRoles={['CLIENTE']}><BookingFlow /></ProtectedRoute>} />

          {/* Rutas Protegidas ROL: BUS (DRIVER) */}
          <Route path="/driver-dashboard" element={
            <ProtectedRoute allowedRoles={['BUS']}>
              <DriverDashboard />
            </ProtectedRoute>
          } />
          <Route path="/driver-schedule" element={
            <ProtectedRoute allowedRoles={['BUS']}>
              <DriverSchedule />
            </ProtectedRoute>
          } />
          <Route path="/driver-reports" element={
            <ProtectedRoute allowedRoles={['BUS']}>
              <DriverReports />
            </ProtectedRoute>
          } />

          {/* Rutas Protegidas ROL: OFICINA (ERP) */}
          <Route path="/erp/ticketing" element={<ProtectedRoute allowedRoles={['OFICINA']}><Ticketing /></ProtectedRoute>} />
          <Route path="/erp/fleet" element={<ProtectedRoute allowedRoles={['OFICINA', 'BUS']}><BusVisualizer /></ProtectedRoute>} />
          <Route path="/erp/invoicing" element={<ProtectedRoute allowedRoles={['OFICINA']}><ElectronicInvoicing /></ProtectedRoute>} />
          <Route path="/erp/routing" element={<ProtectedRoute allowedRoles={['OFICINA']}><RoutePlanning /></ProtectedRoute>} />
          <Route path="/erp/cash-close" element={<ProtectedRoute allowedRoles={['OFICINA']}><CashRegisterClose /></ProtectedRoute>} />
          <Route path="/erp/terminal" element={<ProtectedRoute allowedRoles={['OFICINA']}><Terminal /></ProtectedRoute>} />
          <Route path="/erp/reports" element={<ProtectedRoute allowedRoles={['OFICINA']}><Reports /></ProtectedRoute>} />
          <Route path="/erp/settings" element={<ProtectedRoute allowedRoles={['OFICINA']}><Configuration /></ProtectedRoute>} />

          {/* Rutas Municipio de Cuenca (ROL: DATOS) */}
          <Route path="/municipio/dashboard" element={<ProtectedRoute allowedRoles={['DATOS']}><CuencaDashboard /></ProtectedRoute>} />
          <Route path="/municipio/turismo" element={<ProtectedRoute allowedRoles={['DATOS']}><TurismoGestion /></ProtectedRoute>} />
          <Route path="/municipio/data-intel" element={<ProtectedRoute allowedRoles={['DATOS']}><DataIntel /></ProtectedRoute>} />
          <Route path="/municipio/agenda" element={<ProtectedRoute allowedRoles={['DATOS']}><AgendaCiudad /></ProtectedRoute>} />
          <Route path="/municipio/perfil" element={<ProtectedRoute allowedRoles={['DATOS']}><PerfilMunicipio /></ProtectedRoute>} />
          <Route path="/municipio/notifications" element={<ProtectedRoute allowedRoles={['DATOS']}><Notificaciones /></ProtectedRoute>} />

          {/* Alias para compatibilidad anterior */}
          <Route path="/datos-dashboard" element={<ProtectedRoute allowedRoles={['DATOS']}><CuencaDashboard /></ProtectedRoute>} />

          {/* Otras Rutas (Generalmente Cliente o Admin) */}
          <Route path="/trip-summary" element={<ProtectedRoute><TripSummary /></ProtectedRoute>} />
          <Route path="/seat-designer" element={<ProtectedRoute><SeatDesigner /></ProtectedRoute>} />
          <Route path="/unit-confirmation" element={<ProtectedRoute><UnitConfirmation /></ProtectedRoute>} />
          <Route path="/terminal-schedule" element={<TerminalSchedule />} />
          <Route path="/terminal-map" element={<TerminalMap />} />
          <Route path="/cooperativa-loja" element={<CooperativaDetail />} />
          <Route path="/virtual-terminal" element={<VirtualTerminalView />} />
          <Route path="/cooperativa/:id" element={<CooperativaDetail />} />
          
          {/* Nuevas Rutas Públicas de Información */}
          <Route path="/horarios" element={<Schedules />} />
          <Route path="/destinos" element={<Destinations />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;



