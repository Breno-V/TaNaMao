import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'organizador-dev-secret'

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function authMiddleware(req, res, next) {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).json({ error: 'Não autenticado.' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.clearCookie('token')
    return res.status(401).json({ error: 'Sessão expirada.' })
  }
}
