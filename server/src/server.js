import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import droneRoutes from './routes/droneRoutes.js'

// Load environment variables
dotenv.config()

// Connect to MongoDB
connectDB()

// Initialize Fastify with structured JSON logging
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
})

// Register CORS middleware
await fastify.register(cors, {
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

// Register JWT middleware
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'DRONE_SECURE_JWT_SECRET_KEY_SHA256_2026_PORTFOLIO_APPSEC'
})

// Health check endpoint (for container / gateway status monitoring)
fastify.get('/health', async (request, reply) => {
  return { status: 'healthy', timestamp: new Date().toISOString() }
})

// Register routes
await fastify.register(authRoutes, { prefix: '/api/auth' })
await fastify.register(droneRoutes, { prefix: '/api/drones' })

// AppSec: Fallback handler for unregistered routes to prevent information leakage
fastify.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: 'Not Found',
    message: 'Endpoint não disponível no gateway corporativo.',
    code: 'API_ENDPOINT_NOT_FOUND'
  })
})

// AppSec: Centralized error handler to prevent stack trace leaks
fastify.setErrorHandler((error, request, reply) => {
  request.log.error(error)
  
  if (error.validation) {
    return reply.status(400).send({
      error: 'Schema Validation Failed',
      message: 'Os dados fornecidos não atendem aos critérios de validação da API.',
      details: error.validation
    })
  }
  
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.name || 'API Error',
      message: error.message
    })
  }

  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Ocorreu um erro interno de processamento no servidor de segurança.'
  })
})

// Start server
const PORT = process.env.PORT || 5000
const HOST = process.env.HOST || '0.0.0.0'

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST })
    console.log(`[Server] Fastify API rodando em http://${HOST}:${PORT}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
