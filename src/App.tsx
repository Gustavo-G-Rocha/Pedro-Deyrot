import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Voluntarios from './pages/Voluntarios';
import Eventos from './pages/Eventos';
import Propostas from './pages/Propostas';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminDenuncias from './pages/AdminDenuncias';
import AdminDenunciaEditor from './pages/AdminDenunciaEditor';
import AdminCampanhas from './pages/AdminCampanhas';
import EventoView from './pages/EventoView';
import LGPD from './pages/LGPD';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="voluntarios" element={<Voluntarios />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="propostas" element={<Propostas />} />
        </Route>

        {/* Rotas públicas de eventos (sem menu - fullscreen) */}
        <Route path="/evento/:slug" element={<EventoView />} />

        {/* Página de Termos LGPD */}
        <Route path="/LGPD" element={<LGPD />} />

        {/* Rotas administrativas (sem Layout) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/denuncias" element={<AdminDenuncias />} />
        <Route path="/admin/denuncias/nova" element={<AdminDenunciaEditor />} />
        <Route path="/admin/denuncias/editar/:id" element={<AdminDenunciaEditor />} />
        <Route path="/admin/campanhas" element={<AdminCampanhas />} />
      </Routes>
    </Router>
  );
}
