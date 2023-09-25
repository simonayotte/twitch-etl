import { redis } from './redis/client.js'
import {
  bearerToken,
  bearerTokenExpiration,
  getAuthToken,
} from './twitch/auth.js'
import { getTop1000Streams, refreshStreams } from './twitch/streams.js'
import { sleep, runEvery } from './utils/time.js'

const main = async () => {
  await redis.connect()

  // Get initial auth token
  await getAuthToken()

  // Continually find new streams in the Top 1000 by viewership
  await runEvery(getTop1000Streams, 2)
  sleep(1)

  // Refresh stream information contained in the active stream database
  await runEvery(refreshStreams, 15)
}

main()
  .catch((err) => console.error(err))
  .then()
