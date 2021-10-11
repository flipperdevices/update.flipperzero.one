import { waitForDevice } from './util'
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
      throw new Error('Wrong connection type')
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
      throw new Error('Wrong connection state')
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

// Serial utils

function parseOutputText (text) {
  const lines = text.split(/\r?\n/)

  const properties = {
    type: undefined,
    battery: undefined,
    name: undefined,
    stm32Serial: undefined,
    bodyColor: undefined,
    region: undefined,
    hardwareVer: undefined,
    target: undefined,
    firmwareVer: undefined,
    firmwareCommit: undefined,
    firmwareBuild: undefined,
    bootloaderVer: undefined,
    bootloaderCommit: undefined,
    bootloaderBuild: undefined,
    radioFusFirmware: {
      major: undefined,
      minor: undefined,
      sub: undefined
    },
    radioFirmware: {
      major: undefined,
      minor: undefined,
      sub: undefined
    },
    btMac: undefined
  }

  lines.forEach(line => {
    if (line.includes('State of Charge: ')) {
      properties.battery = line.match(/State of Charge: (\d){1,3}%/g)[0].slice(-4).trim()
      return
    }

    if (line.includes('hardware_model')) {
      properties.type = line.replace(/hardware_model\s*:\s/g, '').trim()
      return
    }
    if (line.includes('hardware_name')) {
      properties.name = line.replace(/hardware_name\s*:\s/g, '').trim()
      return
    }
    if (line.includes('hardware_uid')) {
      properties.stm32Serial = line.replace(/hardware_uid\s*:\s/g, '').trim()
      return
    }
    if (line.includes('hardware_color')) {
      const color = line.replace(/hardware_color\s*:\s/g, '').trim()
      switch (color) {
        case '0':
          properties.bodyColor = 'white'
          break
        case '1':
          properties.bodyColor = 'black'
          break
      }
      return
    }
    if (line.includes('hardware_region')) {
      properties.region = line.replace(/hardware_region\s*:\s/g, '').trim()
      return
    }
    if (line.includes('hardware_ver')) {
      properties.hardwareVer = line.replace(/hardware_ver\s*:\s/g, '').trim()
      return
    }
    if (line.includes('hardware_target')) {
      properties.target = line.replace(/hardware_target\s*:\s/g, '').trim()
      return
    }
    if (line.includes('firmware_version')) {
      properties.firmwareVer = line.replace(/firmware_version\s*:\s/g, '').trim()
      return
    }
    if (line.includes('firmware_commit')) {
      properties.firmwareCommit = line.replace(/firmware_commit\s*:\s/g, '').trim()
      return
    }
    if (line.includes('firmware_build_date')) {
      properties.firmwareBuild = line.replace(/firmware_build_date\s*:\s/g, '').trim()
      return
    }
    if (line.includes('boot_version')) {
      properties.bootloaderVer = line.replace(/boot_version\s*:\s/g, '').trim()
      return
    }
    if (line.includes('boot_commit')) {
      properties.bootloaderCommit = line.replace(/boot_commit\s*:\s/g, '').trim()
      return
    }
    if (line.includes('boot_build_date')) {
      properties.bootloaderBuild = line.replace(/boot_build_date\s*:\s/g, '').trim()
      return
    }
    if (line.includes('radio_fus_major')) {
      properties.radioFusFirmware.major = line.replace(/radio_fus_major\s*:\s/g, '').trim()
      return
    }
    if (line.includes('radio_fus_minor')) {
      properties.radioFusFirmware.minor = line.replace(/radio_fus_minor\s*:\s/g, '').trim()
      return
    }
    if (line.includes('radio_fus_sub')) {
      properties.radioFusFirmware.sub = line.replace(/radio_fus_sub\s*:\s/g, '').trim()
      return
    }
    if (line.includes('radio_stack_major')) {
      properties.radioFirmware.major = line.replace(/radio_stack_major\s*:\s/g, '').trim()
      return
    }
    if (line.includes('radio_stack_minor')) {
      properties.radioFirmware.minor = line.replace(/radio_stack_minor\s*:\s/g, '').trim()
      return
    }
    if (line.includes('radio_stack_sub')) {
      properties.radioFirmware.sub = line.replace(/radio_stack_sub\s*:\s/g, '').trim()
      return
    }
    if (line.includes('radio_ble_mac')) {
      properties.btMac = line.replace(/radio_ble_mac\s*:\s/g, '').trim()
    }
  })

  properties.radioFusFirmware = properties.radioFusFirmware.major + '.' +
    properties.radioFusFirmware.minor + '.' +
    properties.radioFusFirmware.sub

  properties.radioFirmware = properties.radioFirmware.major + '.' +
    properties.radioFirmware.minor + '.' +
    properties.radioFirmware.sub

  return properties
}

// USB utils

async function parseOTPData (blob) {
  const otp = new Uint8Array(await blob.arrayBuffer())

  const properties = {
    name: undefined,
    hardwareVer: undefined,
    target: undefined,
    bodyColor: undefined
  }
  properties.name = 'undefined'
  properties.hardwareVer = 'undefined'
  properties.target = 'undefined'
  properties.bodyColor = 'undefined'

  if (otp[0] === 190 && otp[1] === 186) {
    properties.hardwareVer = otp[8]
    properties.target = otp[9]
    properties.bodyColor = otp[12] ? 'black' : 'white'
    properties.name = new TextDecoder().decode(otp.slice(16, 24).filter(e => e > 0))
  } else {
    properties.hardwareVer = otp[0]
    properties.target = otp[1]
    properties.name = new TextDecoder().decode(otp.slice(8, 16).filter(e => e > 0))
  }
  return properties
}
