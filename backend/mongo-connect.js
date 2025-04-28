const mongoose = require('mongoose');

// Replace with your actual MongoDB Atlas connection string
const MONGO_URI = 'mongodb+srv://your_username:your_password@your_cluster.mongodb.net/alumni-networking?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB Atlas');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err);
  process.exit(1);
}); 