import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser, selectUserRole, selectCanCreateEvents } from '../store/userSlice';

const CreateEvent = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const userRole = useAppSelector(selectUserRole);
  const canCreateEvents = useAppSelector(selectCanCreateEvents);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    longDescription: '',
    dateTime: '',
    location: '',
    price: '',
    hostedBy: '',
    image: '',
    coordinators: [{ name: '', contact: '' }]
  });

  // Check if user has permission to create events
  useEffect(() => {
    if (!canCreateEvents) {
      alert('You do not have permission to create events. Only club admins and administrators can create events.');
      navigate('/');
    }
  }, [canCreateEvents, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoordinatorChange = (index, field, value) => {
    const updatedCoordinators = [...formData.coordinators];
    updatedCoordinators[index][field] = value;
    setFormData(prev => ({
      ...prev,
      coordinators: updatedCoordinators
    }));
  };

  const addCoordinator = () => {
    setFormData(prev => ({
      ...prev,
      coordinators: [...prev.coordinators, { name: '', contact: '' }]
    }));
  };

  const removeCoordinator = (index) => {
    if (formData.coordinators.length > 1) {
      const updatedCoordinators = formData.coordinators.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        coordinators: updatedCoordinators
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Event data:', formData);
    alert('Event created successfully!');
    navigate('/');
  };

  // If user doesn't have permission, show loading or redirect
  if (!canCreateEvents) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">Create New Event</h3>
              <small>User: {user?.username} | Role: {userRole}</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Event Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Hosted By *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="hostedBy"
                      value={formData.hostedBy}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Short Description *</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Long Description</label>
                  <textarea
                    className="form-control"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleInputChange}
                    rows="5"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="dateTime"
                      value={formData.dateTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Event Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Event Coordinators</label>
                  {formData.coordinators.map((coordinator, index) => (
                    <div key={index} className="row mb-2">
                      <div className="col-md-5">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Coordinator Name"
                          value={coordinator.name}
                          onChange={(e) => handleCoordinatorChange(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-md-5">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Contact Info"
                          value={coordinator.contact}
                          onChange={(e) => handleCoordinatorChange(index, 'contact', e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => removeCoordinator(index)}
                          disabled={formData.coordinators.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addCoordinator}
                  >
                    + Add Coordinator
                  </button>
                </div>

                <div className="d-flex gap-3">
                  <button type="submit" className="btn btn-primary">
                    Create Event
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent; 