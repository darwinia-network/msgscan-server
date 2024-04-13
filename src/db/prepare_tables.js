import sql from './db.js'

async function checkTableExists(tableName) {
  const exists = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE  table_schema = 'public'
      AND    table_name   = ${tableName}
    );
  `
  return exists[0].exists
}

async function messages() {
  // check if table exists
  if (await checkTableExists('messages')) {
    console.log('table "messages" already exists')
    return
  }

  // if not, create table
  await sql`
    CREATE TABLE public."messages"
    (
        id text PRIMARY KEY,
        "msgHash" text,
        root text,
        "messageChannel" text,
        "messageIndex" integer,
        "messageFromChainId" bigint,
        "messageFrom" text,
        "messageToChainId" bigint,
        "messageTo" text,
        "messageGasLimit" text,
        "messageEncoded" text,
        "acceptedBlockNumber" bigint,
        "acceptedBlockTimestamp" bigint,
        "acceptedTransactionHash" text,
        "acceptedTransactionIndex" integer,
        "acceptedLogIndex" integer,
        "status" integer,
        "dispatchBlockNumber" bigint,
        "dispatchBlockTimestamp" bigint,
        "dispatchTransactionHash" text,
        "dispatchTransactionIndex" text,
        "dispatchLogIndex" integer,
        "msgportPayload" text,
        "msgportFrom" text,
        "msgportFo" text,
        "signatures" text,
        "latestSignaturesUpdatedAt" bigint
    )
  `
  console.log('table "messages" created')
}

const createTables = async () => {
  await messages()
}

export { createTables, checkTableExists }
