import User from '../models/User.js'

export async function register(request, reply) {
  const { name, email, org, role, password } = request.body

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return reply.status(409).send({
        error: 'Registration Conflict',
        message: 'Este e-mail operacional já está registrado no sistema.',
        code: 'REG_EMAIL_EXISTS'
      })
    }

    // Create user (hashing is handled by User.js pre-save hook)
    const user = new User({
      name,
      email,
      org,
      role,
      password
    })

    await user.save()

    // Sign JWT token
    const token = request.server.jwt.sign({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })

    return reply.status(201).send({
      message: 'Operador registrado com sucesso.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        org: user.org,
        role: user.role
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Falha ao processar registro de operador.'
    })
  }
}

export async function login(request, reply) {
  const { email, password } = request.body

  try {
    const user = await User.findOne({ email })
    
    // AppSec: Standard non-descriptive error message for authentication failures (prevent enum)
    const invalidAuthError = {
      error: 'Authentication Failed',
      message: 'E-mail operacional ou senha incorreta.',
      code: 'AUTH_FAILED'
    }

    if (!user) {
      return reply.status(401).send(invalidAuthError)
    }

    // Check password using custom schema method
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return reply.status(401).send(invalidAuthError)
    }

    // Generate JWT token
    const token = request.server.jwt.sign({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })

    return reply.send({
      message: 'Autenticação autorizada.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        org: user.org,
        role: user.role
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Falha durante o processo de autenticação.'
    })
  }
}

export async function updateProfile(request, reply) {
  const { name, org, role } = request.body
  try {
    const user = await User.findById(request.user.id)
    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Operador não encontrado.'
      })
    }
    if (name !== undefined) user.name = name
    if (org !== undefined) user.org = org
    if (role !== undefined) user.role = role
    await user.save()
    return reply.send({
      message: 'Perfil atualizado com sucesso.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        org: user.org,
        role: user.role
      }
    })
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Falha ao atualizar perfil.'
    })
  }
}

export async function updatePassword(request, reply) {
  const { currentPassword, newPassword } = request.body
  try {
    const user = await User.findById(request.user.id)
    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Operador não encontrado.'
      })
    }
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return reply.status(401).send({
        error: 'Authentication Failed',
        message: 'Senha atual incorreta.',
        code: 'AUTH_PASSWORD_MISMATCH'
      })
    }
    user.password = newPassword
    await user.save()
    return reply.send({
      message: 'Senha alterada com sucesso.'
    })
  } catch (error) {
    request.log.error(error)
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Falha ao alterar senha.'
    })
  }
}

export async function getMe(request, reply) {
  try {
    // request.user is set by jwtVerify in authenticate middleware
    const user = await User.findById(request.user.id).select('-password')
    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'Operador não encontrado.'
      })
    }
    return reply.send(user)
  } catch (error) {
    return reply.status(500).send({
      error: 'Server Error',
      message: 'Erro ao buscar dados do operador.'
    })
  }
}

export default { register, login, updateProfile, updatePassword, getMe }
