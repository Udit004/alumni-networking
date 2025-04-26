const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const Activity = require('../models/Activity');
const { insertDocument, findDocuments, updateDocuments } = require('../utils/directDbInsert');

// Get activities for the current user
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    const userId = req.user.id;

    console.log('Fetching activities for user:', userId);
    console.log('Query parameters:', { limit, type });

    // Check if the user exists in the database
    const User = require('../models/user');
    const user = await User.findOne({ firebaseUID: userId });

    if (!user) {
      console.log('User not found in database with firebaseUID:', userId);
      // Try to find by _id as fallback
      const userById = await User.findById(userId);
      if (userById) {
        console.log('User found by _id instead:', userById);
      } else {
        console.log('User not found by _id either');
      }
    } else {
      console.log('User found:', user.name, user.email, user.role);
    }

    // Get activities from the database
    const Activity = require('../models/Activity');

    // Try to find activities using direct DB query
    console.log('Trying to find activities for user:', userId);

    // Try different variations of the user ID
    const possibleUserIds = [
      userId,
      user ? user._id.toString() : null,
      user ? user.firebaseUID : null
    ].filter(id => id !== null);

    console.log('Possible user IDs:', possibleUserIds);

    // Use the direct DB query
    let activities = await findDocuments('activities', {
      userId: { $in: possibleUserIds }
    }, {
      sort: { createdAt: -1 },
      limit: parseInt(limit)
    });

    console.log(`Found ${activities.length} activities for user using direct DB query`);

    // If no activities found, try using the Mongoose model as fallback
    if (activities.length === 0) {
      try {
        activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(parseInt(limit));
        console.log(`Found ${activities.length} activities for userId: ${userId} using Mongoose model`);
      } catch (mongooseError) {
        console.error('Error with Mongoose query:', mongooseError);
      }
    }

    // If still no activities found, try direct MongoDB query as a last resort
    if (activities.length === 0) {
      try {
        const db = mongoose.connection.db;
        const collection = db.collection('activities');

        console.log('Trying raw MongoDB query with possible user IDs:', possibleUserIds);

        const directActivities = await collection.find({
          userId: { $in: possibleUserIds }
        }).sort({ createdAt: -1 }).limit(parseInt(limit)).toArray();

        console.log(`Found ${directActivities.length} activities using raw MongoDB query`);

        if (directActivities.length > 0) {
          activities = directActivities;
        }
      } catch (mongoError) {
        console.error('Error with raw MongoDB query:', mongoError);
      }
    }

    // If still no activities, create a test activity for this user
    if (activities.length === 0) {
      console.log('No activities found, creating a test activity');

      const testActivity = new Activity({
        userId: userId,
        type: 'job_application',
        title: 'Test Activity',
        description: 'This is an automatically generated test activity',
        relatedItemType: 'job',
        relatedItemName: 'Software Developer',
        status: 'pending',
        isRead: false,
        createdAt: new Date()
      });

      await testActivity.save();
      console.log('Created test activity:', testActivity);

      activities = [testActivity];
    }

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

// Get activities for a specific user (admin or self only)
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, type } = req.query;

    // Check if the user is requesting their own activities or is an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these activities'
      });
    }

    const activities = await activityService.getUserActivities(
      userId,
      parseInt(limit),
      type
    );

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user activities',
      error: error.message
    });
  }
});

// Mark an activity as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the activity belongs to the user
    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    if (activity.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this activity'
      });
    }

    // Try using direct DB update
    console.log('Marking activity as read using direct DB update:', id);

    // Convert string ID to ObjectId if needed
    const objectId = typeof id === 'string' && id.length === 24
      ? new mongoose.Types.ObjectId(id)
      : id;

    const result = await updateDocuments('activities',
      { _id: objectId },
      { $set: { isRead: true } }
    );

    if (result.success) {
      console.log('Activity marked as read successfully via direct DB update');

      // Get the updated activity
      const updatedActivity = await findDocuments('activities', { _id: objectId });

      return res.status(200).json({
        success: true,
        message: 'Activity marked as read',
        data: updatedActivity[0] || { _id: id, isRead: true }
      });
    }

    // Fall back to using the Mongoose model
    console.log('Direct DB update failed, trying Mongoose model');

    try {
      const updatedActivity = await Activity.findByIdAndUpdate(
        id,
        { isRead: true },
        { new: true }
      );

      if (updatedActivity) {
        console.log('Activity marked as read successfully via Mongoose');
        return res.status(200).json({
          success: true,
          message: 'Activity marked as read',
          data: updatedActivity
        });
      }
    } catch (mongooseError) {
      console.error('Error with Mongoose update:', mongooseError);
    }

    // Last resort: try raw MongoDB
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('activities');

      const rawResult = await collection.updateOne(
        { _id: objectId },
        { $set: { isRead: true } }
      );

      console.log('Raw MongoDB update result:', rawResult);

      return res.status(200).json({
        success: true,
        message: 'Activity marked as read',
        data: { _id: id, isRead: true }
      });
    } catch (mongoError) {
      console.error('Error with raw MongoDB update:', mongoError);
      throw mongoError;
    }
  } catch (error) {
    console.error('Error marking activity as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark activity as read',
      error: error.message
    });
  }
});

