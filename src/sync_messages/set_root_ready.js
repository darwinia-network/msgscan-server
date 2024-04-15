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

async function doSetRootReady(chainId) {
  const messages = await findMessagesByStatus(chainId, MESSAGE_STATUS.ACCEPTED)

  for (const message of messages) {
    if (await isRootAggregated(message)) {
      await updateMessageStatus(message, MESSAGE_STATUS.ROOT_READY)
      console.log(`message ${message.id} set root ready`)
    }
  }
}

function setRootReady(chainId) {
  return async function() {
    await doSetRootReady(chainId)
  }
}

export default setRootReady
