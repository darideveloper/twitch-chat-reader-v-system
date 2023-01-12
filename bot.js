const tmi = require('tmi.js')
const axios = require('axios')

// Get enviroment variables
const DURATION = process.env.DURATION
const DJANGO_ADD_COMMENT = process.env.DJANGO_ADD_COMMENT
const DJANGO_REFRESH_TOKEN = process.env.DJANGO_REFRESH_TOKEN

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Called every time a message comes in
async function onMessageHandler(target, context, comment, stream_id) {

  // Get and validate message type
  if (context["message-type"] == "chat" || context["message-type"] == "whisper") {

    // Get user id
    const user_id = context["user-id"]

    // Send message to Django API
    try {
      req = await axios.post(DJANGO_ADD_COMMENT, { user_id, stream_id, comment })
    } catch {
      console.log(`target: ${target} - user: ${user_id} - message: ${comment} (received but no saved)`)
      return ""
    }
    
    console.log(`target: ${target} - user: ${user_id} - message: ${comment}`)
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(user_name) {
  console.log(`* Connected with user ${user_name}`)
}

module.exports = {
  read_chat: async function (stream) {

    // Connect to the stream
    const user_name = stream.user_name
    const access_token = stream.access_token
    const stream_id = stream.stream_id

    // Define configuration options
    const opts = {
      identity: {
        username: user_name,
        password: `oauth:${access_token}`
      },
      channels: [
        user_name
      ]
    }

    // Create a client with our options
    const client = new tmi.client(opts)

    // Register our event handlers (defined below)
    client.on('message', async (target, context, msg) => onMessageHandler(target, context, msg, stream_id))
    client.on('connected', () => onConnectedHandler(user_name))

    try {
      // Connect to Twitch:
      await client.connect()
    } catch (err) {

      // Show connection error
      console.log(`* Error connecting with user ${user_name}. Error: ${err}`)

      // Catch refresh token error
      if (err == "Login authentication failed") {
        // Send flag to django for refresh token
        console.log(`* Requesting refresh token for user ${user_name}...`)
        try {
          req = await axios.post(DJANGO_REFRESH_TOKEN, { "stream_id": stream_id })
        } catch {
          console.log(`* Error updating token for user ${user_name}.`)
          return "refresh token error"
        }
        await sleep(3000)
      } else {
        // End function for uncatch error
        console.log (`* Unknown error for user ${user_name}.`)
        return "unknown error"
      }

    } 

    // Close connection after wait time
    await sleep(DURATION * 60 * 1000)
    client.disconnect()
    return "done"
  }
}