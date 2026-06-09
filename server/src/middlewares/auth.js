/**
 * AppSec JWT Authentication Verification Hook
 */
export async function authenticate(request, reply) {
  try {
    // request.jwtVerify() is injected by @fastify/jwt
    await request.jwtVerify()
  } catch (err) {
    console.warn(`[AppSec Warning] Tentativa de acesso não autorizado: ${err.message}`);
    reply.status(401).send({
      error: 'Unauthorized Access',
      message: 'Token de autenticação inválido, ausente ou expirado.',
      code: 'AUTH_INVALID_TOKEN'
    })
    throw err
  }
}

export default authenticate
