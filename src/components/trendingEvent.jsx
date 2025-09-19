import React from 'react';
import { Link } from 'react-router-dom';
import EventCard from './eventCard'; // make sure path is correct
import { useState,useEffect} from 'react';
import axiosInstance from '../utils/axiosConfig';

const TrendingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try{
        const res = await axiosInstance.get('/events?sort=recent&limit=8');
        if(mounted){
          setEvents(res.data);
        }
      }
      catch(error){
        console.error('Error fetching events:', error);
      }
      finally{
        if(mounted){
          setLoading(false);
        }
      }
    };
    fetchEvents();
    return () => {
      mounted = false;
    }
  },[])
  if (loading) return <p>Loading...</p>;
  
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">TRENDING EVENTS</h4>
        <Link to="/events" className="btn btn-outline-dark viewallbtn">View All</Link>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
        {events.map((event) => (
          <div key={event._id} className="col">
            <EventCard 
              id={event._id}
              image={event.posterUrl}
              title={event.title}
              description={event.description}
              dateTime={new Date(event.dateTime).toLocaleString()}
              location={event.location}
              price={event.price}
              hostedBy={event.hostedBy.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingEvents;
