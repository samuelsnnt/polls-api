import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const optionSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    votes: {
        type: Number,
        default: 0
    },
    votesID: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        default: []
    }]
});

const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + 7);

const Poll = new Schema({
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: false,
        default: 'None'
    },
    options: {
        type: [optionSchema], // Object array
        validate: { // Perform validation
            validator: function(val){ // Executes a function with an Array as its parameter
                return val.length >= 2 && val.length <= 6;
            },
            message: 'The poll must have between 2 and 6 options.'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expiresAt: {
        type: Date,
        default: expiresAt,
    },
    privacy: {
        type: Boolean,
        default: false
    },
    visibleBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }]
});

export default mongoose.model('polls', Poll);