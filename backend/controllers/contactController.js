const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rajankumart266@gmail.com',
    pass: 'nfwl gzwg nmtv zxgi'
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.log("❌ Transporter verification failed:", error);
    console.log("Error details:", error);
  } else {
    console.log("✅ Server is ready to send emails");
  }
});

// Contact form handler
const sendContactEmail = async (req, res) => {
  try {
    console.log('Received contact form submission:', req.body);
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.log('Missing required fields:', { name, email, subject, message });
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, subject, and message' 
      });
    }

    const mailOptions = {
      from: 'rajankumart266@gmail.com',
      to: 'rajankumart266@gmail.com',
      subject: `Contact Form: ${subject}`,
      text: `
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        Message: ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    console.log('📧 Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info);
    
    res.status(200).json({ 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      message: 'Failed to send email',
      error: error.message
    });
  }
};

module.exports = {
  sendContactEmail
}; 