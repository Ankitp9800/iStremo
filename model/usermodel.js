const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcrypt')
// const autoIncrement = require('mongoose-auto-increment');

const userSchema = new Schema({
  name: {
    type: String,
    required: true, 
    default:""
  },
  user_id: {
    type: Number,
    default: null,
    default:""
    // required: true,
  },
  password: {
    type: String,
    // required: true,
    // minlength: 8,
    // match: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
  },
  email_id: {
    type: String,
    unique: true,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    default:""
  },
  user_name: {
    type: String,
    unique: true,
    required: true,
    default:""
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true,
    default:'other'
  },
  mobile: {
    type: String,
    required: true,
    default:""
    // validate: {
    //   validator: function (value) {
    //     return /^\+\d{1,3}\s?\d{6,14}$/.test(value)
    //   },
    //   message: (props) =>
    //     `${props.value} is not a valid mobile number with country code!`,
    // },
  },
  isProfilePublic: {
    type: Boolean,
    default: true,
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status:{
    type:Boolean,
    default:false
  }
})

// userSchema.plugin(autoIncrement, { model: 'User', field: 'user_id' })
userSchema.statics.getNextOrder = async function () {
  const user = await this.countDocuments();
  return user ? user+1 : 1;
};
userSchema.pre("save", async function (next) {
  const doc = this;
  if (doc.isNew) {
    doc.user_id = await this.constructor.getNextOrder();
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
