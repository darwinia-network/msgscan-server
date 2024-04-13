import { exit } from 'process';

// import createTables from './db/create_tables.js'
import syncMessages from './sync_messages.js'

async function main() {
  // await createTables()

  const chainIds = [421614, 11155111, 167008]
  return Promise.all(chainIds.map(syncMessages))
}

main().then(exit)
