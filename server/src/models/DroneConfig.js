import mongoose from 'mongoose'

const droneConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nome da configuração é obrigatório'],
    trim: true,
    default: 'Nova Configuração'
  },
  parts: {
    frame: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      weight: { type: Number, required: true }
    },
    battery: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      weight: { type: Number, required: true },
      flight: { type: Number, required: true }
    },
    camera: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      weight: { type: Number, required: true }
    },
    motor: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      weight: { type: Number, required: true }
    },
    props: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      weight: { type: Number, required: true }
    }
  },
  colors: {
    frame: { type: String, default: 'carbon' },
    accent: { type: String, default: 'orange' }
  },
  total: {
    type: Number,
    required: true,
    default: 0
  },
  dailyRate: {
    type: Number,
    default: 0
  },
  missionType: {
    type: String,
    enum: ['vigilancia', 'agricultura', 'mapeamento', 'seguranca', 'industrial', 'outro'],
    default: 'outro'
  },
  fleetId: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, {
  timestamps: true
})

const DroneConfig = mongoose.model('DroneConfig', droneConfigSchema)
export default DroneConfig
