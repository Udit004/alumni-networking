const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    createdBy: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true,
        ref: "User" 
    },
    createdByRole: { type: String, enum: ["Student", "Teacher", "Alumni", "student", "teacher", "alumni"], required: true },
    registeredUsers: [{ userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" } }],
    createdAt: { type: Date, default: Date.now }
});

// Pre-find middleware to handle string IDs properly 
EventSchema.pre('find', function() {
    // Don't try to populate with invalid ObjectIds
    this.populate({ 
        path: 'createdBy',
        match: (doc) => {
            if (mongoose.Types.ObjectId.isValid(doc.createdBy)) {
                return { _id: doc.createdBy };
            }
            return { firebaseUID: doc.createdBy };
        }
    });
});

module.exports = mongoose.model("Event", EventSchema);
