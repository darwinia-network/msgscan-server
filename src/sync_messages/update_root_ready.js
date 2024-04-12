import sql from '../db.js'
import { MESSAGE_STATUS } from '../constants.js'

async function findMessagesWithStatus(chainId, status) {
  const result = await sql`
    SELECT *
    FROM public."messages"
    WHERE "messageFromChainId" = ${chainId} and "status" = ${status}
  `
  return result
}

async function findMessageByRoot(chainId, root) {
  const result = await sql`
    SELECT *
    FROM public."messages"
    WHERE "messageFromChainId" = ${chainId} and "root" = ${root}
  `
  return result[0]
}

async function updateMessage(message, status) {
  await sql`
    UPDATE public."messages"
    SET status = ${status}
    WHERE id = ${message.id}
  `
}

async function isRootAggregated(message) {
  const result = await sql`
    SELECT *
    FROM public."HashImportedV2"
    WHERE "chainId" = ${message.messageToChainId}
    ORDER BY "blockTimestamp" DESC
    LIMIT 1
  `
  if (result.length === 0) {
    return false
  }

  const messageOfRoot = await findMessageByRoot(message.messageToChainId, result[0].hash)
  return messageOfRoot && message.acceptedBlockNumber <= messageOfRoot.acceptedBlockNumber
}

async function updateRootReady(chainId) {
  const messages = await findMessagesWithStatus(chainId, MESSAGE_STATUS.ACCEPTED)
  console.log(`updateRootReady: found ${messages.length} accepted messages for chain ${chainId}`)

  for (const message of messages) {
    if (await isRootAggregated(message)) {
      console.log(`updateRootReady: message ${message.id} root aggregated`)
      await updateMessage(message, MESSAGE_STATUS.ROOT_READY)
    }
  }
}

export default updateRootReady
