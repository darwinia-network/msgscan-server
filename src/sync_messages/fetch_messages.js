import { getLastMessageIndex, createMessage } from '../db/message.js'
import { getMessageAcceptedsByIndexGt } from '../db/message_accepted_v2.js'
import { MESSAGE_STATUS } from '../constants.js'

async function fetchMessages(chainId) {
  const lastMessageIndex = await getLastMessageIndex(chainId)
  const messageAccepteds = await getMessageAcceptedsByIndexGt(chainId, lastMessageIndex)
  console.log(`found ${messageAccepteds.length} new messages for ${chainId}`)

  // create messages
  for (const message of messageAccepteds) {
    await createMessage(message)
  }
}

export default fetchMessages
