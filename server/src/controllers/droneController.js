import DroneConfig from '../models/DroneConfig.js'

// Get all drone configs for the authenticated operator
export async function getConfigs(request, reply) {
  try {
    const userId = request.user.id
    const configs = await DroneConfig.find({ user: userId }).sort({ createdAt: -1 })
    return reply.send(configs)
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Falha ao recuperar frotas de drones.'
    })
  }
}

// Create a new drone build configuration
export async function createConfig(request, reply) {
  const { name, parts, colors, total, dailyRate, missionType, fleetId } = request.body
  const userId = request.user.id

  try {
    const newConfig = new DroneConfig({
      user: userId,
      name,
      parts,
      colors,
      total,
      dailyRate,
      missionType,
      fleetId
    })

    const saved = await newConfig.save()
    return reply.status(201).send(saved)
  } catch (error) {
    request.log.error(error)
    return reply.status(400).send({
      error: 'Validation Error',
      message: 'Erro ao salvar configuração do drone.'
    })
  }
}

// Fetch a single configuration by ID (Safe against BOLA)
export async function getConfigById(request, reply) {
  const { id } = request.params
  const userId = request.user.id

  try {
    const config = await DroneConfig.findById(id)
    
    if (!config) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Configuração de drone não encontrada.'
      })
    }

    // AppSec: Verify object ownership to mitigate BOLA / IDOR
    if (config.user.toString() !== userId) {
      console.warn(`[AppSec Breach Attempt] Operador ${userId} tentou acessar drone de operador ${config.user}`);
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Acesso negado. Você não possui autorização para este recurso.'
      })
    }

    return reply.send(config)
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Falha ao buscar a especificação do drone.'
    })
  }
}

// Update an existing config (Safe against BOLA)
export async function updateConfig(request, reply) {
  const { id } = request.params
  const { name, parts, colors, total, dailyRate, missionType, fleetId } = request.body
  const userId = request.user.id

  try {
    const config = await DroneConfig.findById(id)

    if (!config) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Configuração de drone não encontrada para atualização.'
      })
    }

    // AppSec: Mitigate BOLA / IDOR
    if (config.user.toString() !== userId) {
      console.warn(`[AppSec Breach Attempt] Operador ${userId} tentou atualizar drone de operador ${config.user}`);
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Acesso negado. Você não tem permissão para editar esta configuração.'
      })
    }

    // Update values
    config.name = name || config.name
    config.parts = parts || config.parts
    config.colors = colors || config.colors
    config.total = total !== undefined ? total : config.total
    config.dailyRate = dailyRate !== undefined ? dailyRate : config.dailyRate
    config.missionType = missionType || config.missionType
    config.fleetId = fleetId !== undefined ? fleetId : config.fleetId

    const updated = await config.save()
    return reply.send(updated)
  } catch (error) {
    request.log.error(error)
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Falha ao atualizar a configuração do drone.'
    })
  }
}

// Delete a drone configuration (Safe against BOLA)
export async function deleteConfig(request, reply) {
  const { id } = request.params
  const userId = request.user.id

  try {
    const config = await DroneConfig.findById(id)

    if (!config) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Configuração de drone não encontrada para exclusão.'
      })
    }

    // AppSec: Mitigate BOLA / IDOR
    if (config.user.toString() !== userId) {
      console.warn(`[AppSec Breach Attempt] Operador ${userId} tentou excluir drone de operador ${config.user}`);
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Acesso negado. Você não tem permissão para excluir esta configuração.'
      })
    }

    await DroneConfig.deleteOne({ _id: id })
    return reply.send({
      message: 'Configuração do drone removida com sucesso.',
      id
    })
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Falha ao remover a especificação do drone.'
    })
  }
}

export default { getConfigs, createConfig, getConfigById, updateConfig, deleteConfig }
