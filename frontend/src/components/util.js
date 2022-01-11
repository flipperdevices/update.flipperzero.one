async function sleep (ms) {
  const sleepPromise = new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
  return await sleepPromise
}

async function waitForDevice (c) {
  const usbFilters = [{ vendorId: 0x0483, productId: 0x5740 }]
  const serialFilters = [{ usbVendorId: 0x0483, usbProductId: 0x5740 }]
  for (let i = 0; i < 20; i++) {
    let ports = []
    if (c === 'rebooted to serial') {
      ports = await navigator.serial.getPorts({ serialFilters })
    } else if (c === 'rebooted to usb') {
      ports = await navigator.usb.getDevices({ usbFilters })
    }
    if (ports.length > 0) {
      await sleep(500)
      return
    }
    await sleep(350)
  }
}

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

async function parseOTPData (blob) {
  const otp = {
    data: new Uint8Array(await blob.arrayBuffer()),
    header: {
      magic: undefined,
      version: undefined,
      reserved: undefined,
      timestamp: undefined
    },
    boardInfo: {
      version: undefined,
      target: undefined,
      body: undefined,
      connect: undefined,
      display: undefined
    },
    deviceInfo: {
      color: undefined,
      region: undefined
    },
    name: undefined
  }

  if (otp.data[0] === 190 && otp.data[1] === 186) {
    otp.header.magic = otp.data.slice(0, 2)
    otp.header.version = otp.data[2]
    otp.header.reserved = otp.data[3]
    otp.header.timestamp = otp.data.slice(4, 8).join('')

    otp.boardInfo.version = otp.data[8]
    otp.boardInfo.target = otp.data[9]
    otp.boardInfo.body = otp.data[10]
    otp.boardInfo.connect = otp.data[11]

    if (otp.header.version === 1) {
      otp.boardInfo.display = 0
      otp.deviceInfo.color = otp.data[12]
      otp.deviceInfo.region = otp.data[13]
      otp.name = new TextDecoder().decode(otp.data.slice(16, 24).filter(e => e > 0))
    } else if (otp.header.version === 2) {
      otp.boardInfo.display = otp.data[12]
      otp.deviceInfo.color = otp.data[16]
      otp.deviceInfo.region = otp.data[17]
      otp.name = new TextDecoder().decode(otp.data.slice(24, 32).filter(e => e > 0))
    }
  } else {
    otp.header.version = 0
    otp.boardInfo.version = otp.data[0]
    otp.boardInfo.target = otp.data[1]
    otp.name = new TextDecoder().decode(otp.data.slice(8, 16).filter(e => e > 0))
  }

  const properties = {
    hardware_name: otp.name,
    hardware_ver: otp.boardInfo.version,
    hardware_target: otp.boardInfo.target,
    hardware_color: otp.deviceInfo.color,
    hardware_otp_ver: otp.header.version,
    hardware_region: otp.deviceInfo.region
  }

  return properties
}

export {
  sleep,
  waitForDevice,
  Operation,
  parseOTPData
}
