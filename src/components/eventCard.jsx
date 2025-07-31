import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ id, image, title, description, dateTime, location, price, hostedBy }) => {
  const navigate = useNavigate();

  const handleViewEvent = () => {
    navigate(`/event/${id}`);
  };

  return (
    <div className="card card-hover mb-5">
      <img
        src={image}
        className="card-img-top"
        alt={title}
        style={{
          height: '200px',
          width: '100%',
          objectFit: 'contain',
          backgroundColor: '#7895CB' // Optional: Helps when image doesn't fill the area
        }}
      />
      <div className="card-body">
        <h5 className="card-title fw-bold">{title}</h5>
        <p className="card-text text-muted">{description}</p>
        <p className="card-text"><small className="text-muted">Hosted by: {hostedBy}</small></p>
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">{dateTime}</li>
        <li className="list-group-item">{location}</li>
        <li className="list-group-item fw-semibold">₹{price}</li>
      </ul>
      <div className="hover-button hide vieweventbtn">
        <button 
          className="btn btn-primary" 
          style={{ backgroundColor: "#003285", color: "white" }}
          onClick={handleViewEvent}
        >
          View Event
        </button>
      </div>
    </div>
  );
};

export default EventCard;


