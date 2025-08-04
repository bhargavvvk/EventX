import React, { useState, useCallback } from 'react';
import {
  Button,
  TextField,
  Box,
  Paper,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  Chip,
  OutlinedInput,
  InputAdornment,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Divider,
} from '@mui/material';
import {
  Event,
  LocationOn,
  AccessTime,
  Person,
  Email,
  Phone,
  Business,
  AttachMoney,
  Category,
  Description,
} from '@mui/icons-material';
import { AppProvider } from '@toolpad/core/AppProvider';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const steps = ['Event Details', 'Organizer Information', 'Additional Settings'];

const eventCategories = [
  'Conference',
  'Workshop',
  'Seminar',
  'Networking',
  'Social',
  'Sports',
  'Cultural',
  'Educational',
  'Business',
  'Entertainment',
  'Other'
];

export default function AddEvent() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [eventData, setEventData] = useState({
    // Event Details
    eventName: '',
    eventDescription: '',
    eventCategory: '',
    eventType: 'in-person', // in-person, virtual, hybrid
    eventDate: '',
    eventTime: '',
    eventEndDate: '',
    eventEndTime: '',
    venue: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    maxAttendees: '',
    
    // Organizer Information
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    organizerCompany: '',
    organizerDesignation: '',
    
    // Additional Settings
    registrationRequired: 'yes',
    ticketPrice: '',
    isFree: 'yes',
    registrationDeadline: '',
    specialInstructions: '',
    tags: [],
    websiteUrl: '',
    socialMediaLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });

  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSocialMediaChange = useCallback((platform) => (e) => {
    const value = e.target.value;
    setEventData(prev => ({
      ...prev,
      socialMediaLinks: {
        ...prev.socialMediaLinks,
        [platform]: value
      }
    }));
  }, []);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      
      // Here you would typically send the data to your backend
      const response = await axios.post('http://localhost:5001/api/events', eventData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess('Event created successfully!');
      setTimeout(() => {
        navigate('/events');
      }, 2000);
    } catch (err) {
      console.error('Event creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    }
  };

  const renderEventDetails = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="#003285">
        Event Information
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Event Name"
            value={eventData.eventName}
            onChange={handleInputChange('eventName')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Event fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Event Description"
            value={eventData.eventDescription}
            onChange={handleInputChange('eventDescription')}
            multiline
            rows={3}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Description fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small" required>
            <InputLabel>Event Category</InputLabel>
            <Select
              value={eventData.eventCategory}
              onChange={handleInputChange('eventCategory')}
              label="Event Category"
            >
              {eventCategories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              Event Type
            </Typography>
            <RadioGroup
              row
              value={eventData.eventType}
              onChange={handleInputChange('eventType')}
            >
              <FormControlLabel value="in-person" control={<Radio size="small" />} label="In-Person" />
              <FormControlLabel value="virtual" control={<Radio size="small" />} label="Virtual" />
              <FormControlLabel value="hybrid" control={<Radio size="small" />} label="Hybrid" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Event Date"
            type="date"
            value={eventData.eventDate}
            onChange={handleInputChange('eventDate')}
            required
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Event Time"
            type="time"
            value={eventData.eventTime}
            onChange={handleInputChange('eventTime')}
            required
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccessTime fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Event End Date"
            type="date"
            value={eventData.eventEndDate}
            onChange={handleInputChange('eventEndDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Event End Time"
            type="time"
            value={eventData.eventEndTime}
            onChange={handleInputChange('eventEndTime')}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        
        {eventData.eventType !== 'virtual' && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Venue Name"
                value={eventData.venue}
                onChange={handleInputChange('venue')}
                required={eventData.eventType !== 'virtual'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Address"
                value={eventData.address}
                onChange={handleInputChange('address')}
                required={eventData.eventType !== 'virtual'}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="City"
                value={eventData.city}
                onChange={handleInputChange('city')}
                required={eventData.eventType !== 'virtual'}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="State"
                value={eventData.state}
                onChange={handleInputChange('state')}
                required={eventData.eventType !== 'virtual'}
              />
            </Grid>
            
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="Pincode"
                value={eventData.pincode}
                onChange={handleInputChange('pincode')}
                required={eventData.eventType !== 'virtual'}
              />
            </Grid>
          </>
        )}
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Maximum Attendees"
            type="number"
            value={eventData.maxAttendees}
            onChange={handleInputChange('maxAttendees')}
            required
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderOrganizerInfo = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="#003285">
        Organizer Details
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Organizer Name"
            value={eventData.organizerName}
            onChange={handleInputChange('organizerName')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Email"
            type="email"
            value={eventData.organizerEmail}
            onChange={handleInputChange('organizerEmail')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Phone Number"
            value={eventData.organizerPhone}
            onChange={handleInputChange('organizerPhone')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Company/Organization"
            value={eventData.organizerCompany}
            onChange={handleInputChange('organizerCompany')}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Business fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Designation/Title"
            value={eventData.organizerDesignation}
            onChange={handleInputChange('organizerDesignation')}
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderAdditionalSettings = () => (
    <Box>
      <Typography variant="h6" gutterBottom color="#003285">
        Registration & Pricing
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              Registration Required?
            </Typography>
            <RadioGroup
              row
              value={eventData.registrationRequired}
              onChange={handleInputChange('registrationRequired')}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl component="fieldset">
            <Typography variant="subtitle2" gutterBottom>
              Is this a free event?
            </Typography>
            <RadioGroup
              row
              value={eventData.isFree}
              onChange={handleInputChange('isFree')}
            >
              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
            </RadioGroup>
          </FormControl>
        </Grid>
        
        {eventData.isFree === 'no' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Ticket Price (₹)"
              type="number"
              value={eventData.ticketPrice}
              onChange={handleInputChange('ticketPrice')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        )}
        
        {eventData.registrationRequired === 'yes' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Registration Deadline"
              type="date"
              value={eventData.registrationDeadline}
              onChange={handleInputChange('registrationDeadline')}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Website URL"
            value={eventData.websiteUrl}
            onChange={handleInputChange('websiteUrl')}
            placeholder="https://example.com"
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Social Media Links (Optional)
          </Typography>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Facebook"
            value={eventData.socialMediaLinks.facebook}
            onChange={handleSocialMediaChange('facebook')}
            placeholder="https://facebook.com/event"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Twitter"
            value={eventData.socialMediaLinks.twitter}
            onChange={handleSocialMediaChange('twitter')}
            placeholder="https://twitter.com/event"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="Instagram"
            value={eventData.socialMediaLinks.instagram}
            onChange={handleSocialMediaChange('instagram')}
            placeholder="https://instagram.com/event"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="LinkedIn"
            value={eventData.socialMediaLinks.linkedin}
            onChange={handleSocialMediaChange('linkedin')}
            placeholder="https://linkedin.com/event"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            size="small"
            label="Special Instructions"
            value={eventData.specialInstructions}
            onChange={handleInputChange('specialInstructions')}
            multiline
            rows={3}
            placeholder="Any special instructions for attendees..."
          />
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderEventDetails();
      case 1:
        return renderOrganizerInfo();
      case 2:
        return renderAdditionalSettings();
      default:
        return 'Unknown step';
    }
  };

  return (
    <AppProvider theme={theme}>
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 4,
            marginBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
            <Typography variant="h4" component="h1" gutterBottom color="#003285" textAlign="center">
              Create New Event
            </Typography>
            <Typography variant="subtitle1" gutterBottom textAlign="center" color="text.secondary">
              Fill in the details to create your event listing
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  variant="outlined"
                  size="small"
                >
                  Back
                </Button>
                
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#003285',
                      '&:hover': {
                        backgroundColor: '#002266',
                      },
                    }}
                  >
                    Create Event
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: '#003285',
                      '&:hover': {
                        backgroundColor: '#002266',
                      },
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </AppProvider>
  );
}