const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/alumni-networking';

// Create storage engine
const storage = new GridFsStorage({
  url: MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      // Generate a random filename
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads', // Collection name for files
          metadata: {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            uploadedBy: req.user ? req.user.uid : 'unknown',
            uploadDate: new Date()
          }
        };
        resolve(fileInfo);
      });
    });
  }
});

// Initialize multer upload
const upload = multer({ storage });

// Function to get file by filename
const getFileByFilename = async (filename) => {
  try {
    // Initialize GridFS stream
    const conn = mongoose.connection;
    const gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });

    // Find file by filename
    const files = await conn.db.collection('uploads.files').find({ filename }).toArray();
    
    if (!files || files.length === 0) {
      return null;
    }
    
    return {
      file: files[0],
      stream: gfs.openDownloadStreamByName(filename)
    };
  } catch (error) {
    console.error('Error getting file from GridFS:', error);
    throw error;
  }
};

// Function to delete file by filename
const deleteFileByFilename = async (filename) => {
  try {
    // Initialize GridFS stream
    const conn = mongoose.connection;
    const gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'uploads'
    });

    // Find file by filename
    const files = await conn.db.collection('uploads.files').find({ filename }).toArray();
    
    if (!files || files.length === 0) {
      return false;
    }
    
    // Delete file
    await gfs.delete(files[0]._id);
    return true;
  } catch (error) {
    console.error('Error deleting file from GridFS:', error);
    throw error;
  }
};

module.exports = {
  upload,
  getFileByFilename,
  deleteFileByFilename
};
