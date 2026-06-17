import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import tarefasRouter from './routes/tarefas.js'
import authRouter from './routes/auth.js'
import { pushRouter } from './routes/push.js'
import { startScheduler } from './notifications/scheduler.js'
import { initDb } from './db/init.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRouter)
app.use('/api/tarefas', tarefasRouter)
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
