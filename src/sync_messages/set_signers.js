import { findMessagesWithMissingSigners, updateMessage } from '../db/message.js'
import { findSigners } from '../db/signature_submittion.js'

async function setSigners() {
  const messages = await findMessagesWithMissingSigners()

  for (const message of messages) {
    const signers = await findSigners(message.messageFromChainId, message.messageIndex)
    if (signers.length === 0) {
      continue
    }

    updateMessage(message, { signers, latestSignaturesUpdatedAt: Math.floor(new Date().getTime() / 1000) })
    console.log(`updated signers of message ${message.id}`)
  }
}

export default setSigners
