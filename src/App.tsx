import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Voluntarios from './pages/Voluntarios';
import Eventos from './pages/Eventos';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DenunciaForm from './pages/DenunciaForm';
import DenunciaArquivos from './pages/DenunciaArquivos';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="voluntarios" element={<Voluntarios />} />
          <Route path="eventos" element={<Eventos />} />
        </Route>

        {/* Rotas de denúncia (sem Layout) */}
        <Route path="/safadao" element={<DenunciaForm />} />
        <Route path="/safadao/arquivos" element={<DenunciaArquivos />} />

        {/* Rotas administrativas (sem Layout) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
