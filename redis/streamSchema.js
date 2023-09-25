import { Schema } from 'redis-om'

// Here we are slighty tweaking the data coming from Twitch's API. We are adding the field first_seen and last_updated. The viewerCount has also been changed to an array to compute the averages.
export const streamSchema = new Schema('stream', {
  id: { type: 'string' },
  user_id: { type: 'string' },
  user_login: { type: 'string' },
  user_name: { type: 'string' },
  game_id: { type: 'string' },
  game_name: { type: 'string' },
  type: { type: 'string' },
  title: { type: 'string' },
  viewer_count: { type: 'number[]' },
  started_at: { type: 'string' },
  language: { type: 'string' },
  thumbnail_url: { type: 'string' },
  tag_ids: { type: 'string[]' },
  tags: { type: 'string[]' },
  is_mature: { type: 'boolean' },
  first_seen: { type: 'string' },
  last_updated: { type: 'string' },
})
