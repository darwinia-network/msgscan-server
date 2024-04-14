import { findMessageByRoot, findMessagesByStatus, updateMessageStatus } from '../db/message.js'
import { getLatestRootImported } from '../db/hash_imported_v2.js'
import { MESSAGE_STATUS } from '../constants.js'

async function isRootAggregated(message) {
  const root = await getLatestRootImported(message.messageToChainId)
  if (!root) {
    return false
  }

  const messageOfRoot = await findMessageByRoot(root.hash)
  return messageOfRoot && message.acceptedBlockNumber <= messageOfRoot.acceptedBlockNumber
}

async function setRootReady(chainId) {
  const messages = await findMessagesByStatus(chainId, MESSAGE_STATUS.ACCEPTED)
  console.log(`updateRootReady: found ${messages.length} accepted messages for chain ${chainId}`)

  for (const message of messages) {
    if (await isRootAggregated(message)) {
      console.log(`updateRootReady: message ${message.id} root aggregated`)
      await updateMessageStatus(message, MESSAGE_STATUS.ROOT_READY)
    }
  }
}

export default setRootReady
