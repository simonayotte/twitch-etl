import { redis } from './client.js'
import { streamRepository } from './repository.js'
import { refreshStream } from '../twitch/streams.js'
import { bearerToken, refreshToken, TWITCH_ID } from '../twitch/auth.js'

async function testRedis() {
  // Testing Redis connection
  const pong = await redis.ping()
  console.log(pong)

  // const keys = await redis.keys('*', (err, keys) => {
  //   if (err) return console.log(err)
  // })

  // for (const key of keys) {
  //   console.log(keys[i].replace('stream:', ''))
  // }

  await refreshStream(175863760)

  // // Testing saving something to the repository
  // const stream = {
  //   id: '40655611847',
  //   user_id: '132004305',
  //   user_login: 'darumaisgod',
  //   user_name: 'だるまいずごっど',
  //   game_id: '55453844',
  //   game_name: 'Street Fighter 6',
  //   type: 'live',
  //   title: 'CRカップスト6ミラーday2',
  //   viewer_count: [99999],
  //   started_at: '2023-09-24T09:04:58Z',
  //   language: 'ja',
  //   thumbnail_url:
  //     'https://static-cdn.jtvnw.net/previews-ttv/live_user_darumaisgod-{width}x{height}.jpg',
  //   tag_ids: [],
  //   tags: ['日本語'],
  //   is_mature: false,
  // }
}

async function main() {
  await redis.connect()

  await testRedis()

  // const stream = await streamRepository.fetch('40655611847')

  // console.log('Stream fetched', stream)

  // const fetchedStream = await streamRepository.fetch(stream.id)

  // if (!fetchedStream.id) {
  //   // Convert to array for storing more information
  //   stream.viewer_count = [stream.viewer_count]
  //   stream.first_seen = Date.now()
  // } else {
  //   let views = fetchedStream.viewer_count
  //   views.push(stream.viewer_count)
  //   stream.viewer_count = views
  // }

  // stream.last_updated = Date.now()

  // // Update stream
  // await streamRepository.save(stream.id, stream)

  await redis.quit()
}

main()
