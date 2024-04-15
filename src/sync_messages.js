import fetchMessages from './sync_messages/fetch_messages.js'
import setRootReady from './sync_messages/set_root_ready.js'
import setDispatched from './sync_messages/set_dispatched.js'
import setSigners from './sync_messages/set_signers.js'

async function loop(fn) {
  while (true) {
    try {
      await fn()
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
    loop(fetchMessages(chainId)),
    loop(setRootReady(chainId)),
    loop(setDispatched(chainId)),
    loop(setSigners),
  ])
}

export default syncMessages

