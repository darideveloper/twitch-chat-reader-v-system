import { getStraems, getMods } from './api.mjs'
import { readChat } from './bot.mjs'

async function main() {
  
  // Get current live streams
  const currentStreams = await getStraems()
  const mods = await getMods ()
  
  if (currentStreams.length == 0) {
    console.log("No streams found")
    return ""
  }

  // Loop each stream
  currentStreams.forEach(async (stream) => {
   
    // Start chat reader
    await readChat(stream, mods)
  
  })
}

main ()