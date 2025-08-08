import React from 'react';
import TrendingEvents from '../components/trendingEvent';
import PosterCarousel from '../components/Carousel';

const Home = () => {
  return (
    <div>
      <PosterCarousel />
      <TrendingEvents />
    </div>
  );
};

export default Home;
