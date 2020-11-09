const mongoose = require('mongoose');

const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const sessionSchema = new Schema({
  userId: {
    type: ObjectId,
    ref: 'users',
    default: null
  },
  deviceId: {
    type: Object,
    required: true
  },
  userAgent: {
    type: Object,
    default: null
  },
  token: {
    type: String,
    required: true

  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  }

}, {
  versionKey: false
});

// const Session = model('sessions', sessionSchema)
module.exports = sessionSchema;
