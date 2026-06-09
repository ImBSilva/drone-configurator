import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'E-mail é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  org: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    required: [true, 'Função operacional é obrigatória'],
    enum: ['gov', 'agri', 'geo', 'security', 'ind', 'other']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 8
  }
}, {
  timestamps: true
})

// pre-save hook: Hash password securely if it was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(12) // AppSec: High work factor for secure hashing
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare input password with database hash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('User', userSchema)
export default User
