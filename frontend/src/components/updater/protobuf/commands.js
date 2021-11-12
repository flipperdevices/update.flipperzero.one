import * as rpc from './rpc'
import { emitter } from '../core'
import { sleep } from '../util'

let flipper

async function sendRpcRequest (requestType, args, hasNext, commandId) {
  let buffer = new Uint8Array(0)

  const unbind = emitter.on('raw output', data => {
    const newBuffer = new Uint8Array(buffer.length + data.length)
    newBuffer.set(buffer)
    newBuffer.set(data, buffer.length)
    buffer = newBuffer
  })

  const req = rpc.createRequest(requestType, args, hasNext, commandId)
  await flipper.write('raw', req.data)

  if (!hasNext) {
    let oldLength = 0, newLength = 1
    while (oldLength < newLength) {
      await sleep(350)
      oldLength = newLength
      newLength = buffer.length
    }
  }

  let res

  if (buffer.length) {
    res = rpc.parseResponse(buffer)
    buffer = new Uint8Array(0)
  } else {
    return { commandId: req.commandId }
  }

  unbind()
  return res
}

async function startRpcSession (f) {
  flipper = f
  await flipper.write('cli', 'start_rpc_session\r')
  flipper.read('raw')
  await sleep(600)
  return sendRpcRequest('pingRequest', {})
}

async function stopRpcSession () {
  await flipper.closeReader()
  await sendRpcRequest('stopSession', {})
  rpc.flushCommandQueue()
  await sleep(600)
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
    let buffer = new Uint8Array(0)
    res.chunks.forEach(c => {
      const newBuffer = new Uint8Array(buffer.length + c.file.data.length)
      newBuffer.set(buffer)
      newBuffer.set(c.file.data, buffer.length)
      buffer = newBuffer
    })
    return buffer
  }
}

async function storageWrite (path, buffer) {
  let commandId, res
  const file = new Uint8Array(buffer)
  for (let i = 0; i < file.byteLength; i += 512) {
    await sleep(400)
    const chunk = file.slice(i, i + 512)
    res = await sendRpcRequest(
      'storageWriteRequest',
      {
        path: path,
        file: { data: chunk }
      },
      chunk.byteLength === 512,
      commandId
    )
    commandId = res.commandId
  }
  return res
}

async function storageMkdir (path) {
  return await sendRpcRequest('storageMkdirRequest', { path: path })
}

async function storageDelete (path, isRecursive) {
  return await sendRpcRequest('storageDeleteRequest', { path: path, recursive: isRecursive })
}

export {
  sendRpcRequest,
  startRpcSession,
  stopRpcSession,
  storageList,
  storageRead,
  storageWrite,
  storageMkdir,
  storageDelete
}
