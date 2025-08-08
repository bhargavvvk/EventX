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

router.post('/create', protect, upload.single('poster'), eventController.createEvent);
router.get('/my-events', protect, eventController.getMyEvents);
router.delete('/:id', protect, eventController.deleteEvent);

module.exports = router;
