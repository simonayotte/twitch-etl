// Authentication logic for the TWITCH API
import dotenv from 'dotenv'
import querystring from 'querystring'
import https from 'https'
dotenv.config()

// Twitch Credentials
export const TWITCH_ID = process.env.TWITCH_ID
const TWITCH_SECRET = process.env.TWITCH_SECRET

//OAuth & Token
export let bearerToken
export let bearerTokenExpiration

export async function getAuthToken() {
  const postData = querystring.stringify({
    client_id: TWITCH_ID,
    client_secret: TWITCH_SECRET,
    grant_type: 'client_credentials',
  })

  const options = {
    hostname: 'id.twitch.tv',
    path: '/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length,
    },
  }
  console.log('Authenticating with the Twitch API...')
  const authPromise = new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (d) => (data += d))
      res.on('end', () => {
        const parsed = JSON.parse(data)
        bearerToken = parsed.access_token

        // Using 5s as buffer before real expiration
        bearerTokenExpiration = Date.now() + parsed.expires_in * 1000 - 5000

        resolve(bearerToken)
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })

  return authPromise
}

export async function refreshToken() {
  if (Date.now() > bearerTokenExpiration) await getAuthToken()
}
