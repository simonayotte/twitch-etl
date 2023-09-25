import { bearerToken, refreshToken, TWITCH_ID } from './auth.js'
import { streamRepository } from '../redis/repository.js'
import https from 'https'
import { redis } from '../redis/client.js'
import { sleep } from '../utils/time.js'
import db from '../mongo/mongoose.js'
import { saveNewStream } from '../mongo/models/stream.js'
import { createNewStreamer } from '../mongo/models/streamer.js'

//Finds new streams on twitch by number of viewers and populate Redis DB with any new stream found, limited to 100 streams per requests
export async function findNewStreams(cursor) {
  refreshToken()
  const options = {
    hostname: 'api.twitch.tv',
    path: 'helix/streams?first=100',
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_ID,
      Authorization: `Bearer ${bearerToken}`,
    },
  }

  if (cursor) options.path += `&after=${cursor}`

  const findNewStreamsPromise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', async () => {
        const parsedData = JSON.parse(data)

        for (const stream of parsedData.data) {
          // Check if new stream already exists in the database
          const fetchedStream = await streamRepository.fetch(stream.user_id)

          // Ignore existing streams
          if (fetchedStream.id) continue

          // Adding only new streams to the DB
          // Formating stream to be compatible with schema
          stream.viewer_count = [stream.viewer_count]
          stream.first_seen = new Date().toISOString().split('.')[0] + 'Z'
          stream.last_updated = new Date().toISOString().split('.')[0] + 'Z'
          console.log(`Saved stream ${stream.id}`)
          await streamRepository.save(stream.user_id, stream)
        }

        resolve(parsedData.pagination ? parsedData.pagination.cursor : null)
      })
    })

    req.on('error', (error) => {
      reject('Error making request: ' + error)
    })

    req.end()
  })
  return findNewStreamsPromise
}

export async function getTop1000Streams() {
  let cursor
  let pages = 0

  console.log('Updating Top 1000 streams by viewers...')
  while (pages < 10 && cursor !== null) {
    cursor = await findNewStreams(cursor)
    pages++
  }
  console.log('Updated Top 1000 streams by viewers')
}

// Refreshes the active stream information based on the userID
export async function refreshStream(userID) {
  refreshToken()
  const options = {
    hostname: 'api.twitch.tv',
    path: `helix/streams?first=1&user_id=${userID}`,
    method: 'GET',
    headers: {
      'Client-ID': TWITCH_ID,
      Authorization: `Bearer ${bearerToken}`,
    },
  }

  const refreshStreamPromise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', async () => {
        const parsedData = JSON.parse(data)

        for (const stream of parsedData.data) {
          // Check if new stream already exists in the database
          const fetchedStream = await streamRepository.fetch(stream.user_id)

          // Stream has ended
          if (!stream.id && fetchedStream) {
            // Get time when we think stream ended
            const ended_at = new Date().toISOString().split('.')[0] + 'Z'
            fetchedStream.last_updated = ended_at
            fetchedStream.ended_at = ended_at

            // Move this stream to the permanent MongoDB database
            console.log(
              `Added stream ${fetchedStream.id} to the permenent database`,
            )
            await saveNewStream(fetchedStream)

            // Remove stream from the active stream database
            console.log(`Removed stream ${stream.id}`)
            await streamRepository.remove(userID)

            // Start aggregate step
            await createNewStreamer(userID)
            continue
          }

          // Updating stream values
          stream.last_updated = new Date().toISOString().split('.')[0] + 'Z'
          stream.first_seen = fetchedStream.first_seen

          // Incrementing viewer_count
          let views = fetchedStream.viewer_count
          views.push(stream.viewer_count)
          stream.viewer_count = views
          stream.first_seen = fetchedStream.first_seen

          console.log(`Refreshed stream ${stream.id}`)
          await streamRepository.save(stream.user_id, stream)
        }

        resolve(parsedData.pagination ? parsedData.pagination.cursor : null)
      })
    })

    req.on('error', (error) => {
      reject('Error making request: ' + error)
    })

    req.end()
  })
  return refreshStreamPromise
}

// Refreshes the active streams in the Redis
export async function refreshStreams() {
  console.log('Refreshing streams in the database...')
  // Fetch userIDs from database
  const userIDs = await redis.keys('*', (err, keys) => {
    if (err) return console.log(err)
  })

  for (const userID of userIDs) {
    const id = userID.replace('stream:', '')
    await refreshStream(id)
  }
  console.log('Refreshing done.')
}
