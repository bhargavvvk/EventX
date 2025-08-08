const Event = require('../models/Event');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');

// In-memory cache to prevent duplicate requests (simple implementation)
const activeUploads = new Map();

// Cleanup old active uploads every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  for (const [key, timestamp] of activeUploads.entries()) {
    if (timestamp < fiveMinutesAgo) {
      activeUploads.delete(key);
      console.log(`Cleaned up stale upload request: ${key}`);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// Create Event
exports.createEvent = async (req, res) => {
  let uploadedImagePublicId = null;
  let requestKey = null;
  
  try {
    const {
      title,
      description,
      longDescription,
      dateTime,
      location,
      price,
      coordinators
    } = req.body;

    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated. Please log in.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Poster image is required.' });
    }

    // Validate required fields
    if (!title || !description || !longDescription || !dateTime || !location || !price) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Parse and validate coordinators
    let parsedCoordinators;
    try {
      parsedCoordinators = JSON.parse(coordinators);
      if (!Array.isArray(parsedCoordinators) || parsedCoordinators.length === 0) {
        return res.status(400).json({ message: 'At least one coordinator is required.' });
      }
    } catch (parseError) {
      return res.status(400).json({ message: 'Invalid coordinators format.' });
    }

    // Since using multer-storage-cloudinary, file is already uploaded
    // Generate hash from file metadata for duplicate detection
    console.log('File info:', {
      path: req.file.path,
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size
    });
    
    // File is already uploaded to Cloudinary, extract public_id for cleanup
    uploadedImagePublicId = req.file.filename; // This is the public_id from Cloudinary
    
    // Generate hash from file metadata for duplicate detection
    const hashData = `${req.file.filename || req.file.originalname}_${req.file.size}_${user._id}`;
    const fileHash = crypto.createHash('md5').update(hashData).digest('hex');
    
    console.log('Generated file hash:', fileHash);
    console.log('Cloudinary public_id:', uploadedImagePublicId);
    
    // Create a unique request key for deduplication
    requestKey = `${user._id}_${title}_${fileHash}`;
    
    // Check if this exact request is already being processed
    if (activeUploads.has(requestKey)) {
      return res.status(409).json({ 
        message: 'This event is already being created. Please wait.' 
      });
    }
    
    // Mark this request as active
    activeUploads.set(requestKey, Date.now());
    
    // Check if an event with the same title by this user already exists
    const existingEvent = await Event.findOne({ 
      title: title.trim(), 
      hostedBy: user._id 
    });
    
    if (existingEvent) {
      activeUploads.delete(requestKey);
      return res.status(400).json({ 
        message: 'You already have an event with this title.' 
      });
    }

    // File is already uploaded to Cloudinary by multer-storage-cloudinary
    // Extract the information we need
    const result = {
      secure_url: req.file.path,
      public_id: req.file.filename
    };
    
    console.log('Using existing Cloudinary upload:', {
      url: result.secure_url,
      public_id: result.public_id
    });

    const newEvent = new Event({
      title: title.trim(),
      hostedBy: user._id,
      description: description.trim(),
      longDescription: longDescription.trim(),
      dateTime,
      location: location.trim(),
      price,
      coordinators: parsedCoordinators,
      posterUrl: result.secure_url,
      posterPublicId: result.public_id,
      fileHash: fileHash // Store file hash for future duplicate detection
    });

    await newEvent.save();
    
    // Clean up the request from active uploads
    activeUploads.delete(requestKey);
    
    res.status(201).json({ 
      message: 'Event created successfully', 
      event: newEvent 
    });
    
  } catch (error) {
    console.error('Create Event Error:', error);
    
    // Clean up active request tracking
    if (requestKey) {
      activeUploads.delete(requestKey);
    }
    
    // If we uploaded an image but failed to save the event, clean up the uploaded image
    if (uploadedImagePublicId) {
      try {
        await cloudinary.uploader.destroy(uploadedImagePublicId);
        console.log('Cleaned up uploaded image after event creation failure');
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded image:', cleanupError);
      }
    }
    
    // Send appropriate error response
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'An event with similar details already exists.' 
      });
    }
    
    res.status(500).json({ message: 'Server error while creating event' });
  }
};

// Get events created by logged-in user
exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ hostedBy: req.user._id });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching your events' });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, hostedBy: req.user._id });

    if (!event) return res.status(404).json({ message: 'Event not found or unauthorized' });

    if (event.posterPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(event.posterPublicId);
        if (result.result === 'ok') {
          console.log('Poster deleted from Cloudinary successfully');
        } else {
          console.log('Cloudinary deletion response:', result);
        }
      } catch (cloudErr) {
        console.error('Cloudinary deletion failed:', cloudErr);
      }
    }

    await event.deleteOne();
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};
