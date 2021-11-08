import { PB } from './proto-compiled'

function createRequest (commandId, requestType, args) {
  const options = {
    commandId: commandId
  }
  options[requestType] = args
  const req = PB.Main.create(options)
  return new Uint8Array(PB.Main.encode(req).finish())
}

export {
  createRequest
}
