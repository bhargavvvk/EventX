
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
import BookNow from './pages/BookNow';
import UserBookings from './pages/UserBookings';
import EventBookings from './pages/EventBookings';

function App() {
  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<AllEventsPage />} />
        <Route path="/event/:eventId" element={<ViewEvent />} />
        <Route path="/book/:eventId" element={<BookNow />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/userbookings" element={<UserBookings />} />
        <Route path="/admin/event/:eventId/bookings" element={<EventBookings />} />
      </Routes>
    </Router>
  );
}

export default App;
