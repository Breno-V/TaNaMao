import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import tarefasRouter from './routes/tarefas.js'
import categoriasRouter from './routes/categorias.js'
import authRouter from './routes/auth.js'
import { pushRouter } from './routes/push.js'
import { startScheduler } from './notifications/scheduler.js'
import { initDb } from './db/init.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

const isProd = process.env.NODE_ENV === 'production'

const cspStyles = ["'self'"]
if (!isProd) cspStyles.push("'unsafe-inline'")

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: cspStyles,
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}))

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
  : true

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: { error: 'Muitas requisições. Tente novamente em 1 minuto.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use('/api/', apiLimiter)

app.use('/api/auth', authRouter)
app.use('/api/tarefas', tarefasRouter)
app.use('/api/categorias', categoriasRouter)
app.use('/api/push', pushRouter)

app.use((err, req, res, next) => {
  console.error('Erro interno:', err)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

const clientDist = join(__dirname, '..', 'frontend', 'dist')
app.use(express.static(clientDist))
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(clientDist, 'index.html'))
  }
})

async function start() {
  await initDb()
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
    startScheduler()
  })
}

start()
