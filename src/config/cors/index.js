const cors = require('cors')

const getCorsConfig = () => {
    const origins = process.env.CORS_ALLOWED_ORIGINS || ""
    return {
        enabled: process.env.CORS_ENABLED === 'true',
        origins: origins.split(',')
            .map(o => o.trim())
            .filter(Boolean) || []
    }
}

module.exports = (app) => {
    const { enabled, origins } = getCorsConfig()

    if (!enabled) {
        app.use(cors())
        return console.log('⚠️  CORS is disabled')
    }

    if (origins.length === 0) {
        return console.warn('🚨 CORS enabled but no allowed origins configured')
    }

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || origins.includes(origin)) {
                callback(null, true)
            } else {
                console.warn(`🚫 CORS rejection: ${origin}`)
                callback(new Error('CORS policy violation'))
            }
        },
        credentials: true
    }))

    console.log(`✅ CORS enabled for: ${origins.join(', ')}`)
}