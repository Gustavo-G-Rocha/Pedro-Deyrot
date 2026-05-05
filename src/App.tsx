import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Voluntarios from './pages/Voluntarios';
import Eventos from './pages/Eventos';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="voluntarios" element={<Voluntarios />} />
          <Route path="eventos" element={<Eventos />} />
        </Route>
      </Routes>
    </Router>
  );
}
