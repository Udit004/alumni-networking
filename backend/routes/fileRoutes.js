const express = require('express');
const router = express.Router();
const { getFileByFilename } = require('../services/gridfsStorage');

// Route to get a file by filename
router.get('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    console.log(`Fetching file: ${filename}`);

    const file = await getFileByFilename(filename);
    
    if (!file) {
      console.log(`File not found: ${filename}`);
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set the appropriate headers
    res.set('Content-Type', file.file.metadata.mimetype);
    res.set('Content-Disposition', `inline; filename="${file.file.metadata.originalname}"`);

    // Stream the file to the response
    file.stream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving file',
      error: error.message
    });
  }
});

module.exports = router;
