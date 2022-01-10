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
    btMac: undefined,
    otpVer: undefined,
    sdCardMounted: true,
    rpcVer: 0
  }

  lines.forEach(line => {
    if (line.includes('State of Charge: ')) {
      properties.battery = line.match(/State of Charge: (\d){1,3}%/g)[0].slice(-4).trim()
      if (properties.battery[0] === ':') {
        properties.battery = properties.battery.slice(1)
      }
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
      properties.bodyColor = line.replace(/hardware_color\s*:\s/g, '').trim()
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
    // Legacy hell with boot/bootloader in different device_info versions
    if ((line.includes('boot_') || line.includes('bootloader_')) && line.includes('version')) {
      properties.bootloaderVer = line.replace(/boot(loader)?_version\s*:\s/g, '').trim()
      return
    }
    if ((line.includes('boot_') || line.includes('bootloader_')) && line.includes('commit')) {
      properties.bootloaderCommit = line.replace(/boot(loader)?_commit\s*:\s/g, '').trim()
      return
    }
    if ((line.includes('boot_') || line.includes('bootloader_')) && line.includes('build_date')) {
      properties.bootloaderBuild = line.replace(/boot(loader)?_build_date\s*:\s/g, '').trim()
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
    if (line.includes('hardware_otp_ver')) {
      properties.otpVer = line.replace(/hardware_otp_ver\s*:\s/g, '').trim()
    }

    if (line.includes('rpc_version')) {
      properties.rpcVer = line.replace(/rpc_version\s*:\s/g, '').trim()
    }

    if (line.includes('Storage error: internal error')) {
      properties.sdCardMounted = false
    }
  })

  if (!properties.otpVer) {
    properties.otpVer = 1
  }

  properties.radioFusFirmware = properties.radioFusFirmware.major + '.' +
    properties.radioFusFirmware.minor + '.' +
    properties.radioFusFirmware.sub

  properties.radioFirmware = properties.radioFirmware.major + '.' +
    properties.radioFirmware.minor + '.' +
    properties.radioFirmware.sub

  return parseEnums(properties)
}

// USB utils

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
    name: otp.name,
    hardwareVer: otp.boardInfo.version,
    target: otp.boardInfo.target,
    bodyColor: otp.deviceInfo.color,
    otpVer: otp.header.version,
    region: otp.deviceInfo.region
  }

  return parseEnums(properties)
}

function parseEnums (properties) {
  switch (Number(properties.bodyColor)) {
    case 1:
      properties.bodyColor = 'black'
      break
    case 2:
      properties.bodyColor = 'white'
      break
    default:
      properties.bodyColor = 'unknown'
      break
  }

  switch (Number(properties.region)) {
    case 1:
      properties.region = 'EuRu'
      break
    case 2:
      properties.region = 'UsCaAu'
      break
    case 3:
      properties.region = 'Jp'
      break
    default:
      properties.region = 'unknown'
      break
  }

  return properties
}

export {
  sleep,
  waitForDevice,
  parseOutputText,
  parseOTPData
}
