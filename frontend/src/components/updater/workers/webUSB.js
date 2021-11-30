import { WebDFU } from 'dfu'

onmessage = function (event) {
  switch (event.data.operation) {
    case 'connect':
      connect()
      break
    case 'disconnect':
      disconnect()
      break
    case 'write':
      write(event.data.data)
      break
    case 'read':
      read()
      break
  }
}

let device
let webdfu

async function connect () {
  try {
    const filters = [
      { vendorId: 0x0483, productId: 0xdf11 }
    ]
    const devices = await navigator.usb.getDevices({ filters })
    device = devices[0]

    await device.open()

    webdfu = new WebDFU(
      device,
      {
        forceInterfacesName: true
      }
    )

    await webdfu.init()

    if (webdfu.interfaces.length === 0) {
      throw new Error('The selected device does not have any USB DFU interfaces')
    }

    await webdfu.connect(0)

    self.postMessage({
      operation: 'connect',
      status: 1
    })
  } catch (error) {
    self.postMessage({
      operation: 'connect',
      status: 0,
      error: error
    })
  }
}

async function disconnect () {
  try {
    const status = await webdfu.getStatus()
    if (status.state !== 2) {
      webdfu.abort()
    }

    const payload = new ArrayBuffer(4 + 1)
    const view = new DataView(payload)
    view.setUint8(0, 0x21)
    view.setUint32(1, 0x080fffff, true)
    await webdfu.device.controlTransferOut(
      {
        requestType: 'class',
        recipient: 'interface',
        request: 0x01,
        value: 0,
        index: 0
      },
      payload
    )

    await webdfu.poll_until((state) => state !== 4)

    await webdfu.device.controlTransferOut(
      {
        requestType: 'class',
        recipient: 'interface',
        request: 0x01,
        value: 0,
        index: 0
      },
      new ArrayBuffer(0)
    )
    try {
      await webdfu.poll_until((state) => state !== 4)
      webdfu.abort()
      await webdfu.getStatus()
    } catch (error) {
      if (!error.includes('DFU GETSTATUS failed')) {
        throw error
      }
    }
    self.postMessage({
      operation: 'disconnect',
      status: 1
    })
  } catch (error) {
    self.postMessage({
      operation: 'disconnect',
      status: 0,
      error: error
    })
  }
}

async function write ({ file, startAddress }) {
  try {
    const progress = {
      current: 0,
      max: 1,
      stage: 0
    }
    const writeTime = {
      erase: Date.now(),
      write: 0
    }

    webdfu.dfuseStartAddress = Number('0x' + startAddress)
    const process = webdfu.write(1024, file, false)

    const logProgress = setInterval(() => {
      self.postMessage({
        operation: 'log progress',
        data: progress
      })
    }, 50)

    process.events.on('erase/process', (bytesSent, expectedSize) => {
      progress.current = bytesSent
      progress.max = expectedSize
    })

    process.events.on('erase/end', () => {
      writeTime.erase = Date.now() - writeTime.erase
      writeTime.write = Date.now()
      progress.current = 0
      progress.stage = 1
    })

    process.events.on('write/process', (bytesSent, expectedSize) => {
      progress.current = bytesSent
      progress.max = expectedSize
    })

    process.events.on('write/end', async () => {
      writeTime.write = Date.now() - writeTime.write
      console.log(`⎢ ⎢ erased in ${writeTime.erase}ms, wrote in ${writeTime.write}ms, total ${writeTime.erase + writeTime.write}ms`)
      clearInterval(logProgress)
      await disconnect()
      self.postMessage({
        operation: 'write',
        status: 1
      })
    })

    process.events.on('error', (error) => {
      if (!error.message.includes('DFU GETSTATUS failed')) {
        self.postMessage({
          operation: 'write',
          status: 0,
          error: error
        })
      }
    })
  } catch (error) {
    self.postMessage({
      operation: 'read',
      status: 0,
      error: error
    })
  }
}

async function read () {
  try {
    await webdfu.connect(2)

    webdfu.dfuseStartAddress = Number('0x1fff7000')
    const process = webdfu.read(128, 128)

    process.events.on('error', (error) => {
      throw error
    })

    process.events.on('end', async (blob) => {
      await webdfu.connect(0)

      self.postMessage({
        operation: 'read',
        status: 1,
        data: blob
      })
    })
  } catch (error) {
    self.postMessage({
      operation: 'read',
      status: 0,
      error: error
    })
  }
}
