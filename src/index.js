import { exit } from 'process';

import { checkTableExists } from './db/prepare_tables.js'
import syncMessages from './sync_messages.js'

async function main() {
  if (!await checkTableExists('Message')) {
    console.error('Message table does not exist')
    return
  }

  const chainIds = [421614, 11155111, 167008]
  return Promise.all(chainIds.map(syncMessages))
}

main().then(exit).catch(exit)
