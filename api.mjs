import dotenv from 'dotenv'

// Load crdentials from .env
dotenv.config()

// Get env variables
const HOST_BOT = process.env.HOST_BOT
const HOST_V_SYSTEM = process.env.HOST_V_SYSTEM
const TOKEN_STREAMS = process.env.TOKEN_STREAMS
const TOKEN_COMMENTS = process.env.TOKEN_COMMENTS

export async function getStraems() {

  // Query data
  var headers = new Headers();
  headers.append("token", TOKEN_STREAMS);
  
  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };
  
  const res = await fetch(`http://${HOST_V_SYSTEM}:8000/streams/current-streams/`, requestOptions)
  const resJson = await res.json()  
  
  // Filter active streams
  let currentStreams = resJson.data.filter(stream => {
    return stream["is_active"] == true
  })

  // Format streams
  currentStreams = resJson.data.map (stream => {
    return {
      streamer: stream["streamer"],
      endTime: stream["end_time"],
      accessToken: stream["access_token"],
    }
  })

  return currentStreams
}

export async function getMods() {

  // Query data
  var headers = new Headers();
  headers.append("token", TOKEN_COMMENTS);
  
  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };
  
  const res = await fetch(`http://${HOST_V_SYSTEM}:8000/comments/mods/`, requestOptions)
  const resJson = await res.json()

  // Filter active mods
  let mods = resJson.data.filter(mod => {
    return mod["is_active"] == true
  })

  // Format mods
  mods = mods.map (mod => {
    return mod["user"]
  })

  return resJson.data

}