import sql from './db.js'

async function findTransactionByHash(chainId, transactionHash) {
  const result = await sql`
    SELECT *
    FROM ponder_sync."Transaction"
    WHERE "chainId" = ${chainId} and "hash" = ${transactionHash}
  `
  return result.length == 0 ? null : result[0]
}

export { findTransactionByHash }
