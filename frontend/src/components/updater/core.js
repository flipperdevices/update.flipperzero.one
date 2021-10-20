import {
  waitForDevice,
  parseOutputText,
  parseOTPData
} from './util'
class Operation {
  constructor () {
    this.resolve = undefined
    this.reject = undefined
  }

  create (worker, operation, data) {
    return new Promise((resolve, reject) => {
      worker.postMessage({ operation: operation, data: data })
      this.resolve = resolve
      this.reject = reject
    })
  }

  terminate (event) {
    if (event.status === 1) {
      this.resolve(event.data)
    } else {
      this.reject(event.error)
    }
  }
}

const operation = new Operation()

// Firmware erasing/writing progress
let progress = {
  current: 0,
  max: 1,
  stage: 0
}
const title = {
  string: 'Flipper Zero Update Page',
  progress: 0
}

const serial = new Worker(new URL('./webSerial.js', import.meta.url))
serial.onmessage = (event) => operation.terminate(event.data)

const usb = new Worker(new URL('./webUSB.js', import.meta.url))
usb.onmessage = (event) => {
  if (event.data.operation === 'log progress') {
    progress = event.data.data
    if (progress.stage === 1 && progress.max > 0 && (progress.current / (progress.max / 100)).toFixed() > title.progress) {
      title.progress = Math.floor(progress.current / (progress.max / 100))
      document.title = '(' + title.progress + '%) ' + title.string
    } else if (progress.stage === 0) {
      document.title = '(erasing) ' + title.string
    }
  } else {
    operation.terminate(event.data)
  }
}

export class Flipper {
  constructor () {
    this.state = {
      // 0: not connected
      // 1: waiting for connection
      // 2: connected to serial
      // 3: connected to usb
      connection: 0,
      // 0: error
      // 1: idle
      // 2: reading data
      // 3: writing data
      status: 1
    }
    this.properties = {}
    this.writeProgress = progress
  }

  async connect (connectionType) {
    this.state.connection = 1
    if (connectionType === 'serial') {
      const filters = [
        { usbVendorId: 0x0483, usbProductId: 0x5740 }
      ]
      const ports = await navigator.serial.getPorts({ filters })
      if (ports.length === 0) {
        this.state.connection = 0
        this.state.status = 0
        throw new Error('No known serial devices')
      }
      const connectSerial = operation.create(serial, 'connect')
      await connectSerial
        .catch(error => {
          this.state.connection = 0
          this.state.status = 0
          throw error
        })
      this.state.connection = 2
    } else if (connectionType === 'usb') {
      const filters = [
        { vendorId: 0x0483, productId: 0xdf11 }
      ]
      const ports = await navigator.usb.getDevices({ filters })
      if (ports.length === 0) {
        this.state.connection = 0
        this.state.status = 0
        throw new Error('No known usb devices')
      }
      const connectUSB = operation.create(usb, 'connect')
      await connectUSB
        .catch(error => {
          this.state.connection = 0
          this.state.status = 0
          throw error
        })
      this.state.connection = 3
    } else {
      throw new Error("Wrong connection type (flipper.connect): expected 'serial' or 'usb', got " + connectionType)
    }
  }

  async disconnect () {
    if (this.state.connection === 2 || this.state.connection === 0) {
      const disconnectSerial = operation.create(serial, 'disconnect')
      await disconnectSerial
        .catch(error => {
          this.state.status = 0
          throw error
        })
      this.state.connection = 0
    } else if (this.state.connection === 3) {
      const disconnectUSB = operation.create(usb, 'disconnect')
      await disconnectUSB
        .catch(error => {
          this.state.status = 0
          throw error
        })
      this.state.connection = 0
    } else if (this.state.connection === 1) {
      this.state.connection = 0
    } else {
      throw new Error('Wrong connection state')
    }
  }

  async readProperties () {
    if (this.state.connection === 2) {
      const writePropertiesData = operation.create(serial, 'write', ['power_info', 'device_info'])

      this.state.status = 3
      await writePropertiesData
        .catch(error => {
          this.state.status = 0
          throw error
        })

      const readPropertiesData = operation.create(serial, 'read')

      this.state.status = 2
      this.properties = await readPropertiesData
        .then(data => {
          this.state.status = 1
          const decoder = new TextDecoder()
          return decoder.decode(data)
        })
        .then(text => parseOutputText(text))
        .catch(error => {
          this.state.status = 0
          throw error
        })
      return this.properties
    } else if (this.state.connection === 3) {
      const readPropertiesData = operation.create(usb, 'read')

      this.state.status = 2
      await readPropertiesData
        .then(blob => {
          this.state.status = 1
          return parseOTPData(blob)
        })
        .then(properties => {
          this.properties = properties
        })
      return this.properties
    } else {
      throw new Error('Wrong connection state (flipper.readProperties): expected 2 or 3, got ' + this.state.connection)
    }
  }

  async write (data) {
    if (this.state.connection === 2) {
      const write = operation.create(serial, 'write', [data])

      this.state.status = 3
      await write
        .catch(error => {
          this.state.status = 0
          throw error
        })
    } else {
      throw new Error('Wrong connection state (flipper.write): expected 2, got ' + this.state.connection)
    }
  }

  async read () {
    if (this.state.connection === 2) {
      const read = operation.create(serial, 'read')

      this.state.status = 2
      const text = await read
        .then(data => {
          this.state.status = 1
          const decoder = new TextDecoder()
          return decoder.decode(data)
        })
        .catch(error => {
          this.state.status = 0
          throw error
        })

      return text
    } else {
      throw new Error('Wrong connection state (flipper.read): expected 2, got ' + this.state.connection)
    }
  }

  async reboot () {
    if (this.state.connection === 2) {
      const writeDFUCommand = operation.create(serial, 'write', ['dfu'])

      this.state.status = 3
      await writeDFUCommand
        .catch(error => {
          this.state.status = 0
          throw error
        })

      this.state.status = 1
      await this.disconnect()

      await waitForDevice('rebooted to usb')
      await this.connect('usb')
    } else if (this.state.connection === 3) {
      this.state.status = 1
      await this.disconnect()

      await waitForDevice('rebooted to serial')
      await this.connect('serial')
    }
  }

  async writeFirmware (firmware) {
    document.title = title.string
    const writeFirmware = operation.create(usb, 'write', firmware)

    this.state.status = 3
    const logProgress = setInterval(() => {
      this.writeProgress = progress
    }, 50)
    await writeFirmware
      .catch(error => {
        clearInterval(logProgress)
        this.state.status = 0
        throw error
      })
    clearInterval(logProgress)
    this.writeProgress.current = this.writeProgress.max
    document.title = '(100%) ' + title.string
    title.progress = 0
  }
}
