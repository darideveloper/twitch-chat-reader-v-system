import tmi from 'tmi.js'
import { sendComment } from './api.mjs'

// Called every time a message comes in
async function onMessageHandler(target, context, comment, mods) {

  const message_type = context["message-type"]

  // Get and validate message type
  if (!(message_type == "chat" || message_type == "whisper")) {

    // Save register of skipped message
    console.log (`${target} - ${context.username}: (skipped: message type) ${comment}`)
    return null
  }

  try {

    // Get mod of comment
    let currentMods = mods.filter(mod => {
      return mod["user"] == context.username
    })
    if (currentMods.length == 0) {
      console.log (`${target} - ${context.username}: (skipped: not mod) ${comment}`)
      return null
    }

    let currentMod = currentMods[0]

    // Clean comment
    comment = comment.replace("'", "").replace('"', '').replace(';', '').replace('`', '').replace('\\', '').replace('/', '').replace('%', '').replace('&', '').replace('<', '').replace('>', '').replace('=', '').replace('+', '').replace('-', '').replace('_', '').replace('*', '').replace('#', '').replace('@', '')

    console.log(`* ${target} - ${context.username}: ${comment}`)

    // Send comment to bot api
    sendComment (target.replace("#", ""), currentMod.id, comment)

  } catch (error) {

    console.error(`* ${target} - ${context.username}: ${comment} (${error})`)
  }
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(userName) {
  console.log(`* Connected with user ${userName}`)
}

export async function readChat(stream, mods) {

  // Connect to the stream
  const userName = stream.streamer
  const accessToken = stream.accessToken
  let endTime = stream.endTime

  // Define configuration options
  const opts = {
    identity: {
      username: userName,
      password: `oauth:${accessToken}`
    },
    channels: [
      userName
    ]
  }

  // Create a client with our options
  const client = new tmi.client(opts)

  // Register our event handlers (defined below)
  client.on('message', (target, context, msg) => onMessageHandler(target, context, msg, mods))
  client.on('connected', () => onConnectedHandler(userName))

  try {
    // Connect to Twitch:
    await client.connect()
  } catch (err) {

    // Show connection error
    console.error(`Error connecting with user ${userName}: ${err}`)
    return "Error connecting with user"
  }

  // Calculate minutes to end time
  const now = new Date()
  endTime = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${endTime}`
  const waitTime = parseInt((new Date(endTime) - now))

  // wait until end time
  setTimeout(() => {
    console.log (`disconnecting ${userName}`)
    client.disconnect()
  }, waitTime)
}