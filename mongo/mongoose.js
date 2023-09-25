import mongoose from 'mongoose'

mongoose.connect('mongodb://localhost:27017/twitch-etl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

const db = mongoose.connection

db.on('error', (error) => {
  console.error('Connection error:', error)
})

db.once('open', () => {
  console.log('Database connected successfully')
})

export default db
