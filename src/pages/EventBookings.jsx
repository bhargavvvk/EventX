import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';

const EventBookings = ({ eventId: propEventId }) => {
  const { eventId: urlEventId } = useParams();
  const eventId = propEventId || urlEventId;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventTitle, setEventTitle] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axiosInstance.get(`/bookings/event/${eventId}/all`);
        setBookings(res.data.data.bookings);
        if (res.data.data.bookings.length > 0) {
          setEventTitle(res.data.data.bookings[0].eventId.title);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [eventId]);

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/event/${eventId}/all?export=excel`, {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename
      const filename = `event-${eventId}-registrations.xlsx`;
      link.setAttribute('download', filename);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export Excel file. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Event Registrations</h3>
          {eventTitle && <p className="text-muted mb-0">Event: {eventTitle}</p>}
          <small className="text-muted">Total Registrations: {bookings.length}</small>
        </div>
        <button 
          className="btn btn-success" 
          onClick={handleExport}
          disabled={bookings.length === 0}
        >
          <i className="fas fa-download me-2"></i>
          Export to Excel
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center mt-5">
          <div className="alert alert-info">
            <h5>No Registrations Yet</h5>
            <p className="mb-0">No students have registered for this event yet.</p>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>Booking ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Roll No</th>
                <th>College</th>
                <th>Department</th>
                <th>Year</th>
                <th>Status</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td>
                    <code className="text-primary">{b.bookingId}</code>
                  </td>
                  <td className="fw-semibold">{b.fullName}</td>
                  <td>{b.email}</td>
                  <td>{b.phone}</td>
                  <td>
                    <span className="badge bg-secondary">{b.rollNumber}</span>
                  </td>
                  <td>{b.college}</td>
                  <td>{b.department}</td>
                  <td>{b.year}</td>
                  <td>
                    <span className={`badge ${
                      b.bookingStatus === 'confirmed' ? 'bg-success' : 
                      b.bookingStatus === 'pending' ? 'bg-warning' : 'bg-danger'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td>
                    <small>{new Date(b.createdAt).toLocaleString()}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventBookings;