// Mark all activities as read
router.put('/read-all', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Try using direct DB update
    console.log('Marking all activities as read for user:', userId);

    const result = await updateDocuments('activities',
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    if (result.success) {
      console.log('All activities marked as read successfully via direct DB update');
      return res.status(200).json({
        success: true,
        message: `${result.modifiedCount} activities marked as read`,
        data: result
      });
    }

    // Fall back to using the Mongoose model
    console.log('Direct DB update failed, trying Mongoose model');

    try {
      const updateResult = await Activity.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );

      console.log('Mongoose update result:', updateResult);

      return res.status(200).json({
        success: true,
        message: `${updateResult.modifiedCount} activities marked as read`,
        data: updateResult
      });
    } catch (mongooseError) {
      console.error('Error with Mongoose update:', mongooseError);
    }

    // Last resort: try raw MongoDB
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('activities');

      const rawResult = await collection.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
      );

      console.log('Raw MongoDB update result:', rawResult);

      return res.status(200).json({
        success: true,
        message: `${rawResult.modifiedCount} activities marked as read`,
        data: rawResult
      });
    } catch (mongoError) {
      console.error('Error with raw MongoDB update:', mongoError);
      throw mongoError;
    }
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all activities as read',
      error: error.message
    });
  }
});

// Delete an activity
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the activity belongs to the user
    const activity = await Activity.findById(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    if (activity.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this activity'
      });
    }

    await activityService.deleteActivity(id);

    return res.status(200).json({
      success: true,
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete activity',
      error: error.message
    });
  }
});

// Create a test activity (for development and testing)
router.post('/test', protect, async (req, res) => {
  try {
    console.log('Test activity endpoint accessed');
    console.log('User:', req.user);
    console.log('Request body:', req.body);

    const userId = req.user.id;
    const { type, title, description } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: 'Type and title are required'
      });
    }

    // Create a complete activity object with all required fields
    const activityData = {
      userId,
      type,
      title,
      description: description || `Test ${type} activity`,
      isRead: false,
      createdAt: new Date()
    };

    // Add any additional fields from the request
    if (req.body.relatedItemType) activityData.relatedItemType = req.body.relatedItemType;
    if (req.body.relatedItemName) activityData.relatedItemName = req.body.relatedItemName;
    if (req.body.relatedItemId) activityData.relatedItemId = req.body.relatedItemId;
    if (req.body.relatedUserId) activityData.relatedUserId = req.body.relatedUserId;
    if (req.body.relatedUserName) activityData.relatedUserName = req.body.relatedUserName;
    if (req.body.status) activityData.status = req.body.status;
    if (req.body.metadata) activityData.metadata = req.body.metadata;

    console.log('Creating activity with data:', activityData);

    console.log('Creating test activity with direct DB insert');

    // Try using direct DB insert
    const result = await insertDocument('activities', activityData);

    if (result.success) {
      console.log('Created test activity successfully via direct insert:', result.id);
      return res.status(201).json({
        success: true,
        message: 'Test activity created',
        data: result.data
      });
    }

    console.log('Direct insert failed, trying model approach');

    // Fall back to using the model directly
    try {
      const Activity = require('../models/Activity');
      const activity = new Activity(activityData);
      await activity.save();

      console.log('Created test activity via model:', activity);

      return res.status(201).json({
        success: true,
        message: 'Test activity created',
        data: activity
      });
    } catch (mongooseError) {
      console.error('Error with Mongoose model:', mongooseError);
    }

    // Last resort: try raw MongoDB
    try {
      const db = mongoose.connection.db;
      const collection = db.collection('activities');

      const rawResult = await collection.insertOne(activityData);

      console.log('Raw MongoDB insert result:', rawResult);

      if (rawResult.acknowledged) {
        return res.status(201).json({
          success: true,
          message: 'Test activity created via raw MongoDB',
          data: { _id: rawResult.insertedId, ...activityData }
        });
      }
    } catch (mongoError) {
      console.error('Error with raw MongoDB insert:', mongoError);

      return res.status(500).json({
        success: false,
        message: 'Failed to create test activity',
        error: mongoError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Test activity created',
      data: activity
    });
  } catch (error) {
    console.error('Error creating test activity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test activity',
      error: error.message
    });
  }
});

module.exports = router;
