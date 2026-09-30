import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'

import authRoutes from './src/routes/authRoutes.js'
import folderRoutes from './src/routes/folderRoutes.js'
import fileRoutes from './src/routes/fileRoutes.js'
import trashRoutes from './src/routes/trashRoutes.js'
import shareRoutes from './src/routes/shareRoutes.js'
import { initDB } from './src/config/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))
app.use(cookieParser())

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)

// Initialize PostgreSQL Database Tables
initDB()

// API Endpoints
app.use('/api/auth', authRoutes)
app.use('/api/folders', folderRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/trash', trashRoutes)
app.use('/api/shares', shareRoutes)
app.use('/api/share', shareRoutes)

// Base Health Routes
app.get('/', (req, res) => {
  res.send('Drivea PERN Stack Backend API Running')
})

app.get('/api', (req, res) => {
  res.send('Drivea PERN Stack Backend API Running')
})

// Only start standalone listener when not in Vercel Serverless environment
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export default app