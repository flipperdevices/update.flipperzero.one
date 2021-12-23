import * as rpc from './rpc'
import { emitter } from '../../../core/core'
import { sleep } from '../../../util'

let flipper, rpcIdle = true
const commandQueue = []

function enqueue (c) {
  commandQueue.push(c)
  if (rpcIdle) {
    sendRpcRequest()
  }
}

async function sendRpcRequest () {
  rpcIdle = false

  while (commandQueue.length) {
    const c = commandQueue[0]

    const req = rpc.createRequest(c.requestType, c.args, c.hasNext, c.commandId)
    await flipper.write('raw', req.data)

    let res = { commandId: req.commandId }

    if (!c.hasNext && c.requestType !== 'stopSession') {
      let buffer = new Uint8Array(0)
      const unbind = emitter.on('raw output', data => {
        const newBuffer = new Uint8Array(buffer.length + data.length)
        newBuffer.set(buffer)
        newBuffer.set(data, buffer.length)
        buffer = newBuffer
      })
      let oldLength = 0, newLength = 1
      while (oldLength < newLength) {
        await sleep(350)
        oldLength = newLength
        newLength = buffer.length
      }
      if (buffer.length) {
        res = rpc.parseResponse(buffer)
        buffer = new Uint8Array(0)
      }
      unbind()
      emitter.emit('response', res)
    } else {
      const unbind = emitter.on('write/end', () => {
        emitter.emit('response', res)
        unbind()
      })
    }
    commandQueue.shift()
  }

  rpcIdle = true
}

async function startRpcSession (f) {
  flipper = f
  await sleep(600)
  await flipper.write('cli', 'start_rpc_session\r')
  flipper.read('raw')
  await sleep(600)
  return ping()
}

function stopRpcSession () {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'stopSession',
      args: {}
    })
    const unbind = emitter.on('response', async () => {
      await flipper.closeReader()
      rpc.flushCommandQueue()
      resolve()
      unbind()
    })
  })
}

function ping () {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'systemPingRequest',
      args: {}
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        resolve(res)
      }
      unbind()
    })
  })
}

function storageList (path) {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'storageListRequest',
      args: { path: path }
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        if (res.chunks && res.chunks.length) {
          let buffer = []
          res.chunks.forEach(c => {
            buffer = buffer.concat(c.file)
          })
          resolve(buffer)
        }
        resolve('empty response')
      }
      unbind()
    })
  })
}

function storageRead (path) {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'storageReadRequest',
      args: { path: path }
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        if (res.chunks.length) {
          let buffer = new Uint8Array(0)
          res.chunks.forEach(c => {
            const newBuffer = new Uint8Array(buffer.length + c.file.data.length)
            newBuffer.set(buffer)
            newBuffer.set(c.file.data, buffer.length)
            buffer = newBuffer
          })
          resolve(buffer)
        }
        resolve('empty response')
      }
      unbind()
    })
  })
}

async function storageWrite (path, buffer) {
  let commandId, lastRes
  const file = new Uint8Array(buffer)
  for (let i = 0; i < file.byteLength; i += 512) {
    const chunk = file.slice(i, i + 512)
    const write = new Promise((resolve, reject) => {
      enqueue({
        requestType: 'storageWriteRequest',
        args: { path: path, file: { data: chunk } },
        hasNext: chunk.byteLength === 512,
        commandId: commandId
      })
      const unbind = emitter.on('response', res => {
        if (res && res.error) {
          reject(res.error, res)
        } else {
          resolve(res)
        }
        unbind()
      })
    })
    await write
      .then(res => {
        lastRes = res
        commandId = res.commandId
      })
  }
  return lastRes
}

function storageMkdir (path) {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'storageMkdirRequest',
      args: { path: path }
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        resolve(res)
      }
      unbind()
    })
  })
}

function storageDelete (path, isRecursive) {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'storageDeleteRequest',
      args: { path: path, recursive: isRecursive }
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        resolve(res)
      }
      unbind()
    })
  })
}

function guiStartVirtualDisplay (firstFrame) {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'guiStartVirtualDisplayRequest',
      args: {
        firstFrame: firstFrame
      }
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        resolve(res)
      }
      unbind()
    })
  })
}

function guiStopVirtualDisplay () {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'guiStopVirtualDisplayRequest',
      args: {}
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        resolve(res)
      }
      unbind()
    })
  })
}

function guiScreenFrame (data) {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'guiScreenFrame',
      args: {
        data: data
      }
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        resolve(res)
      }
      unbind()
    })
  })
}

function guiSendInputEvent (key, type) {
  return new Promise((resolve, reject) => {
    enqueue({
      requestType: 'guiSendInputEventRequest',
      args: {
        key: key,
        type: type
      }
    })
    const unbind = emitter.on('response', res => {
      if (res && res.error) {
        reject(res.error, res)
      } else {
        resolve(res)
      }
      unbind()
    })
  })
}

export {
  enqueue,
  sendRpcRequest,
  startRpcSession,
  stopRpcSession,
  storageList,
  storageRead,
  storageWrite,
  storageMkdir,
  storageDelete,
  guiStartVirtualDisplay,
  guiStopVirtualDisplay,
  guiScreenFrame,
  guiSendInputEvent
}
