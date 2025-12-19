const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const AIConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    default: 'New chat',
    maxlength: [100, 'Title must be less than 100 characters']
  },
  messages: [MessageSchema]
}, {
  timestamps: true
});

// Indexes
AIConversationSchema.index({ userId: 1 });
AIConversationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AIConversation', AIConversationSchema);










