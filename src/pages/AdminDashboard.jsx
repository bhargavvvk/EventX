import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import axiosInstance from '../utils/axiosConfig';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myEvents, setMyEvents] = useState([]);
  const submissionInProgress = useRef(false);

  // Form state for adding events
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    dateTime: '',
    location: '',
    price: '',
    posterFile: null,
    coordinators: [
      { name: '', contact: '', required: true },
      { name: '', contact: '', required: false }
    ]
  });
  const [posterPreview, setPosterPreview] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      fetchMyEvents();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventForm(prev => ({ ...prev, posterFile: file }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoordinatorChange = (index, field, value) => {
    const updatedCoordinators = [...eventForm.coordinators];
    updatedCoordinators[index][field] = value;
    setEventForm(prev => ({ ...prev, coordinators: updatedCoordinators }));
  };

  const validateForm = () => {
    // Check required fields
    if (!eventForm.title || !eventForm.description ||
        !eventForm.longDescription || !eventForm.dateTime || !eventForm.location ||
        !eventForm.price) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return false;
    }

    // Check first coordinator is filled (only first coordinator is required)
    if (!eventForm.coordinators[0]?.name || !eventForm.coordinators[0]?.contact) {
      setMessage({ type: 'error', text: 'Please fill in the required coordinator information.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!validateForm()) {
      setLoading(false);
      submissionInProgress.current = false;
      return;
    }

    try {
      const formData = new FormData();
      Object.keys(eventForm).forEach(key => {
        if (key === 'coordinators') {
          formData.append(key, JSON.stringify(eventForm[key]));
        } else if (key === 'posterFile' && eventForm[key]) {
          formData.append('poster', eventForm[key]);
        } else if (key !== 'posterFile') {
          formData.append(key, eventForm[key]);
        }
      });

      // Assume the request is successful if it doesn't throw an error.
      await axiosInstance.post('/events/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // The single source of truth for success handling:
      setMessage({ type: 'success', text: 'Event created successfully!' });
      setEventForm({
        title: '',
        description: '',
        longDescription: '',
        dateTime: '',
        location: '',
        price: '',
        posterFile: null,
        coordinators: [
          { name: '', contact: '', required: true },
          { name: '', contact: '', required: false }
        ]
      });
      setPosterPreview(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (error) {
      console.error('Event creation error:', error);
      // The catch block is now ONLY for actual errors.
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to create event. Please try again.'
      });
    } finally {
      setLoading(false);
      submissionInProgress.current = false;
    }
  };

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/events/my-events');
      setMyEvents(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to fetch your events. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axiosInstance.delete(`/events/${eventId}`);
        setMessage({ type: 'success', text: 'Event deleted successfully!' });
        fetchMyEvents();
      } catch (error) {
        setMessage({
          type: 'error',
          text: 'Failed to delete event. Please try again.'
        });
      }
    }
  };

  return (
    <AppProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#003285', fontWeight: 'bold' }}>
            Admin Dashboard
          </Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: '', text: '' })}>
              {message.text}
            </Alert>
          )}

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin dashboard tabs">
              <Tab
                icon={<AddIcon />}
                label="Add Event"
                id="admin-tab-0"
                aria-controls="admin-tabpanel-0"
              />
              <Tab
                icon={<EventIcon />}
                label="My Events"
                id="admin-tab-1"
                aria-controls="admin-tabpanel-1"
              />
            </Tabs>
          </Box>

          {/* Add Event Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom sx={{ color: '#003285' }}>
              Create New Event
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                {/* First Row: Event Title, Short Description */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="title"
                    label="Event Title"
                    value={eventForm.title}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    required
                    name="description"
                    label="Short Description"
                    value={eventForm.description}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/);
                      if (words.length <= 7 || e.target.value.length < eventForm.description.length) {
                        handleInputChange(e);
                      }
                    }}
                    variant="outlined"
                    size="small"
                    helperText={`${eventForm.description.trim() ? eventForm.description.trim().split(/\s+/).length : 0}/7 words`}
                  />
                </Grid>

                {/* Third Row: Date & Time, Location, Price, Poster Upload */}
                <Grid item xs={12} container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      required
                      name="dateTime"
                      label="Date & Time"
                      type="datetime-local"
                      value={eventForm.dateTime}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      required
                      name="location"
                      label="Location"
                      value={eventForm.location}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      required
                      name="price"
                      label="Price (₹)"
                      type="number"
                      value={eventForm.price}
                      onChange={handleInputChange}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="poster-upload"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="poster-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          fullWidth
                          size="small"
                          sx={{ height: '40px' }}
                        >
                          Upload Poster
                        </Button>
                      </label>
                      {posterPreview && (
                        <Box mt={1}>
                          <img
                            src={posterPreview}
                            alt="Poster preview"
                            style={{ width: '100%', maxHeight: '100px', objectFit: 'cover' }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Detailed Description - Full Width Below */}
              <Box sx={{ mt: 3, width: '100%' }}>
                <TextField
                  fullWidth
                  required
                  name="longDescription"
                  label="Detailed Description (max 200 words)"
                  value={eventForm.longDescription}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/);
                    if (words.length <= 200 || e.target.value.length < eventForm.longDescription.length) {
                      handleInputChange(e);
                    }
                  }}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={6}
                  helperText={`${eventForm.longDescription.trim() ? eventForm.longDescription.trim().split(/\s+/).length : 0}/200 words`}
                />
              </Box>

              {/* Coordinators Section */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#003285' }}>
                    Event Coordinators
                  </Typography>
                  {eventForm.coordinators.map((coordinator, index) => (
                    <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required={index === 0} // Only first coordinator is required
                          label={`Coordinator ${index + 1} Name`}
                          value={coordinator.name}
                          onChange={(e) => handleCoordinatorChange(index, 'name', e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          required={index === 0} // Only first coordinator is required
                          label={`Coordinator ${index + 1} Contact`}
                          value={coordinator.contact}
                          onChange={(e) => handleCoordinatorChange(index, 'contact', e.target.value)}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  ))}
                  {/* Coordinator add button removed as per requirements */}
                </Grid>
              </Grid>

              {/* Create Event Button at the end */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    backgroundColor: '#003285',
                    '&:hover': {
                      backgroundColor: '#002266',
                    },
                    px: 4,
                    py: 1.5
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Event'}
                </Button>
              </Box>
            </Box>
          </TabPanel>

          {/* My Events Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom sx={{ color: '#003285' }}>
              My Events
            </Typography>

            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {myEvents.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                      No events created yet. Create your first event using the "Add Event" tab.
                    </Typography>
                  </Grid>
                ) : (
                  myEvents.map((event) => (
                    <Grid item xs={12} md={6} lg={4} key={event._id}>
                      <Card elevation={2}>
                        <CardContent>
                          <Typography variant="h6" component="h2" gutterBottom>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {event.description}
                          </Typography>
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: '#003285' }} />
                            <Typography variant="body2">
                              {new Date(event.dateTime).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationOnIcon fontSize="small" sx={{ mr: 1, color: '#003285' }} />
                            <Typography variant="body2">
                              {event.location}
                            </Typography>
                          </Box>
                          <Chip
                            label={`₹${event.price}`}
                            color="primary"
                            size="small"
                            sx={{ backgroundColor: '#003285' }}
                          />
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => window.open(`/event/${event._id}`, '_blank')}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => deleteEvent(event._id)}
                          >
                            Delete
                          </Button>
                          
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </TabPanel>
        </Paper>
      </Container>
    </AppProvider>
  );
};

export default AdminDashboard;