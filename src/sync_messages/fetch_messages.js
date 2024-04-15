import { getLastMessageIndex, createMessage } from '../db/message.js'
import { getMessageAcceptedsByIndexGt } from '../db/message_accepted_v2.js'
import { MESSAGE_STATUS } from '../constants.js'

async function doFetchMessages(chainId) {
  const lastMessageIndex = await getLastMessageIndex(chainId)
  const messageAccepteds = await getMessageAcceptedsByIndexGt(chainId, lastMessageIndex)

  // create messages
  for (const message of messageAccepteds) {
    console.log(`create message ${message.messageFromChainId}-${message.messageIndex}`)
    await createMessage(message)
  }
}

function fetchMessages(chainId) {
  return async function() {
    await doFetchMessages(chainId)
  }
}

export default fetchMessages
