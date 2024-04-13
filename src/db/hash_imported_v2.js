import sql from './db.js'

async function getLatestRootImported(chainId) {
  const result = await sql`
    SELECT *
    FROM public."HashImportedV2"
    WHERE "chainId" = ${chainId}
    ORDER BY "blockTimestamp" DESC
    LIMIT 1
  `
  if (result.length === 0) {
    return null
  }

  return result[0]
}

export { getLatestRootImported }
