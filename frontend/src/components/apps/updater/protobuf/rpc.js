import { PB } from './proto-compiled'
import * as protobuf from 'protobufjs/minimal'

const commandQueue = [
  {
    commandId: 0,
    requestType: 'unsolicited',
    chunks: [],
    error: undefined
  }
]

function createRequest (requestType, args, hasNext, commandId) {
  const options = {
    commandId: commandId || commandQueue.length
  }
  options[requestType] = args
  if (hasNext) {
    options.hasNext = hasNext
  }

  const command = commandQueue.find(c => c.commandId === options.commandId)
  if (!command) {
    commandQueue.push({
      commandId: options.commandId,
      requestType: requestType,
      args: hasNext ? [args] : args,
      chunks: [],
      resolved: false,
      error: undefined
    })
  }

  const message = PB.Main.create(options)
  return { data: new Uint8Array(PB.Main.encodeDelimited(message).finish()), commandId: options.commandId }
}

function parseResponse (data) {
  const reader = protobuf.Reader.create(data)
  let command
  while (reader.pos < reader.len) {
    const res = PB.Main.decodeDelimited(reader)
    command = commandQueue.find(c => c.commandId === res.commandId)

    if (res.commandStatus && res.commandStatus !== 0 && res.commandStatus !== 6) {
      command.resolved = true
      command.error = Object.keys(PB.CommandStatus).find(key => PB.CommandStatus[key] === res.commandStatus)
      return command
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
  return command
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
