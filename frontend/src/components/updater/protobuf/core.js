import * as rpc from './rpc'
import { emitter } from '../updater/core'
import { sleep } from './updater/util'

async function sendRpcRequest (flipper, requestType, args, isIncremental) {
  let buffer = new Uint8Array(0)

  const unbind = emitter.on('raw output', data => {
    const newBuffer = new Uint8Array(buffer.length + data.length)
    newBuffer.set(buffer)
    newBuffer.set(data, buffer.length)
    buffer = newBuffer
  })

  const req = rpc.createRequest(requestType, args, isIncremental)
  await flipper.write('raw', req)

  let oldLength = 0, newLength = 1
  while (oldLength < newLength) {
    await sleep(350)
    oldLength = newLength
    newLength = buffer.length
  }

  if (buffer.length) {
    console.log(rpc.parseResponse(buffer))
    buffer = new Uint8Array(0)
  } else {
    console.log('No response for', requestType)
  }

  unbind()
}

export {
  sendRpcRequest
}
