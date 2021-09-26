onmessage = function (event) {
  switch (event.data.operation) {
    case 'connect':
      connect()
      break
    case 'disconnect':
      disconnect()
      break
    case 'read':
      read()
      break
    case 'write':
      write(event.data.data)
      break
  }
}

let port

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

async function write (lines) {
  if (lines[lines.length - 1] !== ('dfu' || 'reboot')) {
    lines.push('')
  }
  const encoder = new TextEncoder()
  const writer = port.writable.getWriter()
  lines.forEach(async line => {
    await writer.write(encoder.encode(line + '\r\n').buffer)
  })
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

async function read () {
  const reader = port.readable.getReader()
  const decoder = new TextDecoder()
  let buffer = new Uint8Array(0)
  let readComplete = false

  while (!readComplete) {
    await reader.read().then(({ done, value }) => {
      if (done) {
        readComplete = true
      } else {
        const newBuffer = new Uint8Array(buffer.length + value.length)
        newBuffer.set(buffer)
        newBuffer.set(value, buffer.length)
        buffer = newBuffer

        if (decoder.decode(buffer.slice(-12)).replace(/\s/g, '').endsWith('>:\x07>:\x07')) {
          readComplete = true
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
