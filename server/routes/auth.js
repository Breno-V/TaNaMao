import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { getPool } from '../db/init.js'
import { signToken, authMiddleware } from '../middleware/auth.js'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
})

function tryHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

router.post('/register', authLimiter, tryHandler(async (req, res) => {
  const db = getPool()
  const { nome, email, senha } = req.body

  if (!nome || !nome.trim()) {
    return res.status(400).json({ error: 'O nome é obrigatório.' })
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'O email é obrigatório.' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ error: 'Email inválido.' })
  }
  if (!senha || senha.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' })
  }

  const { rows: existing } = await db.query(
    'SELECT id FROM usuarios WHERE email = $1', [email.trim().toLowerCase()]
  )
  if (existing.length > 0) {
    return res.status(409).json({ error: 'Este email já está cadastrado.' })
  }

  const senha_hash = await bcrypt.hash(senha, 10)
  const { rows } = await db.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email',
    [nome.trim(), email.trim().toLowerCase(), senha_hash]
  )
  const user = rows[0]
  const token = signToken({ id: user.id, nome: user.nome, email: user.email })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.status(201).json({ id: user.id, nome: user.nome, email: user.email })
}))

router.post('/login', authLimiter, tryHandler(async (req, res) => {
  const db = getPool()
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' })
  }

  const { rows } = await db.query(
    'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1',
    [email.trim().toLowerCase()]
  )
  if (rows.length === 0) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' })
  }

  const user = rows[0]
  const match = await bcrypt.compare(senha, user.senha_hash)
  if (!match) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' })
  }

  const token = signToken({ id: user.id, nome: user.nome, email: user.email })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
  res.json({ id: user.id, nome: user.nome, email: user.email })
}))

router.get('/me', authMiddleware, (req, res) => {
  res.json({ id: req.user.id, nome: req.user.nome, email: req.user.email })
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.json({ ok: true })
})

export default router
