import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AreasPage from './pages/AreasPage';
import LoginSuccessPage from './pages/LoginSuccessPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/success" element={<LoginSuccessPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/areas" element={<AreasPage />} />
      </Routes>
    </Router>
  );
}

export default App;
