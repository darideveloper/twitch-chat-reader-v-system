import dotenv from 'dotenv'
import bot from './bot.js'

// Load crdentials from .env
dotenv.config()

// Get env variables
const HOST_BOT = process.env.HOST_BOT
const HOST_V_SYSTEM = process.env.HOST_V_SYSTEM
const TOKEN_STREAMS = process.env.TOKEN_STREAMS
const TOKEN_COMMENTS = process.env.TOKEN_COMMENTS

function getStraems() {

  var headers = new Headers();
  headers.append("token", TOKEN_STREAMS);
  
  var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow'
  };
  
  fetch(`http://${HOST_V_SYSTEM}:8000/streams/current-streams/`, requestOptions)
    .then(response => response.json())
    .then(result => {

      // Start chat reader
      const streams = result.data
      for (const stream of streams) {
        bot.read_chat(stream).then((res) => {console.log (`stream ${stream.user_name} ended`)})
      }

    })
    .catch(error => console.log('error', error));
}

getStraems()