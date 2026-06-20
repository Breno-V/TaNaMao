import jwt from 'jsonwebtoken'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '24h' })
}

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' })
  }
  try {
    const decoded = jwt.verify(token, getSecret())
    req.user = decoded
    next()
  } catch {
    res.clearCookie('token')
    return res.status(401).json({ error: 'Sessão expirada.' })
  }
}
