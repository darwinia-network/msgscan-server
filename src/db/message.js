import sql from './db.js'
import { MESSAGE_STATUS } from '../constants.js'

async function findMessagesByStatus(messageFromChainId, status) {
  const result = await sql`
    SELECT *
    FROM public."messages"
    WHERE "messageFromChainId" = ${messageFromChainId} and "status" = ${status}
  `
  return result
}

async function findMessageByRoot(messageFromChainId, root) {
  const result = await sql`
    SELECT *
    FROM public."messages"
    WHERE "messageFromChainId" = ${messageFromChainId} and "root" = ${root}
  `
  return result[0]
}

async function updateMessageStatus(message, status) {
  await sql`
    UPDATE public."messages"
    SET status = ${status}
    WHERE id = ${message.id}
  `
}

async function updateMessage(message, fields) {
  const sets = Object.entries(fields).map(([key, value]) => {
    return `"${key}" = ${value}`
  }).join(', ')

  await sql`
    UPDATE public."messages"
    SET ${sql.raw(sets)}
    WHERE id = ${message.id}
  `
}


export { findMessagesByStatus, findMessageByRoot, updateMessageStatus, updateMessage }
