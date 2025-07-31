import React from 'react';
import { Link } from 'react-router-dom';
import EventCard from './eventCard'; // make sure path is correct
import eventsData from '../data/events.json';

const TrendingEvents = () => {
  const trendingEvents = eventsData.trendingEvents;
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">TRENDING EVENTS</h4>
        <Link to="/events" className="btn btn-outline-dark viewallbtn">View All</Link>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {trendingEvents.map((event) => (
          <div key={event.id} className="col">
            <EventCard {...event} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingEvents;
