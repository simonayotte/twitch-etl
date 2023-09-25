import mongoose from 'mongoose'
import { Stream } from './stream'

const StreamerSchema = new mongoose.Schema({
  user_id: String,
  avg_viewers: Number,
  peak_viewers: Number,
  stream_count: Number,
  games_played_count: Number,
})

export const Streamer = mongoose.model('Streamer', StreamerSchema, 'streamers')

function getLast30DaysDate() {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date
}

// Fetches the last 30days of statistics for that particular streamer and creates a new streamer aggregate view
export async function createNewStreamer(user_id) {
  // Define date 30 days ago
  const date30DaysAgo = getLast30DaysDate()

  const aggregation = await Stream.aggregate([
    {
      // Fetch records of the last 30 days for the given user id
      $match: {
        user_id: user_id,
        started_at: { $gte: date30DaysAgo },
      },
    },
    {
      // Group the results
      $group: {
        _id: '$user_id',
        avg_viewers: { $avg: { $avg: '$viewer_count' } },
        peak_viewers: { $max: { $max: '$viewer_count' } },
        stream_count: { $sum: 1 },
        games_played: { $addToSet: '$game_id' },
      },
    },
    {
      // Create a new field for games_played_count
      $addFields: {
        games_played_count: { $size: '$games_played' },
      },
    },
    {
      $project: {
        games_played: 0,
      },
    },
  ])
  if (!aggregation[0]) {
    throw new Error(`No data found for user_id ${user_id}`)
  }

  // Create a new document in Streamer collection with the aggregated data
  const streamer = new Streamer({
    user_id: user_id,
    avg_viewers: aggregation[0].avg_viewers,
    peak_viewers: aggregation[0].peak_viewers,
    stream_count: aggregation[0].stream_count,
    games_played_count: aggregation[0].games_played_count,
  })

  try {
    await streamer.save()
    console.log('New Streamer Created:', streamer.user_id)
  } catch (err) {
    console.error('Error saving Streamer:', err)
    throw err
  }
}
