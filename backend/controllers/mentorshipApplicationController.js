const MentorshipApplication = require('../models/MentorshipApplication');
const Mentorship = require('../models/Mentorship');

exports.applyForMentorship = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { name, email, phone, currentYear, program, skills, experience, whyInterested, additionalInfo } = req.body;

    // Check if mentorship exists
    const mentorship = await Mentorship.findById(mentorshipId);
    if (!mentorship) {
      return res.status(404).json({ message: 'Mentorship not found' });
    }

    // Check if user has already applied
    const existingApplication = await MentorshipApplication.findOne({
      mentorshipId,
      userId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this mentorship' });
    }

    // Create new application
    const application = new MentorshipApplication({
      mentorshipId,
      userId: req.user._id,
      name,
      email,
      phone,
      currentYear,
      program,
      skills,
      experience,
      whyInterested,
      additionalInfo
    });

    await application.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error applying for mentorship:', error);
    res.status(500).json({ message: 'Error applying for mentorship' });
  }
};

exports.getMentorshipApplications = async (req, res) => {
  try {
    const applications = await MentorshipApplication.find({ userId: req.user._id })
      .populate('mentorshipId')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Error fetching mentorship applications:', error);
    res.status(500).json({ message: 'Error fetching mentorship applications' });
  }
};

exports.getMentorshipApplication = async (req, res) => {
  try {
    const application = await MentorshipApplication.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('mentorshipId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching mentorship application:', error);
    res.status(500).json({ message: 'Error fetching mentorship application' });
  }
}; 