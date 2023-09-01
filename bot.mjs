import tmi from 'tmi.js'

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

    // Check if is not a mod comment
    if (!mods.includes(context.username)) {
      console.log (`${target} - ${context.username}: (skipped: not mod) ${comment}`)
      return null
    }

    // Clean comment
    comment = comment.replace("'", "").replace('"', '').replace(';', '').replace('`', '').replace('\\', '').replace('/', '').replace('%', '').replace('&', '').replace('<', '').replace('>', '').replace('=', '').replace('+', '').replace('-', '').replace('_', '').replace('*', '').replace('#', '').replace('@', '')

    console.log(`* ${target} - ${context.username}: ${comment}`)

    // TODO: Send comment to bot api

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

  // wait 1 second
  

  setTimeout(() => {
    console.log (`disconnecting ${userName}`)
    // client.disconnect()
  }, waitTime)
  // const minutes = parseInt((end_date - now_date) / 1000 / 60)

  // // Get hours as HH:MM
  // const now_time = `${now_date.getHours()}:${now_date.getMinutes()}`
  // const end_time = `${end_date.getHours()}:${end_date.getMinutes()}`

  // // Log times
  // saveLog(`* ${userName} - starting: ${now_time} - ending: ${end_time} - minutes: ${minutes}`)

  // // Close connection after wait time
  // await sleep(minutes * 60 * 1000)
  // client.disconnect()
  // return "done"
}