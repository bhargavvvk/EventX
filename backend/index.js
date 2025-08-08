const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/dbConnection'); 
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/eventroutes');



dotenv.config(); 

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/events', eventRoutes);
app.use('/api/auth', authRoutes); 

const PORT = process.env.PORT || 5001;
// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR HANDLER:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
