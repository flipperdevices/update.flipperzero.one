import { PB } from './proto-compiled'
import * as protobuf from 'protobufjs/minimal'

function createRequest (commandId, requestType, args) {
  const options = {
    commandId: commandId
  }
  options[requestType] = args
  const message = PB.Main.create(options)
  return new Uint8Array(PB.Main.encodeDelimited(message).finish())
}

function parseResponse (data) {
  const reader = protobuf.Reader.create(data)
  const res = []
  while (reader.pos < reader.len) {
    const chunk = PB.Main.decodeDelimited(reader)
    res.push(chunk)
  }
  return res
}

export {
  createRequest,
  parseResponse
}
