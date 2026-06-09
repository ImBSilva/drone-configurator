import { register, login, updateProfile, updatePassword, getMe } from '../controllers/authController.js'
import { sanitizeInput } from '../middlewares/sanitize.js'
import { authenticate } from '../middlewares/auth.js'

export async function authRoutes(fastify, options) {
  // Global preHandler for all routes in this plugin to sanitize inputs
  fastify.addHook('preHandler', sanitizeInput)

  // Auth endpoints
  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'role', 'password'],
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          org: { type: 'string' },
          role: { type: 'string', enum: ['gov', 'agri', 'geo', 'security', 'ind', 'other'] },
          password: { type: 'string', minLength: 8 }
        }
      }
    }
  }, register)

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, login)

  // Update profile (name, org, role)
  fastify.put('/profile', {
    preValidation: [authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          org: { type: 'string' },
          role: { type: 'string', enum: ['gov', 'agri', 'geo', 'security', 'ind', 'other'] }
        }
      }
    }
  }, updateProfile)

  // Change password
  fastify.put('/password', {
    preValidation: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 }
        }
      }
    }
  }, updatePassword)

  // Get current authenticated user profile
  fastify.get('/me', {
    preValidation: [authenticate]
  }, getMe)
}

export default authRoutes
