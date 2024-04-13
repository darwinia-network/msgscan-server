import { findMessagesByStatus, updateMessage } from '../db/message.js'
import { findMessageDispatchedByMsgHash } from '../db/message_dispatched_v2.js'
import { findTransactionByHash } from '../db/transaction.js'
import { MESSAGE_STATUS } from '../constants.js'

async function setDispatched(messageFromChainId) {
  const messages = await findMessagesByStatus(messageFromChainId, MESSAGE_STATUS.ROOT_READY)
  console.log(`setDispatched: found ${messages.length} root ready messages for chain ${messageFromChainId}`)

  for (const message of messages) {
    const dispatched = await findMessageDispatchedByMsgHash(message.messageToChainId, message.msgHash)
    if (!dispatched) {
      continue
    }

    const transaction = await findTransactionByHash(message.messageToChainId, dispatched.transactionHash)

    await updateMessage(message, {
      dispatchBlockNumber: dispatched.blockNumber,
      dispatchBlockTimestamp: dispatched.timestamp,
      dispatchTransactionHash: dispatched.transactionHash,
      dispatchTransactionIndex: dispatched.transactionIndex,
      dispatchLogIndex: dispatched.logIndex,
      proof: transaction.input.slice(-32 * 64).match(/.{64}/g).map(item => `0x${item}`),
      status: dispatched.dispatchResult ? MESSAGE_STATUS.DISPATCH_SUCCESS : MESSAGE_STATUS.DISPATCH_FAILED,
    })
  }
}

export default setDispatched
