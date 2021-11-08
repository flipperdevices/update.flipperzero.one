onmessage = function (event) {
  switch (event.data.operation) {
    case 'connect':
      connect()
      break
    case 'disconnect':
      disconnect()
      break
    case 'read':
      read(event.data.data)
      break
    case 'stop reading':
      reader.cancel()
      break
    case 'write':
      write(event.data.data)
      break
  }
}

let port, reader, readComplete = false

async function connect () {
  const filters = [
    { usbVendorId: 0x0483, usbProductId: 0x5740 }
  ]
  const ports = await navigator.serial.getPorts({ filters })
  port = ports[0]
  port.open({
    baudRate: 1
  })
    .then(() => {
      self.postMessage({
        operation: 'connect',
        status: 1
      })
    })
    .catch(error => {
      self.postMessage({
        operation: 'connect',
        status: 0,
        error: error
      })
    })
}

function disconnect () {
  if (port && !port.closed) {
    port.close()
      .then(() => {
        self.postMessage({
          operation: 'disconnect',
          status: 1
        })
      })
      .catch(error => {
        if (!(error.message && error.message.includes('The port is already closed.'))) {
          self.postMessage({
            operation: 'disconnect',
            status: 0,
            error: error
          })
        }
      })
  }
}

async function write ({ mode, data }) {
  const writer = port.writable.getWriter()

  if (mode.startsWith('cli')) {
    if (mode === 'cli/delimited') {
      data.push('\r\n')
    }
    const encoder = new TextEncoder()
    data.forEach(async (line, i) => {
      let message = line
      if (data[i + 1]) {
        message = line + '\r\n'
      }
      await writer.write(encoder.encode(message).buffer)
    })
  } else if (mode === 'raw') {
    await writer.write(data.buffer)
  } else {
    throw new Error('Unknown write mode:', mode)
  }

  writer.close()
    .then(() => {
      self.postMessage({
        operation: 'write',
        status: 1
      })
    })
    .catch(error => {
      self.postMessage({
        operation: 'write',
        status: 0,
        error: error
      })
    })
}

async function read (mode) {
  reader = port.readable.getReader()
  const decoder = new TextDecoder()
  let buffer = new Uint8Array(0)
  readComplete = false

  while (!readComplete) {
    await reader.read().then(({ done, value }) => {
      if (done) {
        readComplete = true
      } else {
        if (mode === 'cli') {
          self.postMessage({
            operation: 'log cli output',
            data: decoder.decode(value)
          })
        } else {
          const newBuffer = new Uint8Array(buffer.length + value.length)
          newBuffer.set(buffer)
          newBuffer.set(value, buffer.length)
          buffer = newBuffer

          if (decoder.decode(buffer.slice(-12)).replace(/\s/g, '').endsWith('>:\x07>:\x07')) {
            readComplete = true
          }
        }
      }
    })
  }
  await reader.cancel()
    .then(() => {
      self.postMessage({
        operation: 'read',
        status: 1,
        data: buffer
      })
    })
    .catch(error => {
      self.postMessage({
        operation: 'read',
        status: 0,
        error: error
      })
    })
}
