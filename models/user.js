import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: false,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: String,
  },
  spokenLanguages: {
    type: Array,
  },
  country: {
    type: String,
  },
  addresses: {
    streetAddress: String,
    state: String,
    country: String,
    pinCode: String,
    latitude: String,
    longitude: String
  },
  role: {
    type: String,
    enum: ['influencer', 'brand', 'vendor', 'admin'],
    required: true
  },
  maritalStatus: String,
  children: Number,
  pets: Number,

  media: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'media',
      required: false
    }
  ],
  influencerType: String,
  instagram: String,
  facebook: String,
  twitter: String,
  linkedin: String,
  website: String,
  youtube: String,
  genre: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'genre',
    }
  ],
  workType: String,
  influencerSince: Number,
  createdAt: Date,
  updatedAt: Date,
}, {timestamps: true});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);
