import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TrendingEvents from '../components/trendingEvent';
import PosterCarousel from '../components/Carousel';
import { getUserRole } from '../utils/auth';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = getUserRole();
    
    // If user is logged in and is a club-admin, redirect to add-event page
    if (token && role === 'club-admin') {
      navigate('/add-event');
    }
  }, [navigate]);

  return (
    <div>
      <PosterCarousel />
      <TrendingEvents />
    </div>
  );
};

export default Home;
