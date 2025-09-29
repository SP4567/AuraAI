import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import aiRoutes from './routes/aiRoutes.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoutes.js'
// import { clerkClient, getAuth } from '@clerk/express'

const app = express()

await connectCloudinary()
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())
app.get('/', (req, res)=>res.send('Server is Live!'))
app.use(requireAuth())
app.use('/api/ai', aiRoutes)
app.use('/api/user', userRouter)
const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log('Server is running on port', PORT);
})
