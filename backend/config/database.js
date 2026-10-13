import mongoose from 'mongoose';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Aman dipanggil berulang (dipakai per request oleh middleware di server.js):
// koneksi dibuat sekali lalu dipakai ulang.
export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI belum diset di file .env');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        bufferCommands: false,
        // Gagal cepat (10 detik) jika Atlas tidak terjangkau / IP belum di-whitelist,
        // bukan menggantung 30 detik (default) di setiap request
        serverSelectionTimeoutMS: 10000,
      })
      .then((conn) => {
        console.log(`[MongoDB Connected]: ${conn.connection.host} (${conn.connection.name})`);
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error(`[MongoDB Connection Error]: ${e.message}`);
    throw e;
  }

  return cached.conn;
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB Warning]: Disconnected from MongoDB cluster');
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB Error]:', err);
});
