import mongoose from 'mongoose'

let cached = global.mongoose
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false
      })
      .then(conn => {
        console.log(`[MongoDB Connected]: ${conn.connection.host} (${conn.connection.name})`)
        return conn
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error(`[MongoDB Connection Error]: ${e.message}`)
    throw e
  }

  return cached.conn
}

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Warning]: Disconnected from MongoDB cluster')
})

mongoose.connection.on('error', err => {
  console.error('[MongoDB Error]:', err)
})
