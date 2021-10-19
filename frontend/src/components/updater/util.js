async function sleep (ms) {
  const sleepPromise = new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
  return await sleepPromise
}

async function waitForDevice (c) {
  const usbFilters = [{ vendorId: 0x0483, productId: 0x5740 }]
  const serialFilters = [{ usbVendorId: 0x0483, usbProductId: 0x5740 }]
  for (let i = 0; i < 10; i++) {
    let ports = []
    if (c === 'rebooted to serial') {
      ports = await navigator.serial.getPorts({ serialFilters })
    } else if (c === 'rebooted to usb') {
      ports = await navigator.usb.getDevices({ usbFilters })
    }
    if (ports.length > 0) {
      await sleep(2000)
      return
    }
    await sleep(350)
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

export {
  sleep,
  waitForDevice,
  parseOutputText,
  parseOTPData
}
