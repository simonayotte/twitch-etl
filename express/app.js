import express from 'express'
import { Stream, saveNewStream } from '../mongo/models/stream.js'
// import { Streamer } from '../mongo/models/streamer.js'
import db from '../mongo/mongoose.js'

const app = express()
app.use(express.json()) // Body parser
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Express server listening on port ${port}`))

const main = async () => {
  app.get('/channels/:id/streams', async (req, res) => {
    try {
      const channelStreams = await Stream.find({ user_id: req.params.id })
      res.send(channelStreams)
    } catch (error) {
      res.status(500).send({ message: 'Server error' })
    }
  })

  app.get('/streams/:id', async (req, res) => {
    try {
      const stream = await Stream.find({ id: req.params.id })
      if (stream) {
        res.send(stream)
      } else {
        res.status(404).send({ message: 'Stream not found' })
      }
    } catch (error) {
      res.status(500).send({ message: 'Server error' })
    }
  })
}

main()
