
import { useEffect } from 'react';
import { isAuthenticated, logout } from './utils/auth';
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import AllEventsPage from './pages/AllEventsPage';
import ViewEvent from './pages/ViewEvent';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      // Optionally redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<AllEventsPage />} />
        <Route path="/event/:eventId" element={<ViewEvent />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
