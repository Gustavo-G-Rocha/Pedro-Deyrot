import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import DenunciasLista from './pages/DenunciasLista';
import DenunciaView from './pages/DenunciaView';
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
          <Route path="denuncias" element={<DenunciasLista />} />
        </Route>

        {/* Rotas públicas de denúncias (sem menu - fullscreen) */}
        <Route path="/denuncias/:slug" element={<DenunciaView />} />

        {/* Rotas públicas de eventos (sem menu - fullscreen) */}
        <Route path="/evento/:slug" element={<EventoView />} />

        {/* Rotas de denúncia específica Safadão (legacy) redirecionadas para o novo sistema */}
        <Route path="/safadao" element={<Navigate to="/denuncias/safadao" replace />} />
        <Route path="/safadao/arquivos" element={<Navigate to="/denuncias/safadao" replace />} />

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
