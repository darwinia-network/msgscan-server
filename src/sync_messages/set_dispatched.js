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

// messages = Message.where(from_chain_id: network.chain_id)
//                   .where(status: %i[accepted root_ready])
//
// messages.each do |message|
//   dispatched_log = Log.where(chain_id: message.to_chain_id)
//                       .where(event_name: 'MessageDispatched')
//                       .field_eq('msg_hash', message.msg_hash)
//                       .first
//   next if dispatched_log.nil?
//
//   message.dispatch_transaction_hash = dispatched_log.transaction_hash
//   message.dispatch_block_number = dispatched_log.block_number
//   message.dispatch_block_timestamp = Time.at(dispatched_log.timestamp)
//   message.status = if dispatched_log.decoded['dispatch_result']
//                      Message.statuses[:dispatch_success]
//                    else
//                      Message.statuses[:dispatch_failed]
//                    end
//
//   # update proof
//   transaction = Transaction.find_by_transaction_hash(dispatched_log.transaction_hash)
//   message.proof = transaction.input[(-32 * 64)..].scan(/.{64}/).map { |item| "0x#{item}" }
//
//   message.save!
// end
