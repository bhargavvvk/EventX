
import './App.css';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Home from './pages/home';
import AllEventsPage from './pages/AllEventsPage';
import ViewEvent from './pages/ViewEvent';
import LoginPage from './pages/LoginPage';
import CreateEvent from './pages/CreateEvent';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<AllEventsPage />} />
          <Route path="/event/:eventId" element={<ViewEvent />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-event" element={<CreateEvent />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
