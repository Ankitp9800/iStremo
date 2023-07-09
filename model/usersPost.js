const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  media: {
    type: String
  },
  public: {
    type: Boolean,
    default: true
  },
  hashtags: [{
    type: String
  }],
  friendTags: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    text: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    subComments: [{
      text: {
        type: String,
        required: true
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    }]
  }], 
  likes: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
   status:{
    type:Boolean,
    default:false
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
