import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import axiosInstance from '../utils/axiosConfig';
import { isAuthenticated } from '../utils/auth';

const BookNow = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    rollNumber: '',
    degree: '',
    college: '',
    department: '',
    section: '',
    year: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check authentication and fetch event data
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/book/${eventId}`);
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await axiosInstance.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.degree) newErrors.degree = 'Degree is required';
    if (!formData.college) newErrors.college = 'College is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.section.trim()) newErrors.section = 'Section is required';
    else if (!/^\d+$/.test(formData.section)) newErrors.section = 'Section must be a number';
    if (!formData.year) newErrors.year = 'Year of study is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axiosInstance.post(`/bookings/event/${eventId}`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        rollNumber: formData.rollNumber,
        degree: formData.degree,
        college: formData.college,
        department: formData.department,
        section: parseInt(formData.section),
        year: formData.year
      });

      // Store booking details from response for confirmation
      console.log('Booking successful:', response.data);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        navigate(`/event/${eventId}`);
      }, 3000);
      
    } catch (error) {
      console.error('Booking failed:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          setErrors({ submit: 'Authentication required. Please log in to book an event.' });
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate(`/login?redirect=/book/${eventId}`);
          }, 2000);
        } else if (status === 409) {
          setErrors({ submit: data.message });
        } else if (status === 400 && data.errors) {
          const fieldErrors = {};
          data.errors.forEach(error => {
            fieldErrors[error.path] = error.msg;
          });
          setErrors(fieldErrors);
        } else if (status === 404) {
          setErrors({ submit: 'Event not found. Please try again.' });
        } else {
          setErrors({ submit: data.message || 'Booking failed. Please try again.' });
        }
      } else {
        setErrors({ submit: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Loading event details...
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Event not found
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')}
            sx={{ mt: 2, backgroundColor: '#003285' }}
          >
            Go Back Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (submitSuccess) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Booking Confirmed! 🎉
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Your booking for <strong>{event.title}</strong> has been successfully submitted.
            You will receive a confirmation email shortly.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting you back to the event page...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ color: '#003285', fontWeight: 'bold' }}>
          Book Your Spot
        </Typography>
        
        {/* Event Summary */}
        <Card sx={{ mb: 4, backgroundColor: '#f8f9fa' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#003285' }}>
              {event.title}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Date & Time:</strong> {new Date(event.dateTime).toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Location:</strong> {event.location}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Price:</strong> ₹{event.price}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2">
                  <strong>Hosted by:</strong> {event.hostedBy?.name || event.hostedBy}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3 }} />

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom sx={{ color: '#003285', mb: 2 }}>
            Personal Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!errors.phone}
                helperText={errors.phone}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Roll Number"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                error={!!errors.rollNumber}
                helperText={errors.rollNumber}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
          </Grid>

          <Typography variant="h6" gutterBottom sx={{ color: '#003285', mt: 4, mb: 2 }}>
            Academic Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth variant="outlined" error={!!errors.degree} sx={{ height: '56px', minWidth: '200px', '& .MuiOutlinedInput-root': { height: '56px' } }}>
                <InputLabel>Degree</InputLabel>
                <Select
                  name="degree"
                  value={formData.degree}
                  onChange={handleInputChange}
                  label="Degree"
                  required
                  displayEmpty
                  sx={{ 
                    height: '56px', 
                    minWidth: '200px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.87)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#003285'
                    }
                  }}
                >
                  <MenuItem value="B.E/B.Tech">B.E/B.Tech</MenuItem>
                  <MenuItem value="MBA">MBA</MenuItem>
                  <MenuItem value="MTECH">MTECH</MenuItem>
                  <MenuItem value="MCA">MCA</MenuItem>
                </Select>
                {errors.degree && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.degree}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth variant="outlined" error={!!errors.college} sx={{ height: '56px', minWidth: '200px', '& .MuiOutlinedInput-root': { height: '56px' } }}>
                <InputLabel>College</InputLabel>
                <Select
                  name="college"
                  value={formData.college}
                  onChange={handleInputChange}
                  label="College"
                  required
                  displayEmpty
                  sx={{ 
                    height: '56px', 
                    minWidth: '200px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.87)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#003285'
                    }
                  }}
                >
                  <MenuItem value="CBIT">CBIT</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {errors.college && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.college}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth variant="outlined" error={!!errors.department} sx={{ height: '56px', minWidth: '200px', '& .MuiOutlinedInput-root': { height: '56px' } }}>
                <InputLabel>Department</InputLabel>
                <Select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  label="Department"
                  required
                  displayEmpty
                  sx={{ 
                    height: '56px', 
                    minWidth: '200px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.87)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#003285'
                    }
                  }}
                >
                  <MenuItem value="CSE">CSE</MenuItem>
                  <MenuItem value="AIML">AIML</MenuItem>
                  <MenuItem value="AIDS">AIDS</MenuItem>
                  <MenuItem value="EEE">EEE</MenuItem>
                  <MenuItem value="ECE">ECE</MenuItem>
                  <MenuItem value="MECH">MECH</MenuItem>
                  <MenuItem value="CHEMICAL">CHEMICAL</MenuItem>
                  <MenuItem value="CIVIL">CIVIL</MenuItem>
                  <MenuItem value="BIOTECH">BIOTECH</MenuItem>
                  <MenuItem value="IT">IT</MenuItem>
                </Select>
                {errors.department && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.department}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Section"
                name="section"
                type="number"
                value={formData.section}
                onChange={handleInputChange}
                error={!!errors.section}
                helperText={errors.section}
                variant="outlined"
                required
                inputProps={{ min: 1 }}
                sx={{ height: '56px' }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth variant="outlined" error={!!errors.year} sx={{ height: '56px', minWidth: '200px', '& .MuiOutlinedInput-root': { height: '56px' } }}>
                <InputLabel>Year of Study</InputLabel>
                <Select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  label="Year of Study"
                  required
                  displayEmpty
                  sx={{ 
                    height: '56px', 
                    minWidth: '200px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.23)'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(0, 0, 0, 0.87)'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#003285'
                    }
                  }}
                >
                  <MenuItem value="1">1st Year</MenuItem>
                  <MenuItem value="2">2nd Year</MenuItem>
                  <MenuItem value="3">3rd Year</MenuItem>
                  <MenuItem value="4">4th Year</MenuItem>
                </Select>
                {errors.year && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.year}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>


          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/event/${eventId}`)}
              disabled={isSubmitting}
              sx={{ 
                borderColor: '#003285', 
                color: '#003285',
                '&:hover': {
                  borderColor: '#003285',
                  backgroundColor: 'rgba(0, 50, 133, 0.04)'
                }
              }}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ 
                backgroundColor: '#003285',
                '&:hover': {
                  backgroundColor: '#002266'
                },
                minWidth: '120px'
              }}
            >
              {isSubmitting ? 'Booking...' : `Book Now - ₹${event.price}`}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default BookNow;
