import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRoutes from './routes/aiRoutes.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'

const app = express()

// Connect Cloudinary
await connectCloudinary()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

// --- API routes ---
app.get('/api', (req, res) => res.send('Server is Live!'))
app.use('/api/ai', requireAuth(), aiRoutes)
app.use('/api/user', requireAuth(), userRouter)

// --- Serve React frontend build ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client')))

// ✅ Catch-all (Express 5 needs `/*`)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
