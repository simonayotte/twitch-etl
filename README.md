# Twitch-ETL

Node.js ETL scraper tool using the Twitch API that continually fetches information about active streams to store in a Redis database. Streams are stored in a 'permanent' database using MongoDB once they end. The application also has an Express server handling HTTP endpoints to fetch various information about streamers.

## How to run

For the ETL Process to be runned continually: `node main.js`
For the Express server: `node express/app.js`

**Prerequisites**

- Twitch credentials stored in `.env` file
- [Redis-Stack](https://redis.io/docs/getting-started/install-stack/)
- [Docker](https://docs.docker.com/engine/install/)
- [Node.js](https://nodejs.org/en/download)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

- Your Redis instance is assumed to be running locally on the default port (6379)
- Your MongoDB instance is assumed to be running locally on the default port (27017)

## Additional Notes

### Why did you choose X as a storage option for the data?

#### Intermediate Storage to track active streams with Redis

Chose Redis as an intermediate storage solution to store and track "active" streams on Twitch. These are the streams that are currently live that we want to continually refresh. The reason for choosing Redis was to optimize for fast write as well as provide fast read times to fetch a specific stream (Here we are using the streamer's id as the key in the redis database). We are continually updating the streams and making loads of DB accesses in a short amount of time. This is why speed and performance was the top priority for that storage. I did not really consider a relational database here as we don't have complex links between our entity that are better managed with a relational model. Here we are simply fetching and store a bulk of stream data and we don't really care about having the best structure as we are not implementing complex queries to filter and fetch streams from that database. I considered using just a `.json` or `.csv` file that we continually update using node.js streams but this wasn't the best solution for future scalibility of the system (However, you could maybe scale it out efficiently using multiples files and a fast storage solution like AWS S3....)

There's is a second storage solution to keep track of all the historical streams that the ETL tool has 'seen'. Once a stream has ended, it is removed from the Redis database and it's stored in the permanent database which is implement using MongoDB. This database solution provides good flexbility for scalibility of data as it is easy to implement horizontal scaling as opposed to a relational database like PostgreSQL and we are expected to store a huge amount of streams data in that database. I also thought about implementing it with a relational database like PostgreSQL but ultimately choose MongoDB for bettter horizontal scaling. There's definitely an argument to be made to choose something like PostgreSQL as at this stage we are expected to have relatively consistent entities and those are better represented with a relational model.

### How you would accomplish this if you had to track every stream on Twitch? What challenges would that introduce on a storage level?

#### Use WebHooks to find new streams

I would use a different solution to find new streams on Twitch. From briefly looking at the documentation, it looks like we're capable of using Web Hooks that are being triggered whenever a new stream starts on Twitch. This is surely more efficient to use than making a request that fetches all the streams on an interval. We would have one process running that uses WebHooks to continually update our Redis with new streams information.

#### Group requests to refresh a stream

Right, now we are making a request to refresh an active stream information once per stream in the active streams database. This is super inefficient as it exposes us to being limited by Twitch API for making too many request. From looking at the API reference, we can pass in a maximum of 100 different user_ids per request so we should use this limit and make refresh request for streams in chunks of 100 streams.

#### Dynamically change the interval of request sent to Twitch

Instead of running the ETL tool on an arbitrary interval (like 15minutes), we should dynamically calculate the interval based on the max request limit that Twitch is giving to our application. For example, we could define a class to track all the requests made in the application in a specific time interval that dynamically introduces pauses in the requests being sent to Twitch if we are making too much in a short amount of time. This solution would help us optimize to get the most updated data while making sure we are not being blocked from making Twitch requests.

#### Use message system broker like Kafka to update permanent database and make the aggregation step when a stream ends

It's better to take care of the 'stream end' event with Kafka as it is highly scalable, supports real-time processing and it's easier to use it to store a new row in the database.

#### Storage challenges and solution

- Regularly index tables based on commonly used data or keys
- Partition database in smaller and more manageables parts to optimize queries
- Sharing to distribute data across multiple databases (We could separate the databases according to a certain logic. Maybe types of games ? Maybe streamer's language ? etc. )
- Use adequate hardware (like a performant cloud machine) in order to consistenly achieve the required latency
- Data archiving to remove old data that is currently not very useful (e.g : move streamer's streams that are no longer active, move stream data that is older than 3years, etc. )

### What additional HTTP endpoints could you add?

There is a lot of really interesting data that is being returned from the streams object that Twitch is giving us that we could use.

- We could add a endpoint that fetches the total streamed time of a streamer during the last 30 days. We could use this data to compare who's the most 'active' streamer on Twitch.

- We could add a endpoint that fetches the most popular tags in decreasing order during the last 30 days. This could give us a sense of what's popular on Twitch at the moment and could be valuable data to know what's going on in the gaming world :)

### How would you introduce the concept of caching to make the system more efficient?

- We could cache the responses of requests that are being frequently made in the express application endpoints.
- Also, we are already somewhat implement caching by default with Redis, instead of having one MongoDB database that keeps all the streams we have this database layer that is used as caching solution to refresh the stream as reading from Redis is faster than reading from MongoDB.
- We could cache the data being sent to the request for refreshing a stream instead of building the requests with the userId parameters each time we make a new request.

### How would you modify this system to make use of multiple threads?

We can essentially separates our application in three or four different kind of worker processes that are each responsible for a specific part of the program.

1. New Stream Fetcher Worker
2. Stream Refresh Worker
3. Save Ended Stream to MongoDB Worker
4. Data Aggregator Worker

These processes could be managed a master process which makes sure we are respecting the Twitch request limit.

## References

1. [Twitch API Reference](https://dev.twitch.tv/docs/api/reference/)
