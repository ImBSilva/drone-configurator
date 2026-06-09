import { 
  getConfigs, 
  createConfig, 
  getConfigById, 
  updateConfig, 
  deleteConfig 
} from '../controllers/droneController.js'
import { sanitizeInput } from '../middlewares/sanitize.js'
import { authenticate } from '../middlewares/auth.js'

export async function droneRoutes(fastify, options) {
  // Protect all routes under this plugin with JWT authentication
  fastify.addHook('preValidation', authenticate)
  
  // Sanitize all inputs recursively for SQL/NoSQL/XSS injections
  fastify.addHook('preHandler', sanitizeInput)

  // Retrieve configurations list
  fastify.get('/', getConfigs)

  // Save new configuration
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'parts', 'colors', 'total'],
        properties: {
          name: { type: 'string', minLength: 1 },
          parts: { type: 'object' },
          colors: { type: 'object' },
          total: { type: 'number', minimum: 0 },
          dailyRate: { type: 'number', minimum: 0 },
          missionType: { type: 'string', enum: ['vigilancia', 'agricultura', 'mapeamento', 'seguranca', 'industrial', 'outro'] }
        }
      }
    }
  }, createConfig)

  // Retrieve individual configuration
  fastify.get('/:id', getConfigById)

  // Update config specs
  fastify.put('/:id', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          parts: { type: 'object' },
          colors: { type: 'object' },
          total: { type: 'number' },
          dailyRate: { type: 'number' },
          missionType: { type: 'string', enum: ['vigilancia', 'agricultura', 'mapeamento', 'seguranca', 'industrial', 'outro'] }
        }
      }
    }
  }, updateConfig)

  // Delete config
  fastify.delete('/:id', deleteConfig)
}

export default droneRoutes
