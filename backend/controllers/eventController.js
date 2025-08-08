const Event = require('../models/Event');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const { default: mongoose } = require('mongoose');

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

    // Handle Cloudinary upload based on file state
    let result;
    
    if (req.file.path && req.file.path.startsWith('http')) {
      // File is already uploaded to Cloudinary (multer-storage-cloudinary)
      result = {
        secure_url: req.file.path,
        public_id: req.file.filename || `event_${user._id}_${Date.now()}_${fileHash.substring(0, 8)}`
      };
      uploadedImagePublicId = result.public_id;
    } else {
      // Upload to Cloudinary with comprehensive duplicate prevention
      const uniqueFilename = `event_${user._id}_${Date.now()}_${fileHash.substring(0, 8)}`;
      result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'event-posters',
        public_id: uniqueFilename,
        overwrite: false, // Prevent overwriting existing files
        moderation: 'duplicate:0.9', // Detect similar images with 90% threshold
        use_filename: false, // Don't use original filename
        unique_filename: true, // Ensure filename uniqueness
        resource_type: 'image',
        format: 'jpg', // Standardize format
        transformation: [
          { quality: 'auto:good' }, // Optimize quality
          { fetch_format: 'auto' } // Auto-optimize format
        ]
      });
      
      uploadedImagePublicId = result.public_id;
      
      // Check if Cloudinary detected this as a duplicate
      if (result.moderation && result.moderation.length > 0) {
        const duplicateDetection = result.moderation.find(mod => mod.kind === 'duplicate');
        if (duplicateDetection && duplicateDetection.status === 'approved') {
          console.log('Cloudinary detected potential duplicate image:', duplicateDetection);
          // Continue with creation but log the detection
        }
      }
    }

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

exports.updateEvent = async (req, res) => {
  let oldPublicId = null;
  let newPublicId = null;
  
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Store old public ID for cleanup
    if (event.posterPublicId) {
      oldPublicId = event.posterPublicId;
    }

    // Update basic fields
    event.title = req.body.title || event.title;
    event.description = req.body.description || event.description;
    event.longDescription = req.body.longDescription || event.longDescription;
    event.dateTime = req.body.dateTime || event.dateTime;
    event.location = req.body.location || event.location;
    event.price = req.body.price || event.price;
    
    // Handle coordinators
    if (req.body.coordinators) {
      try {
        event.coordinators = JSON.parse(req.body.coordinators);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid coordinators format' });
      }
    }

    // If a new poster is uploaded
    if (req.file) {
      console.log('New file uploaded:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename
      });
      
      // Generate file hash for duplicate detection (same as in createEvent)
      const hashData = `${req.file.originalname}-${req.file.size}-${req.user._id}`;
      const fileHash = crypto.createHash('md5').update(hashData).digest('hex');
      console.log('Generated file hash for update:', fileHash);
      
      // The file is already uploaded by multer-storage-cloudinary
      // and available in req.file
      event.posterUrl = req.file.path; // This is the Cloudinary URL
      event.posterPublicId = req.file.filename; // This is the Cloudinary public_id
      event.fileHash = fileHash; // Update the file hash for duplicate detection
      newPublicId = req.file.filename;
      
      // Log the update for debugging
      console.log(`Updated event ${event._id} with new poster (${req.file.filename}) and hash ${fileHash}`);
    } else if (event.posterPublicId) {
      // If no new file but we have an existing one, keep the existing file and its hash
      newPublicId = event.posterPublicId;
      console.log(`No new poster uploaded, keeping existing poster (${newPublicId})`);
    }

    // Save the updated event
    const updatedEvent = await event.save();
    
    // If we have a new image and the old one exists, delete the old one
    if (oldPublicId && newPublicId && oldPublicId !== newPublicId) {
      try {
        console.log(`Deleting old poster: ${oldPublicId}`);
        const result = await cloudinary.uploader.destroy(oldPublicId);
        console.log('Cloudinary deletion result:', result);
      } catch (cloudErr) {
        console.error('Failed to delete old poster from Cloudinary:', cloudErr);
        // Don't fail the request if deletion fails, but log it
      }
    }

    res.json(updatedEvent);

  } catch (error) {
    console.error('Update Event Error:', error);
    
    // Cleanup: If we uploaded a new image but the update failed
    if (newPublicId) {
      try {
        await cloudinary.uploader.destroy(newPublicId);
      } catch (cleanupErr) {
        console.error('Failed to cleanup new poster after error:', cleanupErr);
      }
    }
    
    res.status(400).json({ 
      message: error.message || 'Error updating event',
      details: error.errors ? Object.values(error.errors).map(e => e.message) : undefined
    });
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
