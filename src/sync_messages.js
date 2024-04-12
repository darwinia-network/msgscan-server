import sql from './db.js'
import createTables from './create_tables.js'

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
        0
      )
    `
  }
}

async function syncMessages(chainId) {
  while (true) {
    try {
      const lastMessageIndex = await getLastMessageIndex(chainId)
      const messageAccepteds = await getMessageAcceptedsGt(chainId, lastMessageIndex)
      console.log(`found ${messageAccepteds.length} new messages for ${chainId}`)
      await createMessages(messageAccepteds)

      await new Promise((resolve) => setTimeout(resolve, 2000))
    } catch (error) {
      console.error(error)

      console.log('retrying in 5 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

export default syncMessages

