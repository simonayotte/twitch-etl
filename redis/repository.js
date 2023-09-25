import { Repository } from 'redis-om'
import { redis } from './client.js'
import { streamSchema } from './streamSchema.js'

export const streamRepository = new Repository(streamSchema, redis)
