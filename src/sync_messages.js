import fetchMessages from './sync_messages/fetch_messages.js'
import updateRootReady from './sync_messages/update_root_ready.js'

async function loop(chainId, fn) {
  while (true) {
    try {
      await fn(chainId)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(error)
      console.log(`retrying ${fn.name} in 5 seconds...`)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

async function syncMessages(chainId) {
  await Promise.all([
    loop(chainId, fetchMessages),
    loop(chainId, updateRootReady)
  ])
}

export default syncMessages

