import sql from './db.js'
import { MESSAGE_STATUS } from '../constants.js'

const MESSAGE_TABLE = 'Message'

async function getLastMessageIndex(chainId) {
  const result = await sql`
    SELECT max("messageIndex") as max_index FROM public.${sql(MESSAGE_TABLE)} WHERE "messageFromChainId" = ${chainId}
  `
  return result[0].max_index || 0
}

async function extractMsgportPayload(message) {
  if (!message.messageEncoded.startsWith('0x394d1bca')) {
    return { msgportFrom: null, msgportTo: null, msgportPayload: null }
  }
  const msgportFrom = '0x' + message.messageEncoded.slice(34, 74)
  const msgportTo = '0x' + message.messageEncoded.slice(98, 138)
  const msgportPayload = '0x' + message.messageEncoded.slice(266)
  return { msgportFrom, msgportTo, msgportPayload }
}

async function createMessage(message) {
  const id = `${message.messageFromChainId}-${message.messageIndex}`

  // check if message already exists
  const exists = await sql`
    SELECT EXISTS (
      SELECT * FROM public.${sql(MESSAGE_TABLE)} WHERE id=${id}
    );
  `
  if (exists[0].exists) {
    console.log(`message ${id} already exists`)
    return
  }

  // if not, create message
  const { msgportFrom, msgportTo, msgportPayload } = await extractMsgportPayload(message)
  await sql`
    INSERT INTO public.${sql(MESSAGE_TABLE)} (
      id,
      "msgHash",
      root,
      "messageChannel",
      "messageIndex",
      "messageFromChainId",
      "messageFrom",
      "messageToChainId",
      "messageTo",
      "messageGasLimit",
      "messageEncoded",
      "acceptedBlockNumber",
      "acceptedBlockTimestamp",
      "acceptedTransactionHash",
      "acceptedTransactionIndex",
      "acceptedLogIndex",
      "status",
      "msgportFrom",
      "msgportTo",
      "msgportPayload"
    )
    VALUES (
      ${id},
      ${message.msgHash},
      ${message.root},
      ${message.messageChannel},
      ${message.messageIndex},
      ${message.messageFromChainId},
      ${message.messageFrom},
      ${message.messageToChainId},
      ${message.messageTo},
      ${message.messageGasLimit},
      ${message.messageEncoded},
      ${message.blockNumber},
      ${message.blockTimestamp},
      ${message.transactionHash},
      ${message.transactionIndex},
      ${message.logIndex},
      ${MESSAGE_STATUS.ACCEPTED},
      ${msgportFrom},
      ${msgportTo},
      ${msgportPayload}
    )
  `
}

async function findMessagesByStatuses(messageFromChainId, statuses) {
  const result = await sql`
    SELECT *
    FROM public.${sql(MESSAGE_TABLE)}
    WHERE "messageFromChainId" = ${messageFromChainId} and "status" IN ${sql(statuses)}
  `
  return result
}

async function findMessagesByStatus(messageFromChainId, status) {
  const result = await sql`
    SELECT *
    FROM public.${sql(MESSAGE_TABLE)}
    WHERE "messageFromChainId" = ${messageFromChainId} and "status" = ${status}
  `
  return result
}

async function findMessageByRoot(root) {
  const result = await sql`
    SELECT *
    FROM public.${sql(MESSAGE_TABLE)}
    WHERE "root" = ${root}
  `
  return result[0]
}

async function updateMessageStatus(message, status) {
  await sql`
    UPDATE public.${sql(MESSAGE_TABLE)}
    SET status = ${status}
    WHERE id = ${message.id}
  `
}

async function updateMessage(message, fields) {
  await sql`
    UPDATE public.${sql(MESSAGE_TABLE)}
    SET ${sql(fields)}
    WHERE id = ${message.id}
  `
}

async function findMessagesWithMissingSigners() {
  const result = await sql`
    SELECT *
    FROM public.${sql(MESSAGE_TABLE)}
    WHERE status >= 1 and "acceptedBlockTimestamp" > EXTRACT(EPOCH FROM NOW() - interval '6666 hours') and (signers is null or json_array_length(signers::json) < 5)
  `
  return result
}

export { 
  getLastMessageIndex, findMessagesByStatus, findMessagesByStatuses, findMessageByRoot, findMessagesWithMissingSigners,
  updateMessageStatus, updateMessage, createMessage
}
