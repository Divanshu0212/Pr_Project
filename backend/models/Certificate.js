const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Certificate name is required']
    },
    issuer: {
        type: String,
        required: [true, 'Issuer name is required']
    },
    issueDate: {
        type: Date,
        required: [true, 'Issue date is required']
    },
    credentialId: {
        type: String
    },
    credentialUrl: {
        type: String,
        required: [true, 'Credential URL is required']
    },
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    skills: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Certificate', certificateSchema);