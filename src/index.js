import { exit } from 'process';

import createTables from './create_tables.js'
import syncMessages from './sync_messages.js'

async function main() {
  await createTables()

  const chainIds = [421614, 11155111, 421614]
  return Promise.all(chainIds.map(syncMessages))
}

main().then(exit)

