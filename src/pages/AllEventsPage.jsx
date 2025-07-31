// pages/AllEventsPage.jsx
import React from 'react';
import EventCard from '../components/eventCard';
import eventsData from '../data/events.json';

const AllEventsPage = () => {
  const allEvents = eventsData.allEvents;
  
  return (
    <div className="p-6">
    <h4 className="fw-bold mb-4 text-center mt-3">ALL EVENTS</h4>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {allEvents.map((event) => (
          <div key={event.id} className="col">
            <EventCard {...event} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllEventsPage;
