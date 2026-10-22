import cors from 'cors'
import { config } from '../config/config.js'

export const corsMiddleware = (acceptedOrigins: string[] = config.corsOrigin) => cors({
    origin: (origin, callback) => {
        if(!origin || acceptedOrigins.includes(origin)) {
            return callback(null, true)
        }

        callback(null, false)
    }
})