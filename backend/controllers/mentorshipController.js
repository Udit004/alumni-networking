const Mentorship = require('../models/Mentorship');
const admin = require('firebase-admin');

// Get all mentorships
exports.getAllMentorships = async (req, res) => {
  try {
    const mentorships = await Mentorship.find();
    res.status(200).json({ success: true, mentorships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's mentorships
exports.getUserMentorships = async (req, res) => {
  try {
    const userId = req.params.userId;
    const mentorships = await Mentorship.find({ mentorId: userId });
    res.status(200).json({ success: true, mentorships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create mentorship
exports.createMentorship = async (req, res) => {
  try {
    const newMentorship = new Mentorship(req.body);
    await newMentorship.save();

    // Send notification to all students about the new mentorship using Firestore
    try {
      // Find all students
      const User = require('../models/user');
      const students = await User.find({ role: 'student' });
      console.log(`Found ${students.length} students to notify about the new mentorship`);

      // Send notification to each student
      for (const student of students) {
        try {
          if (!student.firebaseUID) {
            console.log(`Skipping notification for student ${student._id} - no Firebase UID`);
            continue;
          }

          // Create notification data
          const notificationData = {
            userId: student.firebaseUID,
            title: 'New Mentorship Opportunity',
            message: `A new mentorship "${newMentorship.title}" has been posted. Check it out!`,
            type: 'mentorship',
            itemId: newMentorship._id.toString(),
            createdBy: newMentorship.mentorId || 'system',
            read: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: new Date().toISOString()
          };

          // Add to Firestore
          const docRef = await admin.firestore().collection('notifications').add(notificationData);
          console.log(`Notification created for student ${student.firebaseUID} with ID: ${docRef.id}`);
        } catch (studentError) {
          console.error(`Error sending notification to student ${student.firebaseUID}:`, studentError);
          // Continue with next student even if one fails
        }
      }

      console.log(`Notifications sent to all students about the new mentorship: ${newMentorship.title}`);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Continue even if notification fails
    }

    res.status(201).json(newMentorship);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get single mentorship
exports.getMentorship = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }
    res.status(200).json(mentorship);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update mentorship
exports.updateMentorship = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    // Check if user is mentor
    if (mentorship.mentorId !== req.query.firebaseUID) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this mentorship' });
    }

    const updatedMentorship = await Mentorship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedMentorship);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark mentorship as completed
exports.completeMentorship = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    // Check if user is mentor
    if (mentorship.mentorId !== req.query.firebaseUID) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this mentorship' });
    }

    mentorship.status = 'completed';
    await mentorship.save();

    res.status(200).json(mentorship);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete mentorship
exports.deleteMentorship = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    // Check if user is mentor
    if (mentorship.mentorId !== req.query.firebaseUID) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this mentorship' });
    }

    await Mentorship.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Mentorship deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};