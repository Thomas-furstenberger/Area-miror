import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AreasPage from './pages/AreasPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import ServicesPage from './pages/ServicesPage';
import CreateAreaPage from './pages/CreateAreaPage';
import PricingPage from './pages/PricingPage';
import ResourcesPage from './pages/ResourcesPage';
import IntegrationsPage from './pages/IntegrationsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/success" element={<LoginSuccessPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/areas" element={<AreasPage />} />
        <Route path="/areas/create" element={<CreateAreaPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
