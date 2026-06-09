import mongoose from 'mongoose'

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/drone_configurator'
  
  try {
    const conn = await mongoose.connect(mongoUri)
    console.log(`[Database] MongoDB Conectado: ${conn.connection.host}`)
  } catch (error) {
    console.error(`[Database] Erro ao conectar ao MongoDB: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
