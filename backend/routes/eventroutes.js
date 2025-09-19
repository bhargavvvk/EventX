// routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

const eventController = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
router.post('/create', (req, res, next) => {
    console.log('Incoming POST /api/events/create');
    next();
  }, protect, upload.single('poster'), eventController.createEvent);


// Get all events (must come before /:id route)
router.get('/', eventController.getEvents);

// Get user's events
router.get('/my-events', protect, eventController.getMyEvents);

// Get event by ID (must come after specific routes)
router.get('/:id', eventController.getEventById);

// Update event
router.put('/:id', (req, res, next) => {
  console.log('Incoming PUT /api/events/:id', {
    params: req.params,
    body: req.body,
    file: req.file ? 'File present' : 'No file'
  });
  next();
}, protect, upload.single('poster'), eventController.updateEvent);

// Delete event
router.delete('/:id', protect, eventController.deleteEvent);


module.exports = router;

