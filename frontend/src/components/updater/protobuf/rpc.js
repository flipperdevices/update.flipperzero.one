import { PB } from './proto-compiled'
import * as protobuf from 'protobufjs/minimal'

const commandQueue = [
  {
    commandId: 0,
    requestType: 'unsolicited',
    chunks: []
  }
]

function createRequest (requestType, args, hasNext) {
  const options = {
    commandId: commandQueue.length
  }
  options[requestType] = args

  if (!hasNext || (hasNext && commandQueue[commandQueue.length - 1].requestType === requestType)) {
    commandQueue.push({
      commandId: options.commandId,
      requestType: requestType,
      args: args,
      chunks: [],
      resolved: false,
      error: undefined
    })
  }

  const message = PB.Main.create(options)
  return new Uint8Array(PB.Main.encodeDelimited(message).finish())
}

function parseResponse (data) {
  const reader = protobuf.Reader.create(data)
  while (reader.pos < reader.len) {
    const res = PB.Main.decodeDelimited(reader)
    const command = commandQueue.find(c => c.commandId === res.commandId)

    if (res.commandStatus && res.commandStatus !== 0) {
      command.resolved = true
      command.error = Object.keys(PB.CommandStatus).find(key => PB.CommandStatus[key] === res.commandStatus)
    } else if (res.empty) {
      command.resolved = true
    } else {
      if (!res.hasNext) {
        command.resolved = true
      }
      const payload = res[Object.keys(res).find(k => k === command.requestType.replace('Request', 'Response'))]
      command.chunks.push(payload)
    }
  }
  return commandQueue
}

function flushCommandQueue () {
  while (commandQueue.length > 1) {
    commandQueue.pop()
  }
}

export {
  createRequest,
  parseResponse,
  flushCommandQueue
}
