import * as rpc from './rpc'
import { emitter } from '../core'
import { sleep } from '../util'

let flipper

async function sendRpcRequest (requestType, args, hasNext) {
  let buffer = new Uint8Array(0)

  const unbind = emitter.on('raw output', data => {
    const newBuffer = new Uint8Array(buffer.length + data.length)
    newBuffer.set(buffer)
    newBuffer.set(data, buffer.length)
    buffer = newBuffer
  })

  const req = rpc.createRequest(requestType, args, hasNext)
  await flipper.write('raw', req)

  let oldLength = 0, newLength = 1
  while (oldLength < newLength) {
    await sleep(350)
    oldLength = newLength
    newLength = buffer.length
  }

  let res

  if (buffer.length) {
    res = rpc.parseResponse(buffer)
    res = res.reverse().find(e => e.requestType === requestType)
    buffer = new Uint8Array(0)
  } else {
    console.log('No response for', requestType)
  }

  unbind()
  return res
}

async function startRpcSession (f) {
  flipper = f
  await flipper.write('cli', 'start_rpc_session\r')
  flipper.read('raw')
}

async function stopRpcSession () {
  await flipper.closeReader()
  await sendRpcRequest('stopSession', {})
  rpc.flushCommandQueue()
}

async function storageList (path) {
  const res = await sendRpcRequest('storageListRequest', { path: path })
  if (res.error) {
    return res.error
  }
  if (res.chunks.length) {
    let buffer = []
    res.chunks.forEach(c => {
      buffer = buffer.concat(c.file)
    })
    return buffer
  }
}

async function storageRead (path) {
  const res = await sendRpcRequest('storageReadRequest', { path: path })
  if (res.error) {
    return res.error
  }
  if (res.chunks.length) {
    let buffer = []
    res.chunks.forEach(c => {
      buffer = buffer.concat(c.file)
    })
    return buffer[0].data
  }
  console.log(res)
}

export {
  sendRpcRequest,
  startRpcSession,
  stopRpcSession,
  storageList,
  storageRead
}
