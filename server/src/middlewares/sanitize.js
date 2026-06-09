/**
 * AppSec Defensive Security Middleware
 * Mitigates NoSQL Injection (OWASP A03:2021) and XSS (OWASP A03:2021) at the API gateway level.
 */

// Recursive scanner to check for nested injection threats
function detectMaliciousInput(val) {
  if (typeof val === 'string') {
    // Check for standard NoSQL injection signatures
    const hasNoSql = /[\$\{\}]/.test(val) && (val.includes('$gt') || val.includes('$ne') || val.includes('$where') || val.includes('$eq') || val.includes('$regex'));
    // Check for standard XSS signatures
    const hasXss = /<script|javascript:|onclick|onerror|onload/i.test(val);
    
    return hasNoSql || hasXss;
  }
  
  if (typeof val === 'object' && val !== null) {
    // Check keys for NoSQL operators (keys starting with $)
    for (const key of Object.keys(val)) {
      if (key.startsWith('$')) {
        return true;
      }
      if (detectMaliciousInput(val[key])) {
        return true;
      }
    }
  }
  
  return false;
}

export async function sanitizeInput(request, reply) {
  // Scan body, query parameters and path parameters
  if (
    detectMaliciousInput(request.body) ||
    detectMaliciousInput(request.query) ||
    detectMaliciousInput(request.params)
  ) {
    console.warn(`[AppSec Alerts] Bloqueado tráfego suspeito de injeção! IP: ${request.ip}`);
    
    reply.status(400).send({
      error: 'Security Exception',
      message: 'Requisição bloqueada pelo gateway de segurança devido a caracteres ou operadores suspeitos (Injeção NoSQL / XSS mitigada).',
      code: 'APPSEC_INJECTION_MITIGATED',
      timestamp: new Date().toISOString()
    });
    
    throw new Error('APPSEC_INJECTION_MITIGATED');
  }
}

export default sanitizeInput
