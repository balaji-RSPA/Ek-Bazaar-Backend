const mongoose = require('mongoose');

const { Schema, Types } = mongoose;
const { ObjectId } = Types;

const sessionLogSchema = new Schema({
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
    default: null

  },
  signIn: {
    type: Date,
    default: Date.now
  },
  signOut: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  }

}, {
  timestamps: true,
  versionKey: false
});

// const SessionLog = model('sessionLogs', sessionLogSchema)
module.exports = sessionLogSchema;
