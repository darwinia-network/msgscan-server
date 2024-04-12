import sql from '../db.js'
import { MESSAGE_STATUS } from '../constants.js'

async function getLastMessageIndex(chainId) {
  const result = await sql`
    SELECT max("messageIndex") as max_index FROM public."messages" WHERE "messageFromChainId" = ${chainId}
  `
  return result[0].max_index || 0
}

async function getMessageAcceptedsGt(chainId, messageIndex) {
  const result = await sql`
    SELECT *
    FROM public."MessageAcceptedV2"
    WHERE "messageFromChainId" = ${chainId} and "messageIndex" > ${messageIndex}
  `
  return result
}

async function createMessages(messageAccepteds) {
  for (const messageAccepted of messageAccepteds) {
    const id = `${messageAccepted.messageFromChainId}-${messageAccepted.messageIndex}`
    console.log(`processing message ${id}`)

    // check if message already exists
    const exists = await sql`
      SELECT EXISTS (
        SELECT * FROM public."messages" WHERE id=${id}
      );
    `

    if (exists[0].exists) {
      console.log(`message ${id} already exists`)
      continue
    }

    // if not, create message
    await sql`
      INSERT INTO public."messages" (
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
        "status"
      )
      VALUES (
        ${id},
        ${messageAccepted.msgHash},
        ${messageAccepted.root},
        ${messageAccepted.messageChannel},
        ${messageAccepted.messageIndex},
        ${messageAccepted.messageFromChainId},
        ${messageAccepted.messageFrom},
        ${messageAccepted.messageToChainId},
        ${messageAccepted.messageTo},
        ${messageAccepted.messageGasLimit},
        ${messageAccepted.messageEncoded},
        ${messageAccepted.blockNumber},
        ${messageAccepted.blockTimestamp},
        ${messageAccepted.transactionHash},
        ${messageAccepted.transactionIndex},
        ${messageAccepted.logIndex},
        MESSAGE_STATUS.ACCEPTED
      )
    `
  }
}

async function fetchMessages(chainId) {
  const lastMessageIndex = await getLastMessageIndex(chainId)
  const messageAccepteds = await getMessageAcceptedsGt(chainId, lastMessageIndex)
  console.log(`found ${messageAccepteds.length} new messages for ${chainId}`)
  await createMessages(messageAccepteds)
}

export default fetchMessages
