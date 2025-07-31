import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import eventsData from '../data/events.json';
import { useAppSelector } from '../store/hooks';
import { selectIsLoggedIn } from '../store/userSlice';

const ViewEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  
  // Find the event by ID from both trending and all events
  const allEvents = [...eventsData.trendingEvents, ...eventsData.allEvents];
  const event = allEvents.find(e => e.id === parseInt(eventId));
  
  if (!event) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h2>Event not found</h2>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={event.image}
            alt={event.title}
            className="img-fluid rounded"
            style={{ width: '100%', height: '400px', objectFit: 'cover' }}
          />
          <div className="event-longdesc-section mt-4 p-3 rounded shadow-sm bg-light">
            <h5 className="fw-bold mb-2">About this Event</h5>
            <div className="event-longdesc" style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '1rem', lineHeight: '1.7' }}>
              {event.longDescription}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <h1 className="fw-bold mb-3">{event.title}</h1>
          <p className="text-muted mb-4">{event.description}</p>
          <div className="mb-3">
            <span className="badge bg-secondary">Hosted by: {event.hostedBy}</span>
          </div>
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold">Event Details</h5>
              <div className="row">
                <div className="col-6">
                  <p className="mb-2"><strong>Date & Time:</strong></p>
                  <p className="text-muted">{event.dateTime}</p>
                </div>
                <div className="col-6">
                  <p className="mb-2"><strong>Location:</strong></p>
                  <p className="text-muted">{event.location}</p>
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-2"><strong>Price:</strong></p>
                <h4 className="text-primary fw-bold">₹{event.price}</h4>
              </div>
              <div className="mt-4">
                <h6 className="fw-bold mb-2">Coordinators</h6>
                <ul className="list-unstyled mb-0">
                  {event.coordinators && event.coordinators.map((coord, idx) => (
                    <li key={idx} className="mb-1">
                      <span className="fw-semibold">{coord.name}</span> <span className="text-muted">({coord.contact})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="d-flex gap-3">
            {isLoggedIn ? (
              <button className="btn btn-primary eventbtn" style={{ backgroundColor: "#003285" }}>
                Book Now
              </button>
            ) : (
              <button 
                className="btn btn-primary eventbtn" 
                style={{ backgroundColor: "#003285" }}
                onClick={() => navigate('/login')}
              >
                Login to Book
              </button>
            )}
            <button className="btn btn-primary eventbtn" style={{ backgroundColor: "#003285" }} onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent; 