
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import AllEventsPage from './pages/AllEventsPage';
import ViewEvent from './pages/ViewEvent';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<AllEventsPage />} />
        <Route path="/event/:eventId" element={<ViewEvent />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
