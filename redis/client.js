import { createClient } from 'redis'

export const redis = createClient()

redis.on('connect', () => {
  console.log('Connected to Redis...')
})

redis.on('error', (err) => {
  console.log('Redis Client Error ', err)
})
