import mongoose from 'mongoose'

const StreamSchema = new mongoose.Schema({
  id: String,
  user_id: String,
  user_login: String,
  user_name: String,
  game_id: String,
  game_name: String,
  type: String,
  title: String,
  viewer_count: [Number],
  started_at: Date,
  language: String,
  thumbnail_url: String,
  tag_ids: [String],
  tags: [String],
  is_mature: Boolean,
  last_updated: Date,
  first_seen: Date,
  ended_at: Date,
}) // This will automatically add `createdAt` and `updatedAt` fields

export const Stream = mongoose.model('Stream', StreamSchema, 'streams')

export async function saveNewStream(streamData) {
  const newStream = new Stream(streamData)
  try {
    const savedStream = await newStream.save()
    console.log('New Stream Created:', streamData.id)
    return savedStream
  } catch (err) {
    console.error('Error saving Stream:', err)
    throw err
  }
}
