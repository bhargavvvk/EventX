import React, { useEffect, useState } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { isAuthenticated } from '../utils/auth'; 

const UserBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axiosInstance.get('/bookings/user/bookings');
        setBookings(res.data.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated()) fetchBookings();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading your bookings...</p>;

  if (!bookings.length) {
    return <div className="container mt-5 text-center">
      <h4>You have not registered for any events yet.</h4>
    </div>;
  }

  return (
    <div className="container mt-5">
      <h3 className="fw-bold mb-4 text-center">My Registered Events</h3>
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {bookings.map((b) => (
          <div key={b._id} className="col">
            <div className="card shadow-sm h-100">
            <img    
                    src={b.eventId.posterUrl.replace(
                      '/upload/',
                      '/upload/w_600,h_800,c_pad,b_rgb:003285/' // 👈 Cloudinary transformation
                    )}
                    alt={b.eventId.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain', // 👈 show full image inside padded box
                      borderRadius: '8px',
                      display: 'block'
                    }}
                  />
              <div className="card-body">
                <h5 className="fw-bold">{b.eventId.title}</h5>
                <p className="text-muted mb-2">{new Date(b.eventId.dateTime).toLocaleString()}</p>
                <p className="mb-1"><strong>Location:</strong> {b.eventId.location}</p>
                <p className="mb-1"><strong>Booking ID:</strong> {b.bookingId}</p>
                <p className="mb-0"><strong>Status:</strong> {b.bookingStatus}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserBookingsPage;
